"use client";

import { useToastsStore } from "@/lib/store/toasts";
import type { Anomaly, Severity } from "@/lib/anomalies";
import { cn } from "@/lib/utils";

const TONE: Record<
  Severity,
  { bg: string; ink: string; chip: string; emoji: string; label: string }
> = {
  urgent: {
    bg: "bg-scam-bg",
    ink: "text-scam-ink",
    chip: "bg-white/70 text-scam-ink",
    emoji: "🚨",
    label: "Urgent",
  },
  warn: {
    bg: "bg-ride-bg",
    ink: "text-ride-ink",
    chip: "bg-white/70 text-ride-ink",
    emoji: "⚠️",
    label: "Worth a look",
  },
  info: {
    bg: "bg-chip-blue",
    ink: "text-accent",
    chip: "bg-white/70 text-accent",
    emoji: "ℹ️",
    label: "Heads-up",
  },
};

export function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const tone = TONE[anomaly.severity];
  const pushToast = useToastsStore((s) => s.push);

  return (
    <article
      className={cn("rounded-2xl p-4", tone.bg)}
      aria-labelledby={`anomaly-${anomaly.id}-title`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-[24px] leading-none">
          {tone.emoji}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                tone.chip
              )}
            >
              {tone.label}
            </span>
            <span className="text-[11px] uppercase tracking-[0.08em] text-ink-2/70">
              {anomaly.sources.join(" · ")}
            </span>
          </div>
          <h3
            id={`anomaly-${anomaly.id}-title`}
            className={cn("mt-1.5 text-[16px] font-extrabold tracking-tight", tone.ink)}
          >
            {anomaly.title}
          </h3>
          <p className={cn("mt-1 text-[13px] leading-snug", tone.ink)}>
            {anomaly.body}
          </p>
          {anomaly.action ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  pushToast({
                    tone: "ok",
                    title: anomaly.action!,
                    body: "Demo action — wires to the real workflow in v1.",
                  })
                }
                className="min-h-[36px] rounded-xl border border-current bg-white/80 px-3 py-1.5 text-[12px] font-bold hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                {anomaly.action}
              </button>
              <button
                type="button"
                onClick={() =>
                  pushToast({ tone: "info", title: "Marked as reviewed" })
                }
                className="min-h-[36px] rounded-xl px-3 py-1.5 text-[12px] font-semibold text-ink-2/80 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Mark reviewed
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
