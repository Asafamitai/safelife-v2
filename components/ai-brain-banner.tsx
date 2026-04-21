"use client";

/**
 * Compact "SafeLife AI is here" banner. Goes at the top of both home
 * screens so viewers feel the AI as a persistent presence — not a
 * hidden feature.
 *
 * When any urgent anomaly is detected, the banner takes over the job
 * that used to belong to <AnomalyBanner /> — same red scam styling, same
 * link to /family/insights. That way the family home keeps a single top
 * alert instead of stacking two.
 */

import { useMemo } from "react";
import Link from "next/link";
import { detect } from "@/lib/anomalies";
import { useEventsStore } from "@/lib/store/events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { cn } from "@/lib/utils";

interface Props {
  /** Parent persona: larger type, calmer voice. */
  parent?: boolean;
  /** Where tapping the banner should go. Default "/family/insights". */
  href?: string;
}

export function AiBrainBanner({ parent = false, href }: Props) {
  const events = useEventsStore((s) => s.events);
  const meds = useMedsStore((s) => s.meds);
  const connected = useIntegrationsStore((s) => s.connected);

  const state = useMemo(() => {
    const anomalies = detect({
      connected: new Set(Object.keys(connected)),
      meds,
    });
    const blocked = events.filter(
      (e) => e.variant === "scam" && /blocked/i.test(e.title)
    ).length;
    const takenNow = meds.filter((m) => m.takenAt).length;

    // Pick the single strongest signal to lead with.
    const urgent = anomalies.find((a) => a.severity === "urgent");
    if (urgent) {
      return {
        tone: "alert" as const,
        lead: urgent.title,
        hint: urgent.body ?? "SafeLife is watching this closely.",
      };
    }
    if (blocked > 0) {
      return {
        tone: "ok" as const,
        lead: `Blocked ${blocked} scam${blocked === 1 ? "" : "s"} today.`,
        hint: "Plain language. No action needed from you.",
      };
    }
    if (takenNow === meds.length && meds.length > 0) {
      return {
        tone: "ok" as const,
        lead: "All meds taken. Sleep looks normal.",
        hint: "SafeLife is watching — quiet day so far.",
      };
    }
    return {
      tone: "ok" as const,
      lead: "Learning your parent's baseline.",
      hint: "I'll speak up when something needs attention.",
    };
  }, [events, meds, connected]);

  const alert = state.tone === "alert";

  const Inner = (
    <div className="flex items-start gap-3">
      <div
        aria-hidden
        className={cn(
          "grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl text-[22px] text-white",
          alert
            ? "bg-scam-ink shadow-[0_10px_24px_-10px_rgba(180,35,24,0.5)]"
            : "bg-gradient-to-br from-accent to-[#3a78ef] shadow-[0_10px_24px_-10px_rgba(19,87,211,0.6)]"
        )}
      >
        {alert ? "🚨" : "🧠"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.12em]",
              alert ? "text-scam-ink" : "text-accent"
            )}
          >
            SafeLife AI
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
              alert ? "bg-white text-scam-ink" : "bg-chip-blue text-accent"
            )}
          >
            {alert ? "Needs attention" : "Learns · Decides · Acts"}
          </span>
        </div>
        <p
          className={cn(
            "mt-1 font-bold leading-snug",
            alert ? "text-scam-ink" : "text-ink",
            parent ? "text-[17px]" : "text-[15px]"
          )}
        >
          {state.lead}
        </p>
        <p
          className={cn(
            "leading-snug",
            alert ? "text-scam-ink/80" : "text-ink-2",
            parent ? "mt-1 text-[14px]" : "mt-0.5 text-[12px]"
          )}
        >
          {state.hint}
        </p>
      </div>
    </div>
  );

  const className = cn(
    "block rounded-2xl border p-4 transition-transform focus-visible:outline-none focus-visible:ring-2",
    alert
      ? "border-scam-ink/30 bg-scam-bg focus-visible:ring-scam-ink"
      : "border-accent/30 bg-white focus-visible:ring-accent"
  );

  // When alerting, force a href to /family/insights so the banner acts
  // as the anomaly link — replacing the standalone AnomalyBanner.
  const linkHref = alert ? href ?? "/family/insights" : href;

  if (linkHref) {
    return (
      <Link
        href={linkHref}
        className={cn(className, "hover:-translate-y-[1px]")}
      >
        {Inner}
      </Link>
    );
  }

  return <div className={className}>{Inner}</div>;
}
