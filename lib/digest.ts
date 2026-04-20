/**
 * "This week" digest — a short synthesized summary of the last 7 days of
 * events, meds, and vitals. Uses Claude when available, otherwise falls
 * back to a shape-matching summary derived from the rule-based
 * `summary` intent.
 *
 * Contract mirrors the other seams in `lib/`: a single async function,
 * never throws, reports its source. The UI renders identically whether
 * the bullets came from Claude or rules — only the pill differs.
 */

import { detect } from "./anomalies";
import type { AskSnapshot } from "./ask-parser";
import { answer } from "./ask-parser";
import { callClaudeTool, ClaudeUnavailableError } from "./claude";
import {
  DIGEST_SYSTEM_PROMPT,
  DIGEST_TOOL,
} from "./claude-prompts";

export type DigestSource =
  | "claude"
  | "fallback-no-key"
  | "fallback-error"
  | "fallback-rules";

export type DigestTag = "scam" | "med" | "help" | "family" | "ride" | "ok";

export interface DigestResult {
  headline: string;
  bullets: string[];
  highlights?: { tag: DigestTag; label: string }[];
}

export interface DigestResultWithSource extends DigestResult {
  source: DigestSource;
  computedAt: number;
}

function rulesFallback(snap: AskSnapshot): DigestResult {
  // Route through the existing summary intent so Home + Timeline render
  // identical content whether Claude is off or on.
  const summary = answer("how is this week going?", snap);
  const blocked = snap.events.filter(
    (e) => e.variant === "scam" && /blocked/i.test(e.title)
  ).length;
  const help = snap.events.filter((e) => e.id.startsWith("help-")).length;
  const anomalies = detect({ connected: snap.connected, meds: snap.meds });
  const highlights: DigestResult["highlights"] = [];
  if (blocked > 0)
    highlights.push({
      tag: "scam",
      label: `${blocked} scam${blocked === 1 ? "" : "s"} blocked`,
    });
  if (help > 0)
    highlights.push({
      tag: "help",
      label: `${help} help request${help === 1 ? "" : "s"}`,
    });
  for (const a of anomalies.slice(0, 2)) {
    highlights.push({ tag: a.id.startsWith("med") ? "med" : "scam", label: a.title });
  }
  return {
    headline: summary.headline,
    bullets: summary.bullets ?? [],
    highlights,
  };
}

function parseDigestTool(input: unknown): DigestResult {
  if (typeof input !== "object" || input === null)
    throw new Error("not-object");
  const o = input as Record<string, unknown>;
  if (typeof o.headline !== "string") throw new Error("headline");
  const bullets = Array.isArray(o.bullets)
    ? o.bullets.filter((b): b is string => typeof b === "string")
    : [];
  if (bullets.length < 3 || bullets.length > 5)
    throw new Error("bullets-count");
  const highlights: DigestResult["highlights"] = Array.isArray(o.highlights)
    ? (o.highlights as unknown[]).flatMap((raw) => {
        if (typeof raw !== "object" || raw === null) return [];
        const r = raw as Record<string, unknown>;
        if (typeof r.label !== "string") return [];
        const t = r.tag;
        const validTag =
          t === "scam" || t === "med" || t === "help" || t === "family" || t === "ride" || t === "ok";
        if (!validTag) return [];
        return [{ tag: t as DigestTag, label: r.label }];
      })
    : undefined;
  return { headline: o.headline, bullets, highlights };
}

function snapshotJson(snap: AskSnapshot): string {
  const anomalies = detect({ connected: snap.connected, meds: snap.meds });
  return JSON.stringify({
    events: snap.events.map((e) => ({
      variant: e.variant,
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
    connected: Array.from(snap.connected),
    anomalies: anomalies.map((a) => ({
      title: a.title,
      severity: a.severity,
    })),
  });
}

export async function buildDigest(
  snap: AskSnapshot
): Promise<DigestResultWithSource> {
  const now = Date.now();
  const fallback = (source: DigestSource): DigestResultWithSource => ({
    ...rulesFallback(snap),
    source,
    computedAt: now,
  });

  try {
    const result = await callClaudeTool<DigestResult>({
      system: DIGEST_SYSTEM_PROMPT,
      user: `Synthesize a 'this week' digest from the snapshot below.\n\n${snapshotJson(snap)}`,
      tool: DIGEST_TOOL as unknown as Parameters<
        typeof callClaudeTool<DigestResult>
      >[0]["tool"],
      parse: parseDigestTool,
      max_tokens: 500,
    });
    return { ...result, source: "claude", computedAt: now };
  } catch (err) {
    if (
      err instanceof ClaudeUnavailableError &&
      err.reason === "no-key"
    ) {
      return fallback("fallback-no-key");
    }
    if (typeof console !== "undefined" && err instanceof Error) {
      console.warn("[claude/digest] fallback:", err.message);
    }
    return fallback("fallback-error");
  }
}
