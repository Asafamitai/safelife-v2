"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { SettingsApiKey } from "@/components/settings-api-key";
import { useVoiceSettingsStore, type VoiceMode } from "@/lib/store/voice-settings";
import { cn } from "@/lib/utils";

type Size = "Standard" | "Large" | "Extra large";

export default function ParentSettingsPage() {
  const [size, setSize] = useState<Size>("Large");
  const [autoForward, setAutoForward] = useState(false);
  const voiceMode = useVoiceSettingsStore((s) => s.mode);
  const setVoiceMode = useVoiceSettingsStore((s) => s.setMode);
  const hydrate = useVoiceSettingsStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

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

        <VoiceModeField mode={voiceMode} onChange={setVoiceMode} />
        <Toggle
          label="Auto-forward suspicious texts"
          body="Sends only flagged messages to SafeLife — never your personal texts."
          on={autoForward}
          onChange={setAutoForward}
        />
        <SettingsApiKey />
      </section>
    </>
  );
}

const VOICE_OPTIONS: { id: VoiceMode; label: string; body: string }[] = [
  {
    id: "off",
    label: "Off",
    body: "No voice at all. Buttons and text only.",
  },
  {
    id: "on-tap",
    label: "On tap",
    body: "Tap the speaker icon to hear a card read aloud.",
  },
  {
    id: "on-focus",
    label: "Auto",
    body: "Read cards aloud when I scroll to them.",
  },
];

function VoiceModeField({
  mode,
  onChange,
}: {
  mode: VoiceMode;
  onChange: (m: VoiceMode) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-line bg-white p-5">
      <legend className="px-1 text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
        Voice
      </legend>
      <p className="mt-1 px-1 text-[14px] leading-snug text-ink-2">
        Reads SafeLife cards aloud. iPhone keeps a hand on the steering
        wheel — the first tap always unlocks audio.
      </p>
      <div
        role="radiogroup"
        aria-label="Voice mode"
        className="mt-3 grid gap-2"
      >
        {VOICE_OPTIONS.map((o) => {
          const on = mode === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              className={cn(
                "flex min-h-[64px] w-full items-start gap-3 rounded-xl border p-4 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                on ? "border-ink bg-ink text-white" : "border-line bg-white"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                  on ? "border-white" : "border-line"
                )}
              >
                {on ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                ) : null}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className={cn("text-[16px] font-bold", on ? "text-white" : "text-ink")}>
                  {o.label}
                </span>
                <span
                  className={cn(
                    "text-[14px] leading-snug",
                    on ? "text-white/80" : "text-ink-2"
                  )}
                >
                  {o.body}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
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
