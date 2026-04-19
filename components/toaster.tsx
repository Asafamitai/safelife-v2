"use client";

import { useToastsStore, type ToastTone } from "@/lib/store/toasts";
import { cn } from "@/lib/utils";

const TONE: Record<ToastTone, { bg: string; ink: string; emoji: string }> = {
  ok: { bg: "bg-ok-bg", ink: "text-ok-ink", emoji: "✓" },
  info: { bg: "bg-chip-blue", ink: "text-accent", emoji: "ℹ" },
  warn: { bg: "bg-ride-bg", ink: "text-ride-ink", emoji: "!" },
};

export function Toaster() {
  const toasts = useToastsStore((s) => s.toasts);
  const remove = useToastsStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3"
    >
      {toasts.map((t) => {
        const tone = TONE[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-2xl border border-line bg-white p-3 shadow-card",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-[14px] font-bold",
                tone.bg,
                tone.ink
              )}
            >
              {tone.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-ink">{t.title}</p>
              {t.body ? (
                <p className="mt-0.5 text-[12px] leading-snug text-ink-2">
                  {t.body}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className="min-h-[32px] min-w-[32px] rounded-full text-[14px] font-bold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
