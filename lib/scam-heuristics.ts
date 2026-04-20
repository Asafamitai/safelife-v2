/**
 * Tiny on-device scam classifier for the v1 demo.
 *
 * Keep this rules-based and easy to read — it's a stub so families can
 * see the shape of the product. A server-side model replaces this later.
 *
 * Three categories of signal:
 *   - URLs (especially shorteners or odd TLDs)
 *   - Money / payment-rail mentions (gift cards, crypto, wires)
 *   - Urgency / authority pressure ("act now", "your account will be")
 *
 * Scoring:
 *   0 hits → safe
 *   1 hit  → suspicious
 *   2+ hits OR any "strong" hit → scam
 */

import { callClaudeTool, ClaudeUnavailableError } from "./claude";
import { SCAM_SYSTEM_PROMPT, SCAM_TOOL } from "./claude-prompts";

export type ScamRating = "safe" | "suspicious" | "scam";

export interface ScamHit {
  category: "url" | "money" | "urgency" | "personal";
  matched: string;
  /** Strong hits jump straight to "scam" on their own. */
  strong?: boolean;
}

export interface ScamResult {
  rating: ScamRating;
  hits: ScamHit[];
  /** One-sentence explanation for the parent UI. */
  explanation: string;
}

const URL_RE = /\b(?:https?:\/\/|www\.)[\w./?=&%#-]+/gi;
const SHORTENER_RE =
  /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|tiny\.cc)\b/i;
const SUSPICIOUS_TLD_RE = /\.(?:zip|mov|xyz|top|click|lol|gq|tk|cf|ml)\b/i;
const IP_URL_RE = /https?:\/\/\d{1,3}(?:\.\d{1,3}){3}\b/i;

const URGENCY_PHRASES = [
  "act now",
  "urgent",
  "immediately",
  "right away",
  "final notice",
  "last chance",
  "verify your account",
  "account will be suspended",
  "account has been locked",
  "click here now",
  "limited time",
  "within 24 hours",
];

const MONEY_PHRASES = [
  "gift card",
  "itunes card",
  "google play card",
  "wire transfer",
  "western union",
  "moneygram",
  "bitcoin",
  "crypto",
  "send $",
  "send money",
  "bank transfer",
  "routing number",
];

const PERSONAL_PHRASES = [
  "social security",
  "ssn",
  "date of birth",
  "mother's maiden",
  "credit card number",
  "cvv",
  "one-time code",
  "verification code",
  "password",
];

/** "Strong" hits that imply scam on their own. */
const STRONG_MONEY = /\b(gift card|bitcoin|crypto|wire transfer|routing number)\b/i;
const STRONG_PERSONAL = /\b(social security|ssn|cvv|one-time code|verification code)\b/i;

function findUrls(input: string): ScamHit[] {
  const hits: ScamHit[] = [];
  const matches = input.match(URL_RE) ?? [];
  for (const url of matches) {
    if (SHORTENER_RE.test(url) || SUSPICIOUS_TLD_RE.test(url) || IP_URL_RE.test(url)) {
      hits.push({ category: "url", matched: url, strong: true });
    } else {
      hits.push({ category: "url", matched: url });
    }
  }
  return hits;
}

function findPhrases(
  input: string,
  phrases: string[],
  category: ScamHit["category"],
  strongRe?: RegExp
): ScamHit[] {
  const lower = input.toLowerCase();
  const hits: ScamHit[] = [];
  for (const p of phrases) {
    if (lower.includes(p)) {
      hits.push({
        category,
        matched: p,
        strong: strongRe ? strongRe.test(p) : false,
      });
    }
  }
  return hits;
}

function explain(rating: ScamRating, hits: ScamHit[]): string {
  if (rating === "safe") {
    return "This looks fine. No risky links, money requests, or pressure language.";
  }
  const has = (c: ScamHit["category"]) => hits.some((h) => h.category === c);
  const reasons: string[] = [];
  if (has("url")) reasons.push("contains a link");
  if (has("money")) reasons.push("asks about money or payment");
  if (has("urgency")) reasons.push("pressures you to act fast");
  if (has("personal")) reasons.push("asks for personal information");

  const lead = rating === "scam" ? "This is almost certainly a scam" : "This looks suspicious";
  return `${lead} — it ${reasons.slice(0, 3).join(" and ")}.`;
}

export function classifyMessage(input: string): ScamResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      rating: "safe",
      hits: [],
      explanation: "Paste a message above and we’ll check it.",
    };
  }

  const hits = [
    ...findUrls(trimmed),
    ...findPhrases(trimmed, MONEY_PHRASES, "money", STRONG_MONEY),
    ...findPhrases(trimmed, URGENCY_PHRASES, "urgency"),
    ...findPhrases(trimmed, PERSONAL_PHRASES, "personal", STRONG_PERSONAL),
  ];

  const strong = hits.some((h) => h.strong);
  let rating: ScamRating;
  if (strong || hits.length >= 2) rating = "scam";
  else if (hits.length === 1) rating = "suspicious";
  else rating = "safe";

  return { rating, hits, explanation: explain(rating, hits) };
}

export type ScamSource =
  | "claude"
  | "fallback-no-key"
  | "fallback-error"
  | "fallback-rules";

export interface ScamResultWithSource extends ScamResult {
  source: ScamSource;
}

function parseScamTool(input: unknown): ScamResult {
  if (typeof input !== "object" || input === null)
    throw new Error("not-object");
  const o = input as Record<string, unknown>;
  if (
    o.rating !== "safe" &&
    o.rating !== "suspicious" &&
    o.rating !== "scam"
  )
    throw new Error("rating");
  if (typeof o.explanation !== "string") throw new Error("explanation");
  const hits: ScamHit[] = Array.isArray(o.hits)
    ? (o.hits as unknown[]).flatMap((raw) => {
        if (typeof raw !== "object" || raw === null) return [];
        const h = raw as Record<string, unknown>;
        if (
          h.category !== "url" &&
          h.category !== "money" &&
          h.category !== "urgency" &&
          h.category !== "personal"
        )
          return [];
        if (typeof h.matched !== "string") return [];
        return [
          {
            category: h.category,
            matched: h.matched,
            strong: h.strong === true ? true : undefined,
          },
        ];
      })
    : [];
  return { rating: o.rating, hits, explanation: o.explanation };
}

/**
 * Claude-first scam classifier with a silent fallback to the rule-based
 * `classifyMessage()`. Never throws. The `source` field tells the UI
 * which path produced the result so the demo can show a "Live"/"Rules"
 * pill.
 *
 * An empty input short-circuits to the rules path (placeholder copy);
 * there is no point asking the model to classify an empty string.
 */
export async function classifyMessageAsync(
  input: string
): Promise<ScamResultWithSource> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ...classifyMessage(input), source: "fallback-rules" };
  }

  try {
    const result = await callClaudeTool<ScamResult>({
      system: SCAM_SYSTEM_PROMPT,
      user: `Message to classify:\n\n${trimmed}`,
      tool: SCAM_TOOL as unknown as Parameters<
        typeof callClaudeTool<ScamResult>
      >[0]["tool"],
      parse: parseScamTool,
      max_tokens: 600,
    });
    return { ...result, source: "claude" };
  } catch (err) {
    if (
      err instanceof ClaudeUnavailableError &&
      err.reason === "no-key"
    ) {
      return { ...classifyMessage(input), source: "fallback-no-key" };
    }
    if (typeof console !== "undefined" && err instanceof Error) {
      console.warn("[claude/scam] fallback:", err.message);
    }
    return { ...classifyMessage(input), source: "fallback-error" };
  }
}
