/**
 * System prompts + tool schemas shared by the Claude-backed seams.
 *
 * Split from `lib/claude.ts` so that the transport (API calls) and the
 * content (what we ask the model) evolve independently. Prompts are
 * plain strings — edit them to change tone, not the transport.
 */

export const ANTHROPIC_KEY_STORAGE = "safelife:anthropic-key";

/* ------------------------------------------------------------------ */
/* Ask — natural-language Q&A over the family snapshot                 */
/* ------------------------------------------------------------------ */

export const ASK_SYSTEM_PROMPT = [
  "You are SafeLife's family-side assistant.",
  "A family member is asking a short question about their aging parent.",
  "You receive a JSON snapshot of: recent events (scam blocks, med logs, help requests, appointments), medications with take-times, connected services, family members, and detected anomalies.",
  "",
  "Your job: reply with a short, calm, factual answer grounded ONLY in the snapshot. Never speculate. Never give medical advice.",
  "Tone: calm, not alarmist. 'Mom is okay' beats 'all systems normal'. Use short sentences.",
  "",
  "You MUST call the `return_answer` tool exactly once. Do not write free-text.",
  "- `headline`: one sentence, ≤ 90 chars.",
  "- `bullets`: 0–5 short supporting rows. Each ≤ 80 chars.",
  "- `sources`: the parts of the snapshot you used, as short labels (e.g. 'Medication tracker', 'Protection feed', 'Withings').",
  "- `intent`: the closest of the enum. Use 'unknown' only if the question is off-topic.",
].join("\n");

export const ASK_TOOL = {
  name: "return_answer",
  description:
    "Return a structured answer grounded in the provided family snapshot. Always call this tool.",
  input_schema: {
    type: "object",
    required: ["intent", "headline"],
    properties: {
      intent: {
        type: "string",
        enum: [
          "scams",
          "meds",
          "help",
          "appointments",
          "vitals",
          "members",
          "connected",
          "summary",
          "unknown",
        ],
      },
      headline: { type: "string" },
      bullets: { type: "array", items: { type: "string" }, maxItems: 5 },
      sources: { type: "array", items: { type: "string" }, maxItems: 5 },
    },
    additionalProperties: false,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Scam — is this message a scam?                                      */
/* ------------------------------------------------------------------ */

export const SCAM_SYSTEM_PROMPT = [
  "You are SafeLife's Protection layer — a scam classifier for messages received by an older adult.",
  "Rate the message as one of: 'safe', 'suspicious', or 'scam'.",
  "- 'scam': obvious fraud (requests money, gift cards, SSN, one-time codes; impersonates a bank/IRS/tech support; pressures with urgency + unknown links).",
  "- 'suspicious': one or two weak red flags (generic link, mild urgency) but not clearly fraud.",
  "- 'safe': no red flags.",
  "",
  "Return in `hits` the concrete phrases that triggered your rating, each tagged by category (url | money | urgency | personal). Mark `strong: true` for items that on their own justify 'scam' (e.g. gift card, SSN, one-time code, IP-address URL).",
  "",
  "`explanation` is one sentence, calm, readable by a non-technical 70-year-old. Start with 'This looks fine' / 'This looks suspicious' / 'This is almost certainly a scam'.",
  "",
  "You MUST call the `return_rating` tool exactly once. Do not write free-text.",
].join("\n");

export const SCAM_TOOL = {
  name: "return_rating",
  description:
    "Return a structured scam rating for the provided message. Always call this tool.",
  input_schema: {
    type: "object",
    required: ["rating", "hits", "explanation"],
    properties: {
      rating: { type: "string", enum: ["safe", "suspicious", "scam"] },
      hits: {
        type: "array",
        items: {
          type: "object",
          required: ["category", "matched"],
          properties: {
            category: {
              type: "string",
              enum: ["url", "money", "urgency", "personal"],
            },
            matched: { type: "string" },
            strong: { type: "boolean" },
          },
          additionalProperties: false,
        },
        maxItems: 10,
      },
      explanation: { type: "string" },
    },
    additionalProperties: false,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Digest — one-paragraph "this week" summary                          */
/* ------------------------------------------------------------------ */

export const DIGEST_SYSTEM_PROMPT = [
  "You are SafeLife's family-side weekly digest.",
  "A family member is opening the app after not checking in for a few days. Summarize the last ~7 days of their aging parent's activity from the JSON snapshot.",
  "",
  "Note: the snapshot's 'time' field is a label ('Tue', '11:24', 'Now') — not a real date. Treat the snapshot as 'this week' and don't invent specific dates.",
  "",
  "Tone: calm, not alarmist. 'Mom is okay' beats 'all systems normal'. Skip medical advice.",
  "",
  "You MUST call the `return_digest` tool exactly once.",
  "- `headline`: one sentence overall read (≤ 90 chars).",
  "- `bullets`: exactly 3 to 5 short rows. Each ≤ 80 chars. Concrete (counts, names, times).",
  "- `highlights`: 0–4 tagged items linking a label to a tag (scam | med | help | family | ride | ok).",
].join("\n");

export const DIGEST_TOOL = {
  name: "return_digest",
  description:
    "Return a structured weekly digest. Always call this tool. Bullets must be 3 to 5.",
  input_schema: {
    type: "object",
    required: ["headline", "bullets"],
    properties: {
      headline: { type: "string" },
      bullets: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 5,
      },
      highlights: {
        type: "array",
        items: {
          type: "object",
          required: ["tag", "label"],
          properties: {
            tag: {
              type: "string",
              enum: ["scam", "med", "help", "family", "ride", "ok"],
            },
            label: { type: "string" },
          },
          additionalProperties: false,
        },
        maxItems: 4,
      },
    },
    additionalProperties: false,
  },
} as const;
