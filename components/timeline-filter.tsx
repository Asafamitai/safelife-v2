"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Variant-only timeline filter.
 *
 * The feed's "time" is a display label ("Tue", "11:24", "Now"), not a real
 * timestamp, so filtering by date range is out of scope for the demo.
 * Filtering by variant is both tractable and matches how a family would
 * scan: "show me just the protection events this week".
 *
 * Source of truth lives in the URL (`?f=`) so the filter survives reload
 * and is shareable, without coupling to a store.
 */

export type TimelineFilter = "scam" | "med" | "family" | "ride";

const FILTERS: { id: TimelineFilter; label: string; emoji: string }[] = [
  { id: "scam", label: "Protection", emoji: "🛡" },
  { id: "med", label: "Meds", emoji: "💊" },
  { id: "ride", label: "Help", emoji: "🙋" },
  { id: "family", label: "Family", emoji: "👪" },
];

export function parseFilterQuery(raw: string | null): Set<TimelineFilter> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is TimelineFilter =>
        FILTERS.some((f) => f.id === s)
      )
  );
}

export function useActiveFilters(): Set<TimelineFilter> {
  const params = useSearchParams();
  return useMemo(() => parseFilterQuery(params.get("f")), [params]);
}

export function TimelineFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = useActiveFilters();

  function toggle(id: TimelineFilter) {
    const next = new Set(active);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const qs = new URLSearchParams(params.toString());
    if (next.size === 0) qs.delete("f");
    else qs.set("f", Array.from(next).join(","));
    const url = qs.toString() ? `${pathname}?${qs.toString()}` : pathname;
    router.replace(url, { scroll: false });
  }

  function clear() {
    const qs = new URLSearchParams(params.toString());
    qs.delete("f");
    const url = qs.toString() ? `${pathname}?${qs.toString()}` : pathname;
    router.replace(url, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Filter timeline by type"
      className="flex flex-wrap items-center gap-1.5 px-4 pb-2 pt-1"
    >
      {FILTERS.map((f) => {
        const on = active.has(f.id);
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(f.id)}
            className={cn(
              "flex min-h-[36px] items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              on
                ? "border border-ink bg-ink text-white"
                : "border border-line bg-white text-ink-2"
            )}
          >
            <span aria-hidden>{f.emoji}</span>
            {f.label}
          </button>
        );
      })}
      {active.size > 0 ? (
        <button
          type="button"
          onClick={clear}
          className="ml-1 min-h-[36px] rounded-full px-3 py-1.5 text-[12px] font-semibold text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
