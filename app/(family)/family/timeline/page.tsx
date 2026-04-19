"use client";

import { useMemo } from "react";
import { AppHeader } from "@/components/app-frame";
import { FeedCard } from "@/components/feed-card";
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
  const events = useEventsStore((s) => s.events);

  const buckets = useMemo(() => {
    const map: Record<Bucket, MockEvent[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const e of events) map[bucketOf(e.time)].push(e);
    return map;
  }, [events]);

  return (
    <>
      <AppHeader subtitle="This week" title="Timeline" />

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
        {events.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6 text-center">
            <div aria-hidden className="text-2xl">📭</div>
            <p className="mt-2 text-[15px] font-bold text-ink">
              No events yet
            </p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              Events show up here as scams get blocked, meds get taken, and
              help requests come in.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
