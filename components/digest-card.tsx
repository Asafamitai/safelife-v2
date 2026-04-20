"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { buildDigest } from "@/lib/digest";
import type { AskSnapshot } from "@/lib/ask-parser";
import { INTEGRATION_PROVIDERS } from "@/lib/integrations";
import { useDigestStore } from "@/lib/store/digest";
import { useEventsStore } from "@/lib/store/events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { useMembersStore } from "@/lib/store/members";
import { ClaudeStatusPill } from "@/components/claude-status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TAG_TONE: Record<
  string,
  { bg: string; ink: string }
> = {
  scam: { bg: "bg-scam-bg", ink: "text-scam-ink" },
  med: { bg: "bg-med-bg", ink: "text-med-ink" },
  help: { bg: "bg-ride-bg", ink: "text-ride-ink" },
  family: { bg: "bg-family-bg", ink: "text-family-ink" },
  ride: { bg: "bg-ride-bg", ink: "text-ride-ink" },
  ok: { bg: "bg-ok-bg", ink: "text-ok-ink" },
};

interface Props {
  /**
   * On Home: dismissible (compacts to a "See this week" link after dismiss).
   * On Timeline: always rendered in full.
   */
  dismissible?: boolean;
  className?: string;
}

export function DigestCard({ dismissible = false, className }: Props) {
  const events = useEventsStore((s) => s.events);
  const meds = useMedsStore((s) => s.meds);
  const members = useMembersStore((s) => s.members);
  const connected = useIntegrationsStore((s) => s.connected);

  const result = useDigestStore((s) => s.result);
  const dismissedAt = useDigestStore((s) => s.dismissedAt);
  const setResult = useDigestStore((s) => s.setResult);
  const dismiss = useDigestStore((s) => s.dismiss);
  const shouldRecompute = useDigestStore((s) => s.shouldRecompute);
  const hydrated = useDigestStore((s) => s.hydrated);
  const hydrate = useDigestStore((s) => s.hydrate);

  const snapshot = useMemo<AskSnapshot>(
    () => ({
      events,
      meds,
      members,
      connected: new Set(Object.keys(connected)),
      providers: INTEGRATION_PROVIDERS,
    }),
    [events, meds, members, connected]
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!shouldRecompute()) return;
    let cancelled = false;
    (async () => {
      const next = await buildDigest(snapshot);
      if (!cancelled) setResult(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, snapshot, setResult, shouldRecompute]);

  if (!hydrated) {
    return (
      <article
        className={cn(
          "mx-4 my-3 rounded-2xl border border-line bg-white p-5",
          className
        )}
      >
        <Skeleton className="h-[14px] w-24" />
        <Skeleton className="mt-2 h-[20px] w-3/4" />
        <Skeleton className="mt-3 h-[14px] w-full" />
        <Skeleton className="mt-1.5 h-[14px] w-5/6" />
      </article>
    );
  }

  if (!result) return null;

  const dismissed =
    dismissible && !!dismissedAt && result.computedAt <= dismissedAt;

  if (dismissed) {
    return (
      <Link
        href="/family/timeline"
        className={cn(
          "mx-4 my-3 flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 transition-transform hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-2">
          <span aria-hidden>📅</span>
          See this week’s recap
        </span>
        <span aria-hidden className="text-accent">→</span>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        "mx-4 my-3 rounded-2xl border border-line bg-white p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            This week
          </p>
          <h3 className="mt-1 text-[18px] font-extrabold leading-snug tracking-tight text-ink">
            {result.headline}
          </h3>
        </div>
        <ClaudeStatusPill source={result.source} />
      </div>

      <ul className="mt-3 grid gap-1.5 text-[14px] leading-snug text-ink-2">
        {result.bullets.map((b, i) => (
          <li key={i}>· {b}</li>
        ))}
      </ul>

      {result.highlights && result.highlights.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {result.highlights.map((h, i) => {
            const tone = TAG_TONE[h.tag] ?? TAG_TONE.ok;
            return (
              <li
                key={i}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]",
                  tone.bg,
                  tone.ink
                )}
              >
                {h.label}
              </li>
            );
          })}
        </ul>
      ) : null}

      {dismissible ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            href="/family/timeline"
            className="text-[12px] font-bold uppercase tracking-[0.08em] text-accent hover:underline"
          >
            Open timeline
          </Link>
          <button
            type="button"
            onClick={() => dismiss()}
            className="min-h-[36px] rounded-full border border-line bg-white px-3 py-1 text-[12px] font-semibold text-muted hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </article>
  );
}
