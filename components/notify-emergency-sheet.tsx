"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";

/**
 * Multi-phase confirmation sheet for the Emergency dashboard.
 *
 * Lifecycle:
 *   confirm  — show the selected contacts, last chance to cancel
 *   sending  — animated "reaching out" state, simulated latency
 *   done     — success confirmation; on close, a soft note goes to the
 *              family feed so the caregiver sees what happened
 *
 * The sending phase intentionally pauses ~1.2s so it feels like a real
 * network round-trip rather than an instant toggle.
 */

type Phase = "confirm" | "sending" | "done";

interface Contact {
  id: string;
  name: string;
  sublabel?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
}

export function NotifyEmergencySheet({ open, onOpenChange, contacts }: Props) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);

  // Reset phase every time the sheet re-opens.
  useEffect(() => {
    if (open) setPhase("confirm");
  }, [open]);

  // Simulated latency for the "sending" phase.
  useEffect(() => {
    if (phase !== "sending") return;
    const t = setTimeout(() => setPhase("done"), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  function handleNotify() {
    setPhase("sending");
  }

  function handleClose() {
    if (phase === "done") {
      prepend({
        id: `emergency-${Date.now()}`,
        variant: "scam",
        tag: "Protection",
        title: "Emergency contacts notified",
        body: `${contacts.map((c) => c.name).join(", ")} received a check-in request from Mom.`,
        time: "Now",
      });
      pushToast({
        tone: "ok",
        title: "Contacts notified",
        body: "Family was told you need help.",
      });
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => (!o ? handleClose() : onOpenChange(o))}>
      <SheetContent>
        {phase === "confirm" ? (
          <>
            <SheetHeader>
              <SheetTitle>Send help request?</SheetTitle>
              <SheetDescription>
                We’ll text these people right now with your name, status, and
                last known location. You can stop any time.
              </SheetDescription>
            </SheetHeader>

            <ul className="mt-5 space-y-2">
              {contacts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3"
                >
                  <div>
                    <div className="text-[16px] font-bold text-ink">{c.name}</div>
                    {c.sublabel ? (
                      <div className="text-[13px] text-muted">{c.sublabel}</div>
                    ) : null}
                  </div>
                  <span
                    aria-hidden
                    className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[14px] font-bold text-white"
                  >
                    ✓
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={handleNotify}
                className="min-h-[56px] rounded-2xl bg-scam-ink px-4 py-3 text-[17px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                🔔 Notify now
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[48px] rounded-2xl border border-line bg-white px-4 py-2 text-[15px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Cancel
              </button>
            </div>
          </>
        ) : phase === "sending" ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-[320px] flex-col items-center justify-center gap-5 py-10 text-center"
          >
            <span aria-hidden className="text-[40px]">📡</span>
            <div>
              <div className="text-[20px] font-extrabold tracking-tight text-ink">
                Reaching out…
              </div>
              <p className="mt-2 text-[15px] leading-snug text-ink-2">
                Sending your location and a check-in message.
              </p>
            </div>
            <div className="flex gap-2" aria-hidden>
              <Dot delayMs={0} />
              <Dot delayMs={160} />
              <Dot delayMs={320} />
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 py-10 text-center">
            <span
              aria-hidden
              className="grid h-16 w-16 place-items-center rounded-full bg-ok-bg text-[32px] text-ok-ink"
            >
              ✓
            </span>
            <div>
              <div className="text-[22px] font-extrabold tracking-tight text-ink">
                Contacts notified
              </div>
              <p className="mt-2 max-w-[320px] text-[15px] leading-snug text-ink-2">
                {contacts.map((c) => c.name).join(" and ")}{" "}
                {contacts.length === 1 ? "was" : "were"} told you need help.
                They’ll reach out shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="min-h-[48px] rounded-2xl bg-ink px-6 py-3 text-[15px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Close
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Dot({ delayMs }: { delayMs: number }) {
  return (
    <span
      className="block h-2.5 w-2.5 animate-bounce rounded-full bg-ink"
      style={{ animationDelay: `${delayMs}ms`, animationDuration: "900ms" }}
    />
  );
}
