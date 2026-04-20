/**
 * Family-side natural-language Q&A. v1 is a rules-based parser that
 * classifies a free-text question into one of a few intents, then
 * pulls the answer out of the existing stores.
 *
 * The contract — `answer(question, snapshot) → AskResult` — is the
 * boundary that a real Claude API call slides into later. Same input,
 * same output, no UI changes.
 */

import type { MockEvent } from "./mock-events";
import type { Med } from "./store/meds";
import type { Member } from "./store/members";
import type { IntegrationProvider } from "./integrations";
import { detect } from "./anomalies";
import { TIMESERIES, average, latest } from "./timeseries";
import { callClaudeTool, ClaudeUnavailableError } from "./claude";
import { ASK_SYSTEM_PROMPT, ASK_TOOL } from "./claude-prompts";

export type AskIntent =
  | "scams"
  | "meds"
  | "help"
  | "appointments"
  | "vitals"
  | "members"
  | "connected"
  | "summary"
  | "unknown";

export interface AskResult {
  intent: AskIntent;
  /** Short headline answer. */
  headline: string;
  /** Optional supporting bullets / data rows. */
  bullets?: string[];
  /** Source descriptors so the answer is auditable. */
  sources?: string[];
}

export interface AskSnapshot {
  events: MockEvent[];
  meds: Med[];
  members: Member[];
  connected: Set<string>;
  providers: IntegrationProvider[];
}

