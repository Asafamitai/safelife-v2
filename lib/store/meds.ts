"use client";

import { create } from "zustand";

export type MedTone = "blue" | "amber" | "purple" | "red" | "green";

export interface Med {
  id: string;
  name: string;
  dose: string;
  /** Emoji shown in the med card icon tile. */
  icon: string;
  /** Color used for the day pills + icon tint. */
  tone: MedTone;
  /** "Morning" | "With lunch" etc — human label, still used by parent view. */
  schedule: string;
  /** 12h clock display for parent view, e.g. "8:00 AM". */
  takeAt: string;
  /**
   * 24h time(s) the med is scheduled for. Multi-dose scripts (e.g. Metformin
   * morning + evening) pass an array. Kept alongside takeAt so the parent
   * app's existing "8:00 AM" formatting keeps working.
   */
  times: string[];
  /** Length 7, Sunday-first: [Su, Mo, Tu, We, Th, Fr, Sa]. */
  days: boolean[];
  /** If false, the loved one gets no push reminder. */
  remindersOn: boolean;
  /** Set when the dose was confirmed; surfaces as "Taken today". */
  takenAt?: string;
}

interface MedsState {
  meds: Med[];
  confirm: (id: string, takenAt: string) => void;
  add: (med: Omit<Med, "id">) => void;
  remove: (id: string) => void;
  toggleReminders: (id: string) => void;
  reset: () => void;
}

const ALL_WEEK: boolean[] = [true, true, true, true, true, true, true];

const SEED: Med[] = [
  {
    id: "med-1",
    name: "Lisinopril",
    dose: "10 mg",
    icon: "💊",
    tone: "blue",
    schedule: "Morning",
    takeAt: "8:00 AM",
    times: ["08:00"],
    days: ALL_WEEK,
    remindersOn: true,
    // Seeded as already taken today so the adherence card has something
    // to celebrate on first render.
    takenAt: "8:02",
  },
  {
    id: "med-2",
    name: "Vitamin D",
    dose: "1 tablet",
    icon: "☀️",
    tone: "amber",
    schedule: "With lunch",
    takeAt: "12:30 PM",
    times: ["12:30"],
    days: ALL_WEEK,
    remindersOn: true,
    takenAt: "12:35",
  },
  {
    id: "med-3",
    name: "Metformin",
    dose: "500 mg",
    icon: "💊",
    tone: "purple",
    schedule: "Morning + evening",
    takeAt: "8:00 AM",
    times: ["08:00", "19:00"],
    days: ALL_WEEK,
    remindersOn: false,
  },
];

export const useMedsStore = create<MedsState>((set) => ({
  meds: SEED,
  confirm: (id, takenAt) =>
    set((state) => ({
      meds: state.meds.map((m) => (m.id === id ? { ...m, takenAt } : m)),
    })),
  add: (m) =>
    set((state) => ({
      meds: [...state.meds, { ...m, id: `med-${Date.now()}` }],
    })),
  remove: (id) =>
    set((state) => ({ meds: state.meds.filter((m) => m.id !== id) })),
  toggleReminders: (id) =>
    set((state) => ({
      meds: state.meds.map((m) =>
        m.id === id ? { ...m, remindersOn: !m.remindersOn } : m
      ),
    })),
  reset: () => set({ meds: SEED }),
}));
