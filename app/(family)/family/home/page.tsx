"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/components/app-frame";
import { AnomalyBanner } from "@/components/anomaly-banner";
import { FeedCard } from "@/components/feed-card";
import { StatusPill } from "@/components/status-pill";
import { CheckMessageSheet } from "@/components/check-message-sheet";
import { ScamCardActions } from "@/components/scam-card-actions";
import { TourBanner } from "@/components/tour-banner";
import { WeeklyStats } from "@/components/weekly-stats";
import { useEventsStore } from "@/lib/store/events";
import { iconForVariant } from "@/lib/mock-events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { detect } from "@/lib/anomalies";

export default function FamilyHomePage() {
  const events = useEventsStore((s) => s.events);
  const connectedMap = useIntegrationsStore((s) => s.connected);
  const meds = useMedsStore((s) => s.meds);
  const connectedCount = Object.keys(connectedMap).length;
  // Status pill is a single source of truth: anomalies first, then a feed
  // signal as a fallback. If neither, "Mom is okay".
  const anomalies = useMemo(
    () => detect({ connected: new Set(Object.keys(connectedMap)), meds }),
    [connectedMap, meds]
  );
  const urgentCount = anomalies.filter((a) => a.severity === "urgent").length;
  const feedScam = events.some(
    (e) => e.variant === "scam" && /suspicious|blocked|scam/i.test(e.title)
  );

  const status =
    urgentCount > 0
      ? { tone: "warn" as const, label: `${urgentCount} need${urgentCount === 1 ? "s" : ""} attention` }
      : feedScam
        ? { tone: "warn" as const, label: "Worth a look" }
        : { tone: "ok" as const, label: "Mom is okay" };

  const newestId = events[0]?.id;

  return (
    <>
      <AppHeader
        subtitle="Good morning, Maya"
        title="Mom’s day so far"
        right={
          <div
            aria-hidden
            className="grid h-[40px] w-[40px] place-items-center rounded-full bg-gradient-to-br from-[#FAD0C4] to-[#FFD1FF] text-[14px] font-bold text-family-ink"
          >
            MA
          </div>
        }
      />

      <div className="px-5 pb-3">
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>

      <TourBanner
        tour="scam-to-feed"
        step={1}
        total={2}
        title="Here it is — the new event at the top"
        body="That’s the whole loop: parent acts once, family sees it immediately."
      />

      <AnomalyBanner />

      <WeeklyStats />

      <Link
        href="/family/ask"
        className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-accent/30 bg-chip-blue p-4 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden className="text-[22px]">💬</span>
        <span className="flex flex-1 flex-col">
          <span className="text-[14px] font-bold text-ink">
            Ask anything about your parent
          </span>
          <span className="text-[12px] leading-snug text-ink-2">
            “Did dad take his meds today?” “Any scams blocked this week?”
          </span>
        </span>
        <span aria-hidden className="text-accent text-lg">→</span>
      </Link>

      <section
        aria-label="Today"
        className="flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-1"
      >
        <div className="px-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Today
        </div>

        {events.map((e) => (
          <div
            key={e.id}
            className={
              e.id === newestId
                ? "rounded-2xl ring-2 ring-accent ring-offset-2 ring-offset-off-white"
                : undefined
            }
          >
            <FeedCard
              variant={e.variant}
              tag={e.tag}
              title={e.title}
              body={e.body}
              time={e.time}
              icon={<span aria-hidden>{iconForVariant(e.variant)}</span>}
              actions={e.variant === "scam" ? <ScamCardActions event={e} /> : null}
            />
          </div>
        ))}

        <Link
          href="/family/connections"
          className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-white px-4 py-3.5 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden className="text-xl">🔌</span>
          <span className="flex flex-1 flex-col">
            <span className="text-[14px] font-bold text-ink">
              Connect a service
            </span>
            <span className="text-[12px] text-muted">
              Pharmacies, health devices, fraud alerts, and more.
            </span>
          </span>
          <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[11px] font-bold text-ok-ink">
            {connectedCount} on
          </span>
        </Link>
      </section>

      <div className="sticky bottom-0 z-10 border-t border-line bg-off-white px-4 pb-3 pt-3">
        <CheckMessageSheet />
      </div>
    </>
  );
}
