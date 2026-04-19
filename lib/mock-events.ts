import type { CategoryVariant } from "@/components/category-tag";

export interface MockEvent {
  id: string;
  variant: CategoryVariant;
  tag: string;
  title: string;
  body?: string;
  time?: string;
}

const ICONS: Record<CategoryVariant, string> = {
  scam: "🛡️",
  med: "💊",
  family: "📅",
  ride: "🚕",
  ok: "✅",
};

export const iconForVariant = (v: CategoryVariant) => ICONS[v];

/**
 * Seed data for the family-side home feed.
 * Later milestones will replace this with a real data source.
 */
export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "evt-1",
    variant: "scam",
    tag: "Scam check",
    title: "Suspicious text blocked",
    body: `"This text asking for bank info looks suspicious. Do not click the link."`,
    time: "Now",
  },
  {
    id: "evt-2",
    variant: "med",
    tag: "Medication reminder",
    title: "Morning meds — done",
    body: "Blood pressure medication marked as taken at 8:00 AM.",
    time: "8:02",
  },
  {
    id: "evt-3",
    variant: "family",
    tag: "Family update",
    title: "Doctor tomorrow, 10:30 AM",
    body: "Ride support booked. Dad will be notified 30 min before.",
    time: "Tue",
  },
  {
    id: "evt-4",
    variant: "ride",
    tag: "Help in one tap",
    title: "Mom asked for a ride home",
    body: "Pickup at Dr. Levi's clinic in 12 min. Cost covered by you.",
    time: "11:24",
  },
];
