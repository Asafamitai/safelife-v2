import { Sparkline } from "@/components/sparkline";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  /** Latest value formatted for display (e.g. "146/92", "4,210 steps"). */
  value: string;
  /** 7-day series — used by Sparkline. */
  series: number[];
  /** % change vs baseline; positive = up. Set null to hide. */
  delta?: number | null;
  /** Provider name shown as caption. */
  source: string;
  /** Tone of the sparkline + delta chip. */
  tone?: "med" | "ok" | "warn" | "scam" | "family";
}

const TONE_STROKE: Record<NonNullable<Props["tone"]>, string> = {
  med: "text-med-ink",
  ok: "text-ok-ink",
  warn: "text-ride-ink",
  scam: "text-scam-ink",
  family: "text-family-ink",
};

export function TrendCard({
  label,
  value,
  series,
  delta = null,
  source,
  tone = "med",
}: Props) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {label}
          </p>
          <p className="mt-0.5 text-[20px] font-extrabold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <Sparkline
          values={series}
          className={TONE_STROKE[tone]}
          ariaLabel={`${label} 7-day trend`}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-muted">{source}</span>
        {delta !== null ? (
          <span
            className={cn(
              "font-bold",
              delta > 0 ? TONE_STROKE.warn : TONE_STROKE.ok
            )}
          >
            {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}% vs 6-day avg
          </span>
        ) : null}
      </div>
    </article>
  );
}
