"use client";

import { create } from "zustand";
import { MOCK_EVENTS, type MockEvent } from "@/lib/mock-events";

interface EventsState {
  events: MockEvent[];
  prepend: (event: MockEvent) => void;
  dismiss: (id: string) => void;
  reset: () => void;
}

/**
 * Single source of truth for the family feed during v1.
 * Replaces the static MOCK_EVENTS export at runtime so milestones
 * M2 (family feed) and M4 (scam-check appends) can share state.
 */
export const useEventsStore = create<EventsState>((set) => ({
  events: MOCK_EVENTS,
  prepend: (event) =>
    set((state) => ({ events: [event, ...state.events] })),
  dismiss: (id) =>
    set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
  reset: () => set({ events: MOCK_EVENTS }),
}));
