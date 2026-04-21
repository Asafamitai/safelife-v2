"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BigCTA } from "@/components/big-cta";
import { useEventsStore } from "@/lib/store/events";
import { useToastsStore } from "@/lib/store/toasts";
import type { CategoryVariant } from "@/components/category-tag";
import { cn } from "@/lib/utils";

/**
 * "Task Execution" pillar from the pitch deck, surfaced as a bottom-sheet
 * on the parent home. Each route follows a three-step flow:
 *
 *   pick (menu)  →  confirm (AI summarizes the action it will take)
 *                →  done (action completed, family-feed updated)
 *
 * Some routes actually do something (refill, bill, ride) — the AI acts.
 * Others still hand off to a family member (message, tech help) — the AI
 * knows its limits. Both shapes are visible on purpose: "safe execution"
 * means the AI confirms before it writes, and falls back to a human when
 * it shouldn't act.
 */

type Phase = "pick" | "confirm" | "done";

interface HelpRoute {
  id: "ride" | "appointment" | "prescription" | "bill" | "message" | "tech";
  label: string;
  helper: string;
  emoji: string;
  /**
   * Actionable = the AI executes via a connected service. Handoff =
   * SafeLife notifies a family member who can help.
   */
  mode: "action" | "handoff";
  /** What SafeLife will do, read aloud in the confirm step. */
  confirm: string;
  /** Final headline shown in the done state. */
  doneTitle: string;
  /** Supporting line in the done state. */
  doneBody: string;
  /** Family feed entry — category variant + tag styling. */
  feedVariant: CategoryVariant;
  feedTag: string;
  feedTitle: string;
  feedBody: string;
}

const ROUTES: HelpRoute[] = [
  {
    id: "ride",
    label: "Book a ride",
    helper: "Uber to an address or your next appointment.",
    emoji: "🚗",
    mode: "action",
    confirm:
      "Book an Uber to Dr. Chen's office for your 10:30 AM appointment tomorrow?",
    doneTitle: "Ride booked",
    doneBody:
      "Uber picks you up at 10:15 AM. Driver details were sent to your phone.",
    feedVariant: "ride",
    feedTag: "Task completed",
    feedTitle: "Dad booked a ride",
    feedBody: "Uber to Dr. Chen at 10:30 AM tomorrow · pickup 10:15 AM.",
  },
  {
    id: "prescription",
    label: "Refill a prescription",
    helper: "Your pharmacy, no new logins.",
    emoji: "💊",
    mode: "action",
    confirm: "Refill Lisinopril 10 mg at CVS on Main Street?",
    doneTitle: "Refill requested",
    doneBody: "CVS will text you when it's ready — usually 2 hours.",
    feedVariant: "med",
    feedTag: "Task completed",
    feedTitle: "Dad refilled Lisinopril",
    feedBody: "CVS on Main Street · ready in about 2 hours.",
  },
  {
    id: "bill",
    label: "Pay a bill",
    helper: "From your checking account. We'll ask before sending.",
    emoji: "💡",
    mode: "action",
    confirm: "Pay your Con Edison electric bill — $127.50 — from checking?",
    doneTitle: "Bill paid",
    doneBody: "Con Edison · $127.50 · confirmation #91e3 sent to your email.",
    feedVariant: "family",
    feedTag: "Task completed",
    feedTitle: "Dad paid his electric bill",
    feedBody: "Con Edison · $127.50 · from checking.",
  },
  {
    id: "appointment",
    label: "Book an appointment",
    helper: "Reschedule or add a doctor's visit.",
    emoji: "📅",
    mode: "handoff",
    confirm:
      "I'll let Maya know you want help booking a doctor's appointment.",
    doneTitle: "Help is on the way",
    doneBody: "Maya will call you back in a few minutes.",
    feedVariant: "family",
    feedTag: "Family update",
    feedTitle: "Dad asked for help with an appointment",
    feedBody: "Routed to the primary caregiver for follow-up.",
  },
  {
    id: "message",
    label: "Message a family member",
    helper: "Send a quick note to someone you trust.",
    emoji: "💬",
    mode: "handoff",
    confirm: "Send a note to Maya that you'd like to talk?",
    doneTitle: "Message sent",
    doneBody: "Maya has been pinged. She'll reply shortly.",
    feedVariant: "family",
    feedTag: "Family update",
    feedTitle: "Dad asked to talk",
    feedBody: "Open the family thread to reply.",
  },
  {
    id: "tech",
    label: "Tech help",
    helper: "Phone, apps, Wi-Fi — someone will call you back.",
    emoji: "📱",
    mode: "handoff",
    confirm: "I'll let Maya know you'd like help with something on your phone.",
    doneTitle: "Tech help requested",
    doneBody: "Maya will call back when free.",
    feedVariant: "ride",
    feedTag: "Help in one tap",
    feedTitle: "Dad asked for tech help",
    feedBody: "Tap to call back when you have a minute.",
  },
];

