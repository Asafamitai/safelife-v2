"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useEventsStore } from "@/lib/store/events";

/**
 * Family-side "Food ordered today" at-a-glance card. Surfaces the
 * existing `help-food-*` feed events in a compact, non-alarming row so a
 * family member can see at 11:48 AM that Dad already handled lunch.
 *
 * Hidden when no food events exist — the demo seed includes one so the
 * card is visible on fresh state.
 */
export function FoodOrderedTodayCard() {
  const events = useEventsStore((s) => s.events);
  const foodEvents = useMemo(
    () => events.filter((e) => e.id.startsWith("help-food")),
    [events]
  );

  if (foodEvents.length === 0) return null;

  const latest = foodEvents[0];

  return (
    <Link
      href="/family/money"
      className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        aria-hidden
        className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-ok-bg text-[22px]"
      >
        🍔
      </span>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
            Food ordered today
          </span>
          <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[10px] font-bold text-ok-ink">
            {foodEvents.length}
          </span>
        </div>
        <span className="mt-0.5 text-[14px] font-bold text-ink">
          {latest.title}
        </span>
        {latest.body ? (
          <span className="text-[12px] leading-snug text-ink-2">
            {latest.body}
          </span>
        ) : null}
      </div>
      <span aria-hidden className="text-accent text-lg">→</span>
    </Link>
  );
}
