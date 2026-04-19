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
import type { MockEvent } from "@/lib/mock-events";

/**
 * Family-side actions for a blocked-scam card. Review opens a sheet showing
 * the full intercepted message; Mark safe removes the card and writes a soft
 * "marked safe" note so the family knows it was a false positive.
 */
export function ScamCardActions({ event }: { event: MockEvent }) {
  const [open, setOpen] = useState(false);
  const dismiss = useEventsStore((s) => s.dismiss);
  const prepend = useEventsStore((s) => s.prepend);

  function handleMarkSafe() {
    dismiss(event.id);
    prepend({
      id: `scam-safe-${event.id}-${Date.now()}`,
      variant: "ok",
      tag: "Scam check",
      title: "Marked safe by family",
      body: "Reviewed and dismissed — no action needed.",
      time: "Now",
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[10px] border border-ink bg-ink px-3 py-2 text-xs font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Review
      </button>
      <button
        type="button"
        onClick={handleMarkSafe}
        className="rounded-[10px] border border-[rgba(10,10,15,0.12)] bg-white/70 px-3 py-2 text-xs font-bold text-ink hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Mark safe
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Suspicious message</SheetTitle>
            <SheetDescription>
              Intercepted on the parent’s phone. SafeLife already blocked the
              link and didn’t reply.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 rounded-2xl bg-panel p-4 text-[14px] leading-snug text-ink-2">
            {event.body ?? "No message body captured."}
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => {
                handleMarkSafe();
                setOpen(false);
              }}
              className="min-h-[48px] rounded-xl bg-ink px-4 py-3 text-[14px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Looks fine — mark safe
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-[44px] rounded-xl border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Keep blocked
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
