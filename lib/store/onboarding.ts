"use client";

import { create } from "zustand";

/**
 * First-run state for the demo. Persisted manually in localStorage so
 * returning visitors aren't dragged back through onboarding on every
 * session.
 *
 * The gate ([components/first-run-gate.tsx]) reads this store and
 * redirects only when a new browser opens a /parent/* or /family/*
 * route directly without having completed (or explicitly skipped) the
 * onboarding flow.
 */

const STORAGE_KEY = "safelife:onboarding";

export type OnboardingPersona = "parent" | "family";

interface Persisted {
  completed: boolean;
  persona: OnboardingPersona | null;
  invitedBy: string | null; // member name of the person who sent the invite, if any
}

interface OnboardingState extends Persisted {
  hydrated: boolean;
  setPersona: (p: OnboardingPersona) => void;
  setInvitedBy: (name: string | null) => void;
  complete: () => void;
  reset: () => void;
  hydrate: () => void;
}

const INITIAL: Persisted = {
  completed: false,
  persona: null,
  invitedBy: null,
};

function read(): Persisted {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Persisted;
    if (typeof parsed !== "object" || parsed === null) return INITIAL;
    return {
      completed: parsed.completed === true,
      persona:
        parsed.persona === "parent" || parsed.persona === "family"
          ? parsed.persona
          : null,
      invitedBy: typeof parsed.invitedBy === "string" ? parsed.invitedBy : null,
    };
  } catch {
    return INITIAL;
  }
}

function write(state: Persisted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota errors non-fatal */
  }
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...INITIAL,
  hydrated: false,
  setPersona: (persona) => {
    set({ persona });
    write({ ...get(), persona });
  },
  setInvitedBy: (invitedBy) => {
    set({ invitedBy });
    write({ ...get(), invitedBy });
  },
  complete: () => {
    set({ completed: true });
    write({ ...get(), completed: true });
  },
  reset: () => {
    set({ ...INITIAL, hydrated: true });
    write(INITIAL);
  },
  hydrate: () => {
    if (get().hydrated) return;
    const loaded = read();
    set({ ...loaded, hydrated: true });
  },
}));
