"use client";

import { AppHeader } from "@/components/app-frame";
import { FeedCard } from "@/components/feed-card";
import { useEventsStore } from "@/lib/store/events";
import { iconForVariant } from "@/lib/mock-events";

export default function ParentHelpPage() {
  const events = useEventsStore((s) => s.events);
  // Help requests come from the HelpSheet — all event IDs are prefixed `help-`,
  // regardless of which variant (ride / family) they ended up classified as.
  const helpEvents = events.filter(
    (e) => e.id.startsWith("help-") || e.variant === "ride"
  );

  return (
    <>
      <AppHeader parent subtitle="Recent" title="Help history" />
      <section className="flex flex-1 flex-col gap-2.5 px-4 pb-6 pt-2">
        {helpEvents.length === 0 ? (
          <p className="px-2 pt-6 text-[18px] leading-snug text-ink-2">
            No help requests yet. Tap “I need help” on the home screen any
            time.
          </p>
        ) : (
          helpEvents.map((e) => (
            <FeedCard
              key={e.id}
              variant={e.variant}
              tag={e.tag}
              title={e.title}
              body={e.body}
              time={e.time}
              icon={<span aria-hidden>{iconForVariant(e.variant)}</span>}
            />
          ))
        )}
      </section>
    </>
  );
}
