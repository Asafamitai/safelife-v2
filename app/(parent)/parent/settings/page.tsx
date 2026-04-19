"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { cn } from "@/lib/utils";

type Size = "Standard" | "Large" | "Extra large";

export default function ParentSettingsPage() {
  const [size, setSize] = useState<Size>("Large");
  const [voice, setVoice] = useState(true);
  const [autoForward, setAutoForward] = useState(false);

  return (
    <>
      <AppHeader parent subtitle="Settings" title="Make it yours" />

      <section className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <fieldset className="rounded-2xl border border-line bg-white p-5">
          <legend className="px-1 text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
            Text size
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["Standard", "Large", "Extra large"] as Size[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={cn(
                  "min-h-[56px] rounded-xl px-3 py-2 text-[16px] font-bold transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  size === s
                    ? "border border-ink bg-ink text-white"
                    : "border border-line bg-white text-ink-2"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <Toggle
          label="Voice control"
          body="Read messages aloud and accept spoken replies."
          on={voice}
          onChange={setVoice}
        />
        <Toggle
          label="Auto-forward suspicious texts"
          body="Sends only flagged messages to SafeLife — never your personal texts."
          on={autoForward}
          onChange={setAutoForward}
        />
      </section>
    </>
  );
}

function Toggle({
  label,
  body,
  on,
  onChange,
}: {
  label: string;
  body: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex min-h-[80px] items-center gap-4 rounded-2xl border border-line bg-white p-5 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="flex flex-1 flex-col">
        <span className="text-[18px] font-bold text-ink">{label}</span>
        <span className="text-[15px] leading-snug text-ink-2">{body}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-8 w-14 flex-shrink-0 rounded-full transition-colors",
          on ? "bg-ink" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
            on ? "translate-x-7" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}
