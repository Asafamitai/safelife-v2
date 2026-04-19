"use client";

import { create } from "zustand";

/**
 * Lightweight guided-tour state for the demo. Independent from any
 * real product flow — turning it on just adds inline hints to pages
 * that opt in via `useTour()`.
 */

export type TourId = "scam-to-feed" | null;

interface TourState {
  active: TourId;
  /** Index inside the active tour's step list. */
  step: number;
  start: (id: Exclude<TourId, null>) => void;
  advance: () => void;
  stop: () => void;
}

export const useTourStore = create<TourState>((set) => ({
  active: null,
  step: 0,
  start: (id) => set({ active: id, step: 0 }),
  advance: () => set((s) => ({ step: s.step + 1 })),
  stop: () => set({ active: null, step: 0 }),
}));
