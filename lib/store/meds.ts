"use client";

import { create } from "zustand";

export interface Med {
  id: string;
  name: string;
  dose: string;
  /** "Morning" | "Lunch" | "Evening" — kept as a label, not a time. */
  schedule: string;
  /** 24h time string for context, e.g. "8:00 AM". */
  takeAt: string;
  takenAt?: string;
}

interface MedsState {
  meds: Med[];
  confirm: (id: string, takenAt: string) => void;
  reset: () => void;
}

const SEED: Med[] = [
  {
    id: "med-1",
    name: "Lisinopril",
    dose: "10 mg",
    schedule: "Morning",
    takeAt: "8:00 AM",
  },
  {
    id: "med-2",
    name: "Vitamin D",
    dose: "1 tablet",
    schedule: "With lunch",
    takeAt: "12:30 PM",
  },
];

export const useMedsStore = create<MedsState>((set) => ({
  meds: SEED,
  confirm: (id, takenAt) =>
    set((state) => ({
      meds: state.meds.map((m) =>
        m.id === id ? { ...m, takenAt } : m
      ),
    })),
  reset: () => set({ meds: SEED }),
}));
