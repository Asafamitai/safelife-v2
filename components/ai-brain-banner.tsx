"use client";

/**
 * Compact "SafeLife AI is here" banner. Goes at the top of both home
 * screens so viewers feel the AI as a persistent presence — not a
 * hidden feature.
 *
 * Pulls the summary bullets from the existing stores so it reacts to
 * demo state (scams blocked, doses taken, anomalies). Plain-language,
 * short, one-line-each — matches the "Simple outputs" framing from the
 * pitch deck.
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

  const summary = useMemo(() => {
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
        lead: urgent.title,
        hint: urgent.body ?? "SafeLife is watching this closely.",
      };
    }
    if (blocked > 0) {
      return {
        lead: `Blocked ${blocked} scam${blocked === 1 ? "" : "s"} today.`,
        hint: "Plain language. No action needed from you.",
      };
    }
    if (takenNow === meds.length && meds.length > 0) {
      return {
        lead: "All meds taken. Sleep looks normal.",
        hint: "SafeLife is watching — quiet day so far.",
      };
    }
    return {
      lead: "Learning your parent's baseline.",
      hint: "I'll speak up when something needs attention.",
    };
  }, [events, meds, connected]);

  const Inner = (
    <div className="flex items-start gap-3">
      <div
        aria-hidden
        className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-[#3a78ef] text-[22px] text-white shadow-[0_10px_24px_-10px_rgba(19,87,211,0.6)]"
      >
        🧠
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
            SafeLife AI
          </span>
          <span className="rounded-full bg-chip-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-accent">
            Learns · Decides · Acts
          </span>
        </div>
        <p
          className={cn(
            "mt-1 font-bold leading-snug text-ink",
            parent ? "text-[17px]" : "text-[15px]"
          )}
        >
          {summary.lead}
        </p>
        <p
          className={cn(
            "leading-snug text-ink-2",
            parent ? "mt-1 text-[14px]" : "mt-0.5 text-[12px]"
          )}
        >
          {summary.hint}
        </p>
      </div>
    </div>
  );

  const className =
    "block rounded-2xl border border-accent/30 bg-white p-4 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  if (href) {
    return (
      <Link href={href} className={cn(className, "hover:-translate-y-[1px]")}>
        {Inner}
      </Link>
    );
  }

  return <div className={className}>{Inner}</div>;
}
