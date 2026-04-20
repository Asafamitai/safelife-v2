"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-frame";
import { AddZoneSheet } from "@/components/add-zone-sheet";
import { SafeZoneMap } from "@/components/safe-zone-map";
import { useSafeZonesStore } from "@/lib/store/safe-zones";
import { cn } from "@/lib/utils";

/**
 * Family-side Safe Zones dashboard. Two tabs:
 *   Map      — stylized map + list of the loved one's geofenced zones
 *              with toggle + delete per row.
 *   Timeline — today's zone entries / exits as a vertical list.
 *
 * Zones live in lib/store/safe-zones. Timeline events here are seeded
 * and don't react to zone state; a later pass wires them through a
 * real geofence provider.
 */

type Tab = "map" | "timeline";

interface ZoneEvent {
  id: string;
  kind: "left" | "entered";
  zoneIcon: string;
  zoneName: string;
  body: string;
  time: string;
  toneClass: string;
  dotClass: string;
}

const EVENTS: ZoneEvent[] = [
  {
    id: "ze-1",
    kind: "left",
    zoneIcon: "🏠",
    zoneName: "Home",
    body: "Mom left the safe zone",
    time: "9:14 AM",
    toneClass: "bg-ride-bg text-ride-ink",
    dotClass: "bg-ride-ink",
  },
  {
    id: "ze-2",
    kind: "entered",
    zoneIcon: "🛒",
    zoneName: "Grocery",
    body: "Mom arrived at Grocery",
    time: "9:31 AM",
    toneClass: "bg-ok-bg text-ok-ink",
    dotClass: "bg-ok-ink",
  },
  {
    id: "ze-3",
    kind: "left",
    zoneIcon: "🛒",
    zoneName: "Grocery",
    body: "Mom left Grocery",
    time: "10:02 AM",
    toneClass: "bg-chip-blue text-accent",
    dotClass: "bg-accent",
  },
  {
    id: "ze-4",
    kind: "entered",
    zoneIcon: "🏠",
    zoneName: "Home",
    body: "Mom arrived home safely",
    time: "10:18 AM",
    toneClass: "bg-ok-bg text-ok-ink",
    dotClass: "bg-ok-ink",
  },
];

// Decorative positions on the 400×240 map for the seeded zones. Keyed
// off zone.id; added zones fall back to centre.
const MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  "sz-home": { x: 112, y: 158 },
  "sz-grocery": { x: 250, y: 95 },
  "sz-park": { x: 310, y: 200 },
};

export default function SafeZonesPage() {
  const zones = useSafeZonesStore((s) => s.zones);
  const toggle = useSafeZonesStore((s) => s.toggle);
  const remove = useSafeZonesStore((s) => s.remove);

  const [tab, setTab] = useState<Tab>("map");
  const [addOpen, setAddOpen] = useState(false);

  const mapZones = zones.map((z) => ({
    id: z.id,
    icon: z.icon,
    active: z.enabled,
    ...(MAP_POSITIONS[z.id] ?? { x: 200, y: 120 }),
  }));

  return (
    <>
      <AppHeader
        subtitle="Location safety"
        title="Safe Zones"
        right={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span aria-hidden>+</span> Add zone
          </button>
        }
      />

      <section className="px-4 pt-1" aria-label="View toggle">
        <div
          role="tablist"
          className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1 text-[14px] font-bold shadow-sm"
        >
          {([
            { id: "map", label: "🗺️ Map" },
            { id: "timeline", label: "🕒 Timeline" },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-3 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active ? "bg-ink text-white" : "text-ink-2 hover:text-ink"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "map" ? (
        <>
          <section className="px-4 pt-4" aria-label="Zone map preview">
            <SafeZoneMap zones={mapZones} className="h-[220px]" />
          </section>

          <section className="px-4 pb-6 pt-5" aria-label="Your zones">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Your zones
            </div>

            <ul className="space-y-2.5">
              {zones.map((z) => (
                <li
                  key={z.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-line bg-white p-3",
                    !z.enabled && "opacity-70"
                  )}
                >
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-panel text-[22px]"
                  >
                    {z.icon}
                  </span>
                  <div className="flex-1">
                    <div className="text-[16px] font-extrabold tracking-tight text-ink">
                      {z.name}
                    </div>
                    <div className="text-[13px] text-muted">
                      Radius {z.radius}m
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={z.enabled}
                    aria-label={`${z.enabled ? "Disable" : "Enable"} ${z.name} zone`}
                    onClick={() => toggle(z.id)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      z.enabled ? "bg-ink" : "bg-line"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                        z.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(z.id)}
                    aria-label={`Remove ${z.name} zone`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span aria-hidden className="text-[16px]">
                      ✕
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {zones.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-6 text-center">
                <div className="text-[15px] font-semibold text-ink">
                  No zones yet
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  Add your first zone to start getting enter / leave alerts.
                </p>
              </div>
            ) : null}
          </section>
        </>
      ) : (
        <>
          <section
            aria-label="Today's movements"
            className="px-4 pb-2 pt-5"
          >
            <div className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Today’s movements
            </div>

            <ol className="relative ml-3 space-y-3 border-l border-line pl-5">
              {EVENTS.map((e) => (
                <li key={e.id} className="relative">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[27px] top-3 h-2.5 w-2.5 rounded-full ring-4 ring-off-white",
                      e.dotClass
                    )}
                  />
                  <article
                    className={cn(
                      "rounded-2xl p-3.5",
                      e.toneClass
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
                        <span aria-hidden>{e.zoneIcon}</span>
                        {e.kind === "left" ? "Left" : "Entered"} {e.zoneName}
                      </div>
                      <div className="text-[12px] font-semibold opacity-80">
                        {e.time}
                      </div>
                    </div>
                    <p className="mt-1 text-[13px] leading-snug opacity-90">
                      {e.body}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          </section>

          <section className="px-4 pb-6 pt-4" aria-label="Notification status">
            <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-chip-blue text-[18px]"
              >
                🔔
              </span>
              <div>
                <div className="text-[15px] font-extrabold tracking-tight text-ink">
                  Notifications active
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-2">
                  You’ll be alerted on every zone entry and exit.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      <AddZoneSheet open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
