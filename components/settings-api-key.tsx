"use client";

import { useEffect, useState } from "react";
import { ANTHROPIC_KEY_STORAGE } from "@/lib/claude-prompts";
import { cn } from "@/lib/utils";

/**
 * Demo-only BYOK input for an Anthropic API key.
 *
 * Important: this is a demo affordance, not a production pattern. The
 * key is stored in localStorage and sent from the browser to
 * api.anthropic.com. In a real product the key would live on a server
 * the family controls.
 */
export function SettingsApiKey() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(ANTHROPIC_KEY_STORAGE);
    setSaved(stored);
    setKey(stored ?? "");
  }, []);

  function save() {
    const trimmed = key.trim();
    if (!trimmed) return;
    window.localStorage.setItem(ANTHROPIC_KEY_STORAGE, trimmed);
    setSaved(trimmed);
    setDirty(false);
  }

  function clear() {
    window.localStorage.removeItem(ANTHROPIC_KEY_STORAGE);
    setKey("");
    setSaved(null);
    setDirty(false);
  }

  const masked = saved ? `••••${saved.slice(-4)}` : null;

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-ink">
            <span aria-hidden className="mr-1.5">✨</span>
            Smart answers (Claude)
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-ink-2">
            Optional. Paste your own Anthropic API key to power the Ask and
            Protection checks with Claude. The key is stored only in your
            browser and sent only to{" "}
            <span className="font-semibold">api.anthropic.com</span>.
          </p>
        </div>
        {saved ? (
          <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[11px] font-bold text-ok-ink">
            Live
          </span>
        ) : (
          <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-bold text-muted">
            Rules
          </span>
        )}
      </div>

      <label htmlFor="anthropic-key" className="sr-only">
        Anthropic API key
      </label>
      <input
        id="anthropic-key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
          setDirty(true);
        }}
        placeholder={saved ? masked ?? "" : "sk-ant-…"}
        className="mt-3 w-full min-h-[44px] rounded-xl border border-line bg-white px-3 py-2 font-mono text-[13px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!key.trim() || !dirty}
          className={cn(
            "min-h-[44px] rounded-xl bg-ink px-4 py-2 text-[14px] font-bold text-white disabled:opacity-40",
            "hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          Save key
        </button>
        {saved ? (
          <button
            type="button"
            onClick={clear}
            className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear
          </button>
        ) : null}
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[12px] font-semibold text-accent underline-offset-2 hover:underline"
        >
          Get a key
        </a>
      </div>

      <p className="mt-3 text-[11px] leading-snug text-muted">
        Only paste your own demo key — pasted keys are visible to any script
        on this page. Clear it when you're done.
      </p>
    </section>
  );
}
