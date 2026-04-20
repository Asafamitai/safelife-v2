import { cn } from "@/lib/utils";

/**
 * Tiny transparency chip shown next to answers from the two Claude-backed
 * seams (Ask, Scam). Lets demo viewers see at a glance whether the result
 * is coming from the live model or the rule-based fallback.
 *
 * Intentionally visual-only — no click, no tooltip. Users who want
 * details go to Settings.
 */

type Source = "claude" | `fallback-${string}`;

interface Props {
  source: Source;
  className?: string;
}

export function ClaudeStatusPill({ source, className }: Props) {
  const isLive = source === "claude";
  const label = isLive ? "Live AI" : "Rules";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
        isLive ? "bg-ok-bg text-ok-ink" : "bg-panel text-ink-2",
        className
      )}
      aria-label={isLive ? "Answered by Claude" : "Answered by built-in rules"}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isLive ? "bg-ok-ink" : "bg-ink-2"
        )}
      />
      {label}
    </span>
  );
}
