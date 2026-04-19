"use client";

import { AppHeader } from "@/components/app-frame";
import { FeedCard } from "@/components/feed-card";
import { useEventsStore } from "@/lib/store/events";
import { iconForVariant } from "@/lib/mock-events";

export default function FamilyTimelinePage() {
  const events = useEventsStore((s) => s.events);

  return (
    <>
      <AppHeader subtitle="This week" title="Timeline" />
      <section className="flex flex-1 flex-col gap-2.5 px-4 pb-6 pt-2">
        {events.map((e) => (
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
      </section>
    </>
  );
}
