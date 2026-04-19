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

interface HelpRoute {
  id: "ride" | "appointment" | "message" | "tech";
  label: string;
  helper: string;
  emoji: string;
  /** Variant + tag drive how the request shows up in the family feed. */
  variant: CategoryVariant;
  tag: string;
  /** Family-feed event written when the parent picks this route. */
  feedTitle: string;
  feedBody: string;
}

const ROUTES: HelpRoute[] = [
  {
    id: "ride",
    label: "Ride",
    helper: "Get a ride to or from somewhere",
    emoji: "🚕",
    variant: "ride",
    tag: "Help in one tap",
    feedTitle: "Dad asked for a ride",
    feedBody: "A family member will reach out to confirm the pickup.",
  },
  {
    id: "appointment",
    label: "Appointment",
    helper: "Book or reschedule a doctor’s visit",
    emoji: "📅",
    variant: "family",
    tag: "Family update",
    feedTitle: "Dad asked for help with an appointment",
    feedBody: "Routed to the primary caregiver for follow-up.",
  },
  {
    id: "message",
    label: "Message someone",
    helper: "Send a message to a family member",
    emoji: "💬",
    variant: "family",
    tag: "Family update",
    feedTitle: "Dad asked to send a message",
    feedBody: "Open the family thread to reply.",
  },
  {
    id: "tech",
    label: "Tech help",
    helper: "Help with phone, apps, or Wi-Fi",
    emoji: "📱",
    variant: "ride",
    tag: "Help in one tap",
    feedTitle: "Dad asked for tech help",
    feedBody: "Tap to call back when you have a minute.",
  },
];

export function HelpSheet() {
  const [open, setOpen] = useState(false);
  const prepend = useEventsStore((s) => s.prepend);
  const pushToast = useToastsStore((s) => s.push);

  function pickRoute(route: HelpRoute) {
    prepend({
      id: `help-${route.id}-${Date.now()}`,
      variant: route.variant,
      tag: route.tag,
      title: route.feedTitle,
      body: route.feedBody,
      time: "Now",
    });
    pushToast({
      tone: "ok",
      title: "Help is on the way",
      body: "Your family was notified just now.",
    });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <BigCTA parent aria-label="I need help">
          <span aria-hidden className="text-[24px]">🤝</span>
          I need help
        </BigCTA>
      </SheetTrigger>
      <SheetContent className="pb-10">
        <SheetHeader>
          <SheetTitle>How can we help?</SheetTitle>
          <SheetDescription>
            Pick one. We’ll let your family know right away.
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
                <span className="flex flex-col">
                  <span className="text-[18px] font-bold text-ink">
                    {r.label}
                  </span>
                  <span className="text-[15px] leading-snug text-ink-2">
                    {r.helper}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
