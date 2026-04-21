"use client";

import { useTourStore } from "@/lib/tour";
import { cn } from "@/lib/utils";

interface Props {
  /** Which tour this banner responds to. */
  tour: "scam-to-feed";
  /** Which step(s) this banner is shown on. */
  step: number | number[];
  /** Total number of steps in the tour, for the "Step X of N" label. */
  total: number;
  title: string;
  body?: string;
  cta?: { label: string; onClick: () => void };
  className?: string;
}

export function TourBanner({
  tour,
  step,
  total,
  title,
  body,
  cta,
  className,
}: Props) {
  const active = useTourStore((s) => s.active);
  const current = useTourStore((s) => s.step);
  const stop = useTourStore((s) => s.stop);

  if (active !== tour) return null;
  const steps = Array.isArray(step) ? step : [step];
  if (!steps.includes(current)) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        "mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-accent/30 bg-chip-blue p-4",
        className
      )}
    >
      <span aria-hidden className="text-[22px]">🧭</span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
            Guided tour · step {current + 1} of {total}
          </span>
          <button
            type="button"
            onClick={stop}
            aria-label="End guided tour"
            className="min-h-[36px] rounded-lg border border-accent/40 bg-white px-3 text-[12px] font-bold text-accent hover:bg-chip-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            End
          </button>
        </div>
        <p className="mt-1 text-[15px] font-bold text-ink">{title}</p>
        {body ? (
          <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{body}</p>
        ) : null}
        {cta ? (
          <button
            type="button"
            onClick={cta.onClick}
            className="mt-2 min-h-[40px] rounded-xl border border-accent bg-accent px-3.5 py-1.5 text-[13px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {cta.label}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
