/**
 * Thin client wrapper around the Anthropic SDK.
 *
 * BYOK (bring-your-own-key) model: the demo ships as a static site on
 * GitHub Pages, so there is no server to hold a key. Users paste a key in
 * Settings; it lives in `localStorage` under `safelife:anthropic-key` and
 * never leaves the browser except to api.anthropic.com.
 *
 * The SDK is loaded via dynamic `import()` so the bundle stays small for
 * the default (no-key) path — nothing happens until someone actually asks
 * a question with a key configured.
 */
import { ANTHROPIC_KEY_STORAGE } from "./claude-prompts";

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";

export class ClaudeUnavailableError extends Error {
  reason:
    | "no-key"
    | "no-browser"
    | "timeout"
    | "network"
    | "schema"
    | "api";
  constructor(reason: ClaudeUnavailableError["reason"], message?: string) {
    super(message ?? reason);
    this.name = "ClaudeUnavailableError";
    this.reason = reason;
  }
}

function readKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ANTHROPIC_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function hasClaudeKey(): boolean {
  return !!readKey();
}

interface ToolCallOptions<T> {
  /** System prompt. A cache_control marker is appended automatically. */
  system: string;
  /** User-side content. Not cached (changes every turn). */
  user: string;
  /** The tool the model MUST call to return structured data. */
  tool: {
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
  };
  /** Runtime type-check of the model's structured output. */
  parse: (input: unknown) => T;
  /** Max tokens the model may emit. Keep tight for cost. */
  max_tokens?: number;
  /** Timeout in ms. Default 6000. */
  timeoutMs?: number;
  /** Retry on network/timeout. Default 1. */
  retries?: number;
}

/**
 * Make a single structured tool call and return the parsed result.
 *
 * Throws `ClaudeUnavailableError` on any failure — callers are expected
 * to silently fall back to rule-based logic, not surface an error toast.
 */
export async function callClaudeTool<T>(
  opts: ToolCallOptions<T>
): Promise<T> {
  const key = readKey();
  if (!key) throw new ClaudeUnavailableError("no-key");
  if (typeof window === "undefined")
    throw new ClaudeUnavailableError("no-browser");

  const timeoutMs = opts.timeoutMs ?? 6000;
  const retries = opts.retries ?? 1;

  // Lazy-load the SDK so it only ships to users who set a key.
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const msg = await client.messages.create(
        {
          model: CLAUDE_MODEL,
          max_tokens: opts.max_tokens ?? 1024,
          system: [
            {
              type: "text" as const,
              text: opts.system,
              cache_control: { type: "ephemeral" as const },
            },
          ],
          messages: [{ role: "user" as const, content: opts.user }],
          tools: [
            {
              name: opts.tool.name,
              description: opts.tool.description,
              input_schema: opts.tool.input_schema as never,
            },
          ],
          tool_choice: { type: "tool" as const, name: opts.tool.name },
        },
        { signal: controller.signal }
      );

      const block = msg.content.find(
        (b): b is Extract<typeof b, { type: "tool_use" }> =>
          b.type === "tool_use" && b.name === opts.tool.name
      );
      if (!block) throw new ClaudeUnavailableError("schema", "no tool_use");
      try {
        return opts.parse(block.input);
      } catch {
        throw new ClaudeUnavailableError("schema", "parse failed");
      }
    } catch (err) {
      lastErr = err;
      if (err instanceof ClaudeUnavailableError && err.reason === "schema") {
        throw err;
      }
      // Retry on abort/network; bail on auth/validation.
      const isAbort =
        err instanceof Error &&
        (err.name === "AbortError" || /abort/i.test(err.message));
      const isNetwork =
        err instanceof Error && /fetch|network/i.test(err.message);
      if (attempt < retries && (isAbort || isNetwork)) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        continue;
      }
      if (isAbort) throw new ClaudeUnavailableError("timeout");
      if (isNetwork) throw new ClaudeUnavailableError("network");
      throw new ClaudeUnavailableError(
        "api",
        err instanceof Error ? err.message : "api error"
      );
    } finally {
      clearTimeout(timer);
    }
  }

  throw new ClaudeUnavailableError(
    "api",
    lastErr instanceof Error ? lastErr.message : "unknown"
  );
}