export function HelpSheet() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("pick");
  const [route, setRoute] = useState<HelpRoute | null>(null);
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);

  function openSheet(o: boolean) {
    setOpen(o);
    if (!o) {
      // Reset to the menu state so re-opening starts fresh.
      setPhase("pick");
      setRoute(null);
    }
  }

  function pickRoute(r: HelpRoute) {
    setRoute(r);
    setPhase("confirm");
  }

  function confirm() {
    if (!route) return;
    prepend({
      id: `help-${route.id}-${Date.now()}`,
      variant: route.feedVariant,
      tag: route.feedTag,
      title: route.feedTitle,
      body: route.feedBody,
      time: "Now",
    });
    pushToast({
      tone: "ok",
      title:
        route.mode === "action" ? "Done — and logged to family" : "Help is on the way",
      body:
        route.mode === "action"
          ? "Your family sees this as an activity entry, not an alert."
          : "Your family was notified just now.",
    });
    setPhase("done");
  }

  function dismissDone() {
    setOpen(false);
    setPhase("pick");
    setRoute(null);
  }

  return (
    <Sheet open={open} onOpenChange={openSheet}>
      <SheetTrigger asChild>
        <BigCTA parent aria-label="Ask SafeLife to do something">
          <span aria-hidden className="text-[24px]">🤝</span>
          I need help
        </BigCTA>
      </SheetTrigger>
      <SheetContent className="pb-10">
        {phase === "pick" ? (
          <>
            <SheetHeader>
              <SheetTitle>What can I do for you?</SheetTitle>
              <SheetDescription>
                Pick one. I'll handle it and keep your family in the loop.
              </SheetDescription>
            </SheetHeader>

            <ul className="mt-5 grid gap-3">
              {ROUTES.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => pickRoute(r)}
                    aria-label={r.label}
                    className="flex w-full min-h-[68px] items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span
                      aria-hidden
                      className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-panel text-[24px]"
                    >
                      {r.emoji}
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-ink">
                          {r.label}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                            r.mode === "action"
                              ? "bg-ok-bg text-ok-ink"
                              : "bg-panel text-ink-2"
                          )}
                        >
                          {r.mode === "action" ? "I'll do it" : "We'll call"}
                        </span>
                      </span>
                      <span className="text-[15px] leading-snug text-ink-2">
                        {r.helper}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {phase === "confirm" && route ? (
          <>
            <SheetHeader>
              <SheetTitle>Ready when you are</SheetTitle>
              <SheetDescription>
                {route.mode === "action"
                  ? "I'll only do this if you say yes."
                  : "Here's what I'll pass along to your family."}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-5 rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-panel text-[24px]"
                >
                  {route.emoji}
                </span>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
                    {route.label}
                  </p>
                  <p className="mt-1 text-[18px] font-bold leading-snug text-ink">
                    {route.confirm}
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
                Yes, do it
              </button>
              <button
                type="button"
                onClick={() => setPhase("pick")}
                className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-line bg-white px-5 py-4 text-[18px] font-semibold text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Not now
              </button>
            </div>
          </>
        ) : null}

        {phase === "done" && route ? (
          <>
            <SheetHeader>
              <SheetTitle>{route.doneTitle}</SheetTitle>
              <SheetDescription>
                {route.mode === "action"
                  ? "Your family sees this as an activity entry — not an alert."
                  : "Your family was notified just now."}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-ok-bg p-5">
              <span aria-hidden className="text-[32px]">✅</span>
              <div>
                <p className="text-[18px] font-bold leading-snug text-ok-ink">
                  {route.doneTitle}
                </p>
                <p className="mt-1 text-[16px] leading-snug text-ink-2">
                  {route.doneBody}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissDone}
              className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-ink px-5 py-4 text-[18px] font-bold text-white transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Done
            </button>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
