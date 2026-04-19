"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/components/app-frame";
import { AnomalyCard } from "@/components/anomaly-card";
import { EmptyState } from "@/components/empty-state";
import { TrendCard } from "@/components/trend-card";
import { detect } from "@/lib/anomalies";
import {
  TIMESERIES,
  deltaVsBaseline,
  latest,
  type ProviderSeries,
} from "@/lib/timeseries";
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

  const trends = useMemo(() => buildTrends(connected), [connected]);

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

      <section aria-label="7-day trends" className="flex flex-col gap-3 px-4 pb-6">
        <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
          7-day trends
        </h2>
        {trends.length === 0 ? (
          <EmptyState
            emoji="📡"
            title="No trends yet"
            body="Connect a health or carrier service to see daily trends here."
            action={
              <Link
                href="/family/connections"
                className="inline-flex min-h-[40px] items-center rounded-xl border border-ink bg-ink px-3 py-1.5 text-[13px] font-bold text-white hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98]"
              >
                Connect a service →
              </Link>
            }
          />
        ) : (
          trends.map((t) => <TrendCard key={t.label} {...t} />)
        )}
      </section>

      <section className="px-4 pb-8">
        <Link
          href="/family/timeline"
          className="flex min-h-[56px] items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-[14px] font-semibold text-ink-2 hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span>See full activity timeline</span>
          <span aria-hidden>→</span>
        </Link>
      </section>
    </>
  );
}

interface TrendInput {
  label: string;
  value: string;
  series: number[];
  delta: number | null;
  source: string;
  tone: "med" | "ok" | "warn" | "scam" | "family";
}

function buildTrends(connected: Set<string>): TrendInput[] {
  const out: TrendInput[] = [];

  if (connected.has("withings")) {
    const bp = TIMESERIES.withings.bp ?? [];
    const sys = bp.map((b) => b.systolic);
    const last = latest(bp);
    if (last && sys.length) {
      out.push({
        label: "Blood pressure",
        value: `${last.systolic}/${last.diastolic}`,
        series: sys,
        delta: deltaVsBaseline(sys),
        source: "Withings",
        tone: "scam",
      });
    }
  }

  if (connected.has("apple-health") || connected.has("fitbit")) {
    const provider = connected.has("apple-health") ? "apple-health" : "fitbit";
    const steps = TIMESERIES[provider].steps ?? [];
    if (steps.length) {
      out.push({
        label: "Daily steps",
        value: `${latest(steps)?.toLocaleString() ?? "—"}`,
        series: steps,
        delta: deltaVsBaseline(steps),
        source: provider === "apple-health" ? "Apple Health" : "Fitbit",
        tone: "med",
      });
    }
  }

  if (connected.has("oura")) {
    const sleep = TIMESERIES.oura.sleepScore ?? [];
    if (sleep.length) {
      out.push({
        label: "Sleep score",
        value: `${latest(sleep)}`,
        series: sleep,
        delta: deltaVsBaseline(sleep),
        source: "Oura Ring",
        tone: "family",
      });
    }
  }

  if (connected.has("verizon") || connected.has("tmobile")) {
    const provider = connected.has("verizon") ? "verizon" : "tmobile";
    const series = TIMESERIES[provider].spamCalls ?? [];
    if (series.length) {
      out.push({
        label: "Spam calls today",
        value: `${latest(series)}`,
        series,
        delta: deltaVsBaseline(series),
        source: provider === "verizon" ? "Verizon Call Filter" : "T-Mobile Scam Shield",
        tone: "scam",
      });
    }
  }

  return out;
}

// Re-export so future callers can read the shape if needed.
export type { ProviderSeries };
