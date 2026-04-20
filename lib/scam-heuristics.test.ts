/**
 * Seam tests for `classifyMessageAsync` — Claude result MUST match the
 * existing `ScamResult` shape; every failure mode MUST fall back to the
 * rule-based `classifyMessage()`.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ANTHROPIC_KEY_STORAGE } from "./claude-prompts";
import {
  classifyMessage,
  classifyMessageAsync,
} from "./scam-heuristics";

const SCAMMY =
  "URGENT: your account will be suspended in 24 hours. Verify at http://bit.ly/foo and send a gift card.";

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
            name: response.tool?.name ?? "return_rating",
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

describe("classifyMessageAsync", () => {
  beforeEach(() => {
    window.localStorage.removeItem(ANTHROPIC_KEY_STORAGE);
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("short-circuits on empty input", async () => {
    const { classifyMessageAsync: fresh } = await import(
      "./scam-heuristics"
    );
    const result = await fresh("   ");
    expect(result.source).toBe("fallback-rules");
    expect(result.rating).toBe("safe");
  });

  it("falls back to rules when no key is configured", async () => {
    const { classifyMessageAsync: fresh } = await import(
      "./scam-heuristics"
    );
    const result = await fresh(SCAMMY);
    expect(result.source).toBe("fallback-no-key");
    expect(result.rating).toBe(classifyMessage(SCAMMY).rating);
  });

  it("returns Claude's rating when a key is set", async () => {
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, "sk-ant-test");
    mockSdk({
      tool: {
        name: "return_rating",
        input: {
          rating: "scam",
          hits: [
            { category: "money", matched: "gift card", strong: true },
            { category: "urgency", matched: "urgent" },
          ],
          explanation: "This is almost certainly a scam.",
        },
      },
    });
    const { classifyMessageAsync: fresh } = await import(
      "./scam-heuristics"
    );
    const result = await fresh(SCAMMY);
    expect(result.source).toBe("claude");
    expect(result.rating).toBe("scam");
    expect(result.hits).toHaveLength(2);
    expect(result.hits[0].strong).toBe(true);
  });

  it("falls back on malformed tool output", async () => {
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, "sk-ant-test");
    mockSdk({
      tool: {
        name: "return_rating",
        input: { rating: "nope", explanation: "x" },
      },
    });
    const { classifyMessageAsync: fresh } = await import(
      "./scam-heuristics"
    );
    const result = await fresh(SCAMMY);
    expect(result.source).toBe("fallback-error");
    // Rules still rate this as scam.
    expect(result.rating).toBe("scam");
  });
});
