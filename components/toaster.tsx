"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useToastsStore, type ToastTone } from "@/lib/store/toasts";
import { cn } from "@/lib/utils";

const TONE: Record<ToastTone, { bg: string; ink: string; emoji: string }> = {
  ok: { bg: "bg-ok-bg", ink: "text-ok-ink", emoji: "✓" },
  info: { bg: "bg-chip-blue", ink: "text-accent", emoji: "ℹ" },
  warn: { bg: "bg-ride-bg", ink: "text-ride-ink", emoji: "!" },
};

/**
 * Toast stack. Inside the demo shell (`#demo-phone-viewport`), the
 * stack portals into the phone so toasts sit below the status bar
 * instead of covering the whole browser. Off-shell (landing etc.)
 * it falls back to a viewport-fixed layer.
 */
export function Toaster() {
  const toasts = useToastsStore((s) => s.toasts);
  const remove = useToastsStore((s) => s.remove);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.getElementById("demo-phone-viewport"));
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  const scoped = container != null;
  const layer = (
    <div
      role="region"
      aria-label="Notifications"
      className={cn(
        "pointer-events-none z-[60] flex flex-col items-center gap-2 px-3",
        scoped ? "absolute inset-x-0 top-10" : "fixed inset-x-0 top-3"
      )}
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

  return scoped ? createPortal(layer, container) : layer;
}
