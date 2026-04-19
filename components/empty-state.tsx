import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  emoji: string;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Shared empty-state card used across pages with optional content lists.
 * Always centered, dashed-line border, soft tone — never alarmist.
 */
export function EmptyState({ emoji, title, body, action, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-line bg-white p-6 text-center",
        className
      )}
    >
      <div aria-hidden className="text-2xl">{emoji}</div>
      <p className="mt-2 text-[15px] font-bold text-ink">{title}</p>
      {body ? (
        <p className="mt-1 text-[13px] leading-snug text-muted">{body}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
