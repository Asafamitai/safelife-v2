/**
 * Seam tests for `answerAsync` — the Claude-backed path MUST preserve
 * the exact `AskResult` shape the UI expects, and MUST silently fall
 * back to `answer()` on every failure mode.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ANTHROPIC_KEY_STORAGE } from "./claude-prompts";
import { answer, answerAsync, type AskSnapshot } from "./ask-parser";
import { INTEGRATION_PROVIDERS } from "./integrations";

const SEED_SNAPSHOT: AskSnapshot = {
  events: [
    {
      id: "scam-1",
      variant: "scam",
      tag: "Protection",
      title: "Suspicious message blocked",
      time: "11:24",
    },
  ],
  meds: [
    {
      id: "med-1",
      name: "Lisinopril",
      dose: "10 mg",
      takeAt: "8:00 AM",
      takenAt: "8:04 AM",
    },
  ],
  members: [{ id: "m-1", name: "Susan", role: "Daughter" }],
  connected: new Set<string>(),
  providers: INTEGRATION_PROVIDERS,
};

function mockSdk(response: {
  tool?: { name: string; input: unknown };
  error?: Error;
}) {
  const create = response.error
    ? vi.fn().mockRejectedValue(response.error)
    : vi.fn().mockResolvedValue({
        content: [
          {
            type: "tool_use",
            name: response.tool?.name ?? "return_answer",
            input: response.tool?.input ?? {},
          },
        ],
      });
  vi.doMock("@anthropic-ai/sdk", () => ({
    default: vi.fn().mockImplementation(() => ({
      messages: { create },
    })),
  }));
  return create;
}

describe("answerAsync", () => {
  beforeEach(() => {
    window.localStorage.removeItem(ANTHROPIC_KEY_STORAGE);
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("falls back to rules when no key is configured", async () => {
    const { answerAsync: fresh } = await import("./ask-parser");
    const result = await fresh("Did dad take his meds?", SEED_SNAPSHOT);
    expect(result.source).toBe("fallback-no-key");
    const local = answer("Did dad take his meds?", SEED_SNAPSHOT);
    expect(result.headline).toBe(local.headline);
    expect(result.intent).toBe(local.intent);
  });

  it("returns Claude's structured answer when a key is set", async () => {
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, "sk-ant-test");
    mockSdk({
      tool: {
        name: "return_answer",
        input: {
          intent: "meds",
          headline: "Yes — all doses taken.",
          bullets: ["Lisinopril 10 mg taken at 8:04 AM"],
          sources: ["Medication tracker"],
        },
      },
    });
    const { answerAsync: fresh } = await import("./ask-parser");
    const result = await fresh("Did dad take his meds?", SEED_SNAPSHOT);
    expect(result.source).toBe("claude");
    expect(result.headline).toBe("Yes — all doses taken.");
    expect(result.bullets).toEqual(["Lisinopril 10 mg taken at 8:04 AM"]);
  });

  it("falls back on network errors", async () => {
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, "sk-ant-test");
    mockSdk({ error: new Error("fetch failed: network down") });
    const { answerAsync: fresh } = await import("./ask-parser");
    const result = await fresh("How is dad today?", SEED_SNAPSHOT);
    expect(result.source).toBe("fallback-error");
    const local = answer("How is dad today?", SEED_SNAPSHOT);
    expect(result.headline).toBe(local.headline);
  });

  it("falls back when the model returns unparseable tool input", async () => {
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, "sk-ant-test");
    mockSdk({
      tool: {
        name: "return_answer",
        input: { wrong: "shape" },
      },
    });
    const { answerAsync: fresh } = await import("./ask-parser");
    const result = await fresh("any", SEED_SNAPSHOT);
    expect(result.source).toBe("fallback-error");
  });
});
