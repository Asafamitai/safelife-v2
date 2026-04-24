"use client";

import { Suspense, useMemo } from "react";
import { AppHeader } from "@/components/app-frame";
import { DigestCard } from "@/components/digest-card";
import { EmptyState } from "@/components/empty-state";
import { FeedCard } from "@/components/feed-card";
import { WeeklyStats } from "@/components/weekly-stats";
import {
  TimelineFilterBar,
  useActiveFilters,
} from "@/components/timeline-filter";
import { useEventsStore } from "@/lib/store/events";
import { iconForVariant, type MockEvent } from "@/lib/mock-events";

type Bucket = "Today" | "Yesterday" | "Earlier";

const BUCKET_ORDER: Bucket[] = ["Today", "Yesterday", "Earlier"];

function bucketOf(time?: string): Bucket {
  if (!time) return "Today";
  // Heuristic — the demo's "time" field is a label, not a real date.
  // Now / a digit:digit time / "Just now" -> Today; "Tue", "Mon", etc -> Earlier.
  if (/^now$|^just now$|^\d{1,2}:\d{2}/i.test(time)) return "Today";
  if (/^yesterday$/i.test(time)) return "Yesterday";
  return "Earlier";
}

export default function FamilyTimelinePage() {
  return (
    <>
      <AppHeader subtitle="This week" title="Timeline" />
      <DigestCard />
      <WeeklyStats />
      <Suspense fallback={null}>
        <FilteredTimeline />
      </Suspense>
    </>
  );
}

function FilteredTimeline() {
  const events = useEventsStore((s) => s.events);
  const active = useActiveFilters();

  const filtered = useMemo(
    () =>
      active.size === 0
        ? events
        : events.filter((e) => active.has(e.variant as never)),
    [events, active]
  );

  const buckets = useMemo(() => {
    const map: Record<Bucket, MockEvent[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const e of filtered) map[bucketOf(e.time)].push(e);
    return map;
  }, [filtered]);

  const hasAny = filtered.length > 0;

  return (
    <>
      <TimelineFilterBar />

      <section className="flex flex-1 flex-col gap-5 px-4 pb-6 pt-2">
        {BUCKET_ORDER.map((b) =>
          buckets[b].length > 0 ? (
            <div key={b} className="flex flex-col gap-2.5">
              <h2 className="px-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                {b}
              </h2>
              {buckets[b].map((e) => (
                <FeedCard
                  key={e.id}
                  variant={e.variant}
                  tag={e.tag}
                  title={e.title}
                  body={e.body}
                  time={e.time}
                  icon={<span aria-hidden>{iconForVariant(e.variant)}</span>}
                />
              ))}
            </div>
          ) : null
        )}
        {!hasAny && events.length > 0 ? (
          <EmptyState
            emoji="🔎"
            title="No matches"
            body="Try a different filter above, or clear filters to see everything."
          />
        ) : null}
        {events.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="No events yet"
            body="Events show up here as scams get blocked, meds get taken, and help requests come in."
          />
        ) : null}
      </section>
    </>
  );
}
