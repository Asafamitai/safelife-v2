"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/components/app-frame";
import { AnomalyCard } from "@/components/anomaly-card";
import { EmptyState } from "@/components/empty-state";
import { detect } from "@/lib/anomalies";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";

export default function FamilyInsightsPage() {
  const connectedMap = useIntegrationsStore((s) => s.connected);
  const meds = useMedsStore((s) => s.meds);

  const connected = useMemo(
    () => new Set(Object.keys(connectedMap)),
    [connectedMap]
  );

  const anomalies = useMemo(
    () => detect({ connected, meds }),
    [connected, meds]
  );

  return (
    <>
      <AppHeader
        subtitle="Family hub"
        title="Insights"
        right={
          anomalies.length > 0 ? (
            <span
              className="rounded-full bg-scam-bg px-3 py-1 text-[12px] font-bold text-scam-ink"
              aria-label={`${anomalies.length} active alerts`}
            >
              {anomalies.length} alert{anomalies.length === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="rounded-full bg-ok-bg px-3 py-1 text-[12px] font-bold text-ok-ink">
              All clear
            </span>
          )
        }
      />

      <p className="px-5 pb-3 text-[15px] leading-snug text-ink-2">
        We watch the data from connected services and only surface what matters.
      </p>

      <section
        aria-label="Active alerts"
        className="flex flex-col gap-3 px-4 pb-5"
      >
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
          Active alerts
        </h2>
        {anomalies.length === 0 ? (
          <EmptyState
            emoji="✨"
            title="All clear"
            body="No anomalies detected across connected services. We’ll surface anything worth your attention here."
          />
        ) : (
          anomalies.map((a) => <AnomalyCard key={a.id} anomaly={a} />)
        )}
      </section>

      <section aria-label="Explore" className="flex flex-col gap-3 px-4 pb-8 pt-2">
        <Link
          href="/family/trends"
          className="flex min-h-[56px] items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-[14px] font-semibold text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden className="text-[20px]">📈</span>
            <span>See 7-day trends</span>
          </span>
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/family/timeline"
          className="flex min-h-[56px] items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-[14px] font-semibold text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden className="text-[20px]">🕒</span>
            <span>See full activity timeline</span>
          </span>
          <span aria-hidden>→</span>
        </Link>
      </section>
    </>
  );
}
