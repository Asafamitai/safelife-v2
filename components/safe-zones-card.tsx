"use client";

import Link from "next/link";
import { useSafeZonesStore } from "@/lib/store/safe-zones";

/**
 * Family-side "Safe zones" at-a-glance card for the home feed. Surfaces
 * the number of active zones and the most recent location signal.
 * Tapping jumps to /family/safe-zones for the map + timeline.
 *
 * Mirrors the "Recent help requests" card pattern on parent home.
 */
export function SafeZonesCard() {
  const zones = useSafeZonesStore((s) => s.zones);
  const activeCount = zones.filter((z) => z.enabled).length;

  return (
    <Link
      href="/family/safe-zones"
      className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        aria-hidden
        className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-family-bg text-[22px]"
      >
        📍
      </span>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
            Safe zones
          </span>
          <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[10px] font-bold text-ok-ink">
            {activeCount} active
          </span>
        </div>
        <span className="mt-0.5 text-[14px] font-bold text-ink">
          Dad arrived home safely
        </span>
        <span className="text-[12px] leading-snug text-ink-2">
          1:10 PM · {zones.map((z) => z.name).slice(0, 3).join(" · ")}
        </span>
      </div>
      <span aria-hidden className="text-accent text-lg">
        →
      </span>
    </Link>
  );
}
