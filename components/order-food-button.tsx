"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";
import { cn } from "@/lib/utils";

/**
 * Standalone "Order my usual lunch" CTA for the parent home. Mirrors the
 * pick → confirm → done rhythm of `components/help-sheet.tsx` but is a
 * single-purpose button so the food-ordering capability is discoverable
 * in five seconds without digging through the help sheet.
 */
type Phase = "idle" | "confirm" | "done";

const USUAL = {
  emoji: "🍔",
  title: "Order my usual lunch",
  helper: "Uber Eats · Luigi's Pizza · ~$27 · 25 min",
  confirm:
    "Order your usual from Luigi's Pizza on Uber Eats — one slice + salad, $27.40?",
  doneTitle: "Order placed",
  doneBody: "Luigi's Pizza via Uber Eats · $27.40 · ETA 25 min.",
  feedTitle: "Dad ordered lunch",
  feedBody: "Luigi's Pizza · Uber Eats · ETA 25 min.",
};

export function OrderFoodButton() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);

  function start() {
    setOpen(true);
    setPhase("confirm");
  }

  function confirm() {
    prepend({
      id: `help-food-${Date.now()}`,
      variant: "family",
      tag: "Task completed",
      title: USUAL.feedTitle,
      body: USUAL.feedBody,
      time: "Now",
    });
    pushToast({
      tone: "ok",
      title: "Order placed",
      body: "Your family sees this as an activity entry, not an alert.",
    });
    setPhase("done");
  }

  function close(o: boolean) {
    setOpen(o);
    if (!o) setPhase("idle");
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        aria-label="Order my usual lunch"
        className={cn(
          "flex w-full min-h-[68px] items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        <span
          aria-hidden
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-ok-bg text-[24px]"
        >
          {USUAL.emoji}
        </span>
        <span className="flex flex-1 flex-col">
          <span className="flex items-center gap-2">
            <span className="text-[18px] font-bold text-ink">
              {USUAL.title}
            </span>
            <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ok-ink">
              I'll do it
            </span>
          </span>
          <span className="text-[14px] leading-snug text-ink-2">
            {USUAL.helper}
          </span>
        </span>
      </button>

      <Sheet open={open} onOpenChange={close}>
        <SheetContent className="pb-10">
          {phase === "confirm" ? (
            <>
              <SheetHeader>
                <SheetTitle>Ready when you are</SheetTitle>
                <SheetDescription>
                  I'll only place it if you say yes.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 rounded-2xl border border-line bg-white p-5">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-ok-bg text-[24px]"
                  >
                    {USUAL.emoji}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
                      {USUAL.title}
                    </p>
                    <p className="mt-1 text-[18px] font-bold leading-snug text-ink">
                      {USUAL.confirm}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={confirm}
                  className="flex min-h-[60px] w-full items-center justify-center rounded-2xl bg-ink px-5 py-4 text-[20px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Yes, order it
                </button>
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-line bg-white px-5 py-4 text-[18px] font-semibold text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Not now
                </button>
              </div>
            </>
          ) : null}

          {phase === "done" ? (
            <>
              <SheetHeader>
                <SheetTitle>{USUAL.doneTitle}</SheetTitle>
                <SheetDescription>
                  Your family sees this as an activity entry — not an alert.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-ok-bg p-5">
                <span aria-hidden className="text-[32px]">✅</span>
                <div>
                  <p className="text-[18px] font-bold leading-snug text-ok-ink">
                    {USUAL.doneTitle}
                  </p>
                  <p className="mt-1 text-[16px] leading-snug text-ink-2">
                    {USUAL.doneBody}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => close(false)}
                className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-5 py-4 text-[18px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Done
              </button>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
