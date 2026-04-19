"use client";

import Link from "next/link";
import { useMemo } from "react";
import { detect } from "@/lib/anomalies";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";

/**
 * Top-of-home alert strip. Hidden when there are no anomalies. The banner
 * is intentionally compact — full details live on /family/insights.
 */
export function AnomalyBanner() {
  const connectedMap = useIntegrationsStore((s) => s.connected);
  const meds = useMedsStore((s) => s.meds);

  const anomalies = useMemo(
    () => detect({ connected: new Set(Object.keys(connectedMap)), meds }),
    [connectedMap, meds]
  );

  if (anomalies.length === 0) return null;
  const top = anomalies[0];
  const more = anomalies.length - 1;

  return (
    <Link
      href="/family/insights"
      aria-label={`${anomalies.length} active alert${anomalies.length === 1 ? "" : "s"}`}
      className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-scam-ink/20 bg-scam-bg p-4 text-scam-ink transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scam-ink"
    >
      <span aria-hidden className="text-[22px] leading-none">🚨</span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em]">
            {anomalies.length} alert{anomalies.length === 1 ? "" : "s"}
          </span>
          <span className="text-[11px] font-semibold opacity-80">
            See insights →
          </span>
        </div>
        <p className="mt-1 text-[15px] font-bold leading-snug">
          {top.title}
        </p>
        {more > 0 ? (
          <p className="text-[12px] leading-snug opacity-90">
            +{more} more — {top.body.slice(0, 80)}
            {top.body.length > 80 ? "…" : ""}
          </p>
        ) : (
          <p className="text-[12px] leading-snug opacity-90">{top.body}</p>
        )}
      </div>
    </Link>
  );
}
