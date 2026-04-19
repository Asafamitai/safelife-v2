"use client";

import { useEventsStore } from "@/lib/store/events";
import { useMedsStore } from "@/lib/store/meds";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string | number;
  tone: "ok" | "med" | "scam" | "ride" | "family";
}

const TONE_INK: Record<Stat["tone"], string> = {
  ok: "text-ok-ink",
  med: "text-med-ink",
  scam: "text-scam-ink",
  ride: "text-ride-ink",
  family: "text-family-ink",
};

/**
 * "This week" summary at the top of the family feed. The numbers come from
 * what's actually in the stores — connect a service or block a scam in the
 * demo and the numbers update live.
 */
export function WeeklyStats() {
  const events = useEventsStore((s) => s.events);
  const meds = useMedsStore((s) => s.meds);
  const connectedCount = useIntegrationsStore(
    (s) => Object.keys(s.connected).length
  );

  const scamsBlocked = events.filter(
    (e) => e.variant === "scam" && /blocked/i.test(e.title)
  ).length;
  const helpRequests = events.filter((e) => e.id.startsWith("help-")).length;
  const dosesTaken = meds.filter((m) => m.takenAt).length;

  const stats: Stat[] = [
    { label: "Scams blocked", value: scamsBlocked, tone: "scam" },
    { label: "Doses taken", value: `${dosesTaken}/${meds.length}`, tone: "med" },
    { label: "Help requests", value: helpRequests, tone: "ride" },
    { label: "Connected", value: connectedCount, tone: "family" },
  ];

  return (
    <section
      aria-label="This week"
      className="mx-4 mt-1 rounded-2xl border border-line bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">
          This week
        </h2>
        <span className="text-[11px] text-muted">Auto-updated</span>
      </div>
      <dl className="mt-3 grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <dt className="text-[11px] leading-tight text-muted">{s.label}</dt>
            <dd
              className={cn(
                "mt-0.5 text-[22px] font-extrabold tracking-tight",
                TONE_INK[s.tone]
              )}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