const INTENT_RULES: ReadonlyArray<{ intent: AskIntent; re: RegExp }> = [
  { intent: "scams", re: /\b(scam|suspicious|fraud|spam|phish)/i },
  { intent: "meds", re: /\b(med|medication|pill|dose|dosed?|prescription|rx)/i },
  { intent: "help", re: /\b(help|ride|appointment|tech help|booking)/i },
  { intent: "appointments", re: /\b(appointment|doctor|visit|schedule|calendar)/i },
  { intent: "vitals", re: /\b(blood pressure|bp|sleep|heart rate|hr|steps|vital)/i },
  { intent: "members", re: /\b(who|family|caregiver|members)/i },
  { intent: "connected", re: /\b(connected|integrations?|services?|pharmacy|fitbit|cvs)/i },
  { intent: "summary", re: /\b(today|how is|how's|status|update|going|doing|week)/i },
];

export function classify(question: string): AskIntent {
  for (const r of INTENT_RULES) if (r.re.test(question)) return r.intent;
  return "unknown";
}

function fmtMeds(meds: Med[]) {
  const taken = meds.filter((m) => m.takenAt);
  return {
    taken: taken.length,
    total: meds.length,
    list: meds.map((m) =>
      m.takenAt
        ? `${m.name} ${m.dose} — taken at ${m.takenAt}`
        : `${m.name} ${m.dose} — due ${m.takeAt}`
    ),
  };
}

export function answer(question: string, snap: AskSnapshot): AskResult {
  const intent = classify(question);

  switch (intent) {
    case "scams": {
      const blocked = snap.events.filter(
        (e) => e.variant === "scam" && /blocked/i.test(e.title)
      );
      if (blocked.length === 0) {
        return {
          intent,
          headline: "No scams blocked yet — Protection layer is on.",
          sources: ["Protection feed"],
        };
      }
      return {
        intent,
        headline: `${blocked.length} message${blocked.length === 1 ? "" : "s"} blocked recently.`,
        bullets: blocked.slice(0, 3).map((e) => `${e.time ?? ""} · ${e.title}`),
        sources: ["Protection feed"],
      };
    }

    case "meds": {
      const m = fmtMeds(snap.meds);
      // Prefer measured adherence from a smart bottle when connected — it's
      // more reliable than self-reported taps.
      const smartBottle = snap.connected.has("pillsy")
        ? "pillsy"
        : snap.connected.has("adheretech")
          ? "adheretech"
          : null;
      if (smartBottle) {
        const series = TIMESERIES[smartBottle].adherencePct ?? [];
        const last = latest(series);
        const baseline = average(series.slice(0, -1));
        return {
          intent,
          headline:
            last != null
              ? `Measured adherence: ${last}% this week.`
              : "Measured adherence unavailable.",
          bullets: [
            ...m.list,
            `Baseline (6-day avg): ${baseline.toFixed(0)}%`,
          ],
          sources: [smartBottle === "pillsy" ? "Pillsy" : "AdhereTech"],
        };
      }
      return {
        intent,
        headline:
          m.taken === m.total
            ? `All ${m.total} doses taken today.`
            : `${m.taken} of ${m.total} doses taken so far today.`,
        bullets: m.list,
        sources: ["Medication tracker"],
      };
    }

    case "help": {
      const help = snap.events.filter((e) => e.id.startsWith("help-"));
      if (help.length === 0) {
        return {
          intent,
          headline: "No help requests today.",
          sources: ["Help in one tap"],
        };
      }
      return {
        intent,
        headline: `${help.length} help request${help.length === 1 ? "" : "s"} today.`,
        bullets: help.slice(0, 3).map((e) => `${e.time ?? ""} · ${e.title}`),
        sources: ["Help in one tap"],
      };
    }

    case "appointments": {
      const appt = snap.events.find((e) =>
        /appointment|doctor|tomorrow|10:30/i.test(`${e.title} ${e.body ?? ""}`)
      );
      if (appt) {
        return {
          intent,
          headline: appt.title,
          bullets: appt.body ? [appt.body] : undefined,
          sources: ["Family update feed"],
        };
      }
      return {
        intent,
        headline: "No upcoming appointments on the feed.",
        sources: ["Family update feed"],
      };
    }

    case "vitals": {
      const withings = snap.providers.find((p) => p.id === "withings");
      const apple = snap.providers.find((p) => p.id === "apple-health");
      const lines: string[] = [];
      if (snap.connected.has("withings") && withings?.liveData) {
        for (const row of withings.liveData)
          lines.push(`${row.label}: ${row.value}`);
      }
      if (snap.connected.has("apple-health") && apple?.liveData) {
        for (const row of apple.liveData)
          lines.push(`${row.label}: ${row.value}`);
      }
      if (lines.length === 0) {
        return {
          intent,
          headline: "No vitals yet — connect Withings or Apple Health to see them.",
          sources: ["Health integrations"],
        };
      }
      const anomalies = detect({ connected: snap.connected, meds: snap.meds });
      const vitalAnomalies = anomalies.filter((a) =>
        ["bp-high", "bp-trend", "sleep-drop", "steps-low"].includes(a.id)
      );
      const headline =
        vitalAnomalies.length > 0
          ? vitalAnomalies[0].title
          : "Latest vitals from connected devices.";
      return {
        intent,
        headline,
        bullets: lines,
        sources: ["Withings", "Apple Health"].filter((s) =>
          snap.connected.has(s.toLowerCase().replace(/\s+/g, "-"))
        ),
      };
    }

    case "members": {
      return {
        intent,
        headline: `${snap.members.length} people in this family.`,
        bullets: snap.members.map((m) => `${m.name} — ${m.role}`),
        sources: ["Members"],
      };
    }

    case "connected": {
      const list = snap.providers.filter((p) => snap.connected.has(p.id));
      if (list.length === 0) {
        return {
          intent,
          headline: "Nothing connected yet.",
          sources: ["Integrations"],
        };
      }
      return {
        intent,
        headline: `${list.length} service${list.length === 1 ? "" : "s"} connected.`,
        bullets: list.map((p) => `${p.name} (${p.kind.toUpperCase()})`),
        sources: ["Integrations"],
      };
    }

    case "summary": {
      const m = fmtMeds(snap.meds);
      const blocked = snap.events.filter(
        (e) => e.variant === "scam" && /blocked/i.test(e.title)
      ).length;
      const help = snap.events.filter((e) => e.id.startsWith("help-")).length;
      const anomalies = detect({ connected: snap.connected, meds: snap.meds });
      const urgent = anomalies.filter((a) => a.severity === "urgent");
      const headline =
        urgent.length > 0
          ? `${urgent.length} thing${urgent.length === 1 ? "" : "s"} need${urgent.length === 1 ? "s" : ""} attention today.`
          : "Here’s today at a glance.";
      const bullets: string[] = [];
      for (const a of anomalies.slice(0, 2)) bullets.push(`⚠ ${a.title}`);
      bullets.push(`${m.taken}/${m.total} doses taken`);
      bullets.push(`${blocked} scam${blocked === 1 ? "" : "s"} blocked`);
      bullets.push(`${help} help request${help === 1 ? "" : "s"}`);
      return {
        intent,
        headline,
        bullets,
        sources: ["Daily summary"],
      };
    }

    default:
      return {
        intent: "unknown",
        headline:
          "I’m not sure yet. Try asking about meds, scams, help requests, vitals, or appointments.",
      };
  }
}

/**
 * The `source` field on `AskResult` tells the UI whether this answer came
 * from Claude (live) or the rule-based fallback. `fallback-*` reasons are
 * useful for debugging in the console but never surfaced to the user.
 */
export type AskSource =
  | "claude"
  | "fallback-no-key"
  | "fallback-error"
  | "fallback-rules";

export interface AskResultWithSource extends AskResult {
  source: AskSource;
}

/**
 * Build a compact JSON string of the snapshot to pass as the user message.
 * Keep it lean — only the fields the model actually needs to answer.
 */
function snapshotToJson(snap: AskSnapshot): string {
  const connectedList = Array.from(snap.connected);
  const anomalies = detect({ connected: snap.connected, meds: snap.meds });
  return JSON.stringify(
    {
      events: snap.events.map((e) => ({
        variant: e.variant,
        tag: e.tag,
        title: e.title,
        body: e.body,
        time: e.time,
      })),
      meds: snap.meds.map((m) => ({
        name: m.name,
        dose: m.dose,
        takeAt: m.takeAt,
        takenAt: m.takenAt ?? null,
      })),
      members: snap.members.map((m) => ({ name: m.name, role: m.role })),
      connected: connectedList,
      providers: snap.providers
        .filter((p) => snap.connected.has(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          kind: p.kind,
          liveData: p.liveData,
        })),
      anomalies: anomalies.map((a) => ({
        id: a.id,
        title: a.title,
        severity: a.severity,
      })),
    },
    null,
    0
  );
}

function parseAskTool(input: unknown): AskResult {
  if (typeof input !== "object" || input === null)
    throw new Error("not-object");
  const o = input as Record<string, unknown>;
  if (typeof o.intent !== "string") throw new Error("intent");
  if (typeof o.headline !== "string") throw new Error("headline");
  return {
    intent: o.intent as AskIntent,
    headline: o.headline,
    bullets: Array.isArray(o.bullets)
      ? o.bullets.filter((b): b is string => typeof b === "string")
      : undefined,
    sources: Array.isArray(o.sources)
      ? o.sources.filter((s): s is string => typeof s === "string")
      : undefined,
  };
}

/**
 * Try Claude first; fall back to the rules-based `answer()` on any
 * failure. Never throws — every code path produces a valid `AskResult`.
 * The `source` field tells the UI which path we took.
 */
export async function answerAsync(
  question: string,
  snap: AskSnapshot
): Promise<AskResultWithSource> {
  const localIntent = classify(question);
  const localFallback = (source: AskSource): AskResultWithSource => ({
    ...answer(question, snap),
    source,
  });

  try {
    const user = [
      `Question: ${question}`,
      `Local intent guess (hint, not authoritative): ${localIntent}`,
      `Snapshot:`,
      snapshotToJson(snap),
    ].join("\n");

    const result = await callClaudeTool<AskResult>({
      system: ASK_SYSTEM_PROMPT,
      user,
      tool: ASK_TOOL as unknown as Parameters<
        typeof callClaudeTool<AskResult>
      >[0]["tool"],
      parse: parseAskTool,
      max_tokens: 800,
    });
    return { ...result, source: "claude" };
  } catch (err) {
    if (
      err instanceof ClaudeUnavailableError &&
      err.reason === "no-key"
    ) {
      return localFallback("fallback-no-key");
    }
    if (typeof console !== "undefined" && err instanceof Error) {
      console.warn("[claude/ask] fallback:", err.message);
    }
    return localFallback("fallback-error");
  }
}

export const SUGGESTIONS = [
  "How is dad today?",
  "Did dad take his meds?",
  "Any scams blocked recently?",
  "What's his blood pressure?",
  "Any help requests today?",
  "When's the next appointment?",
] as const;
