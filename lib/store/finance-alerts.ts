"use client";

import { create } from "zustand";

/**
 * Alert rules for transactions. SafeLife AI raises a flag whenever a
 * rule matches — the "Any transaction" toggle is very chatty and off by
 * default, while the AI-pattern rule is on by default.
 *
 * Persisted manually to localStorage under `safelife:finance-alerts` so
 * a pitch walkthrough can flip a rule and have it stick across a reload.
 */

const STORAGE_KEY = "safelife:finance-alerts";

export interface FinanceAlertRules {
  anyTransaction: boolean;
  over100: boolean;
  over500: boolean;
  aiPattern: boolean;
}

interface Persisted {
  rules: FinanceAlertRules;
}

interface FinanceAlertsState extends Persisted {
  hydrated: boolean;
  set: (rule: keyof FinanceAlertRules, on: boolean) => void;
  reset: () => void;
  hydrate: () => void;
}

const INITIAL: Persisted = {
  rules: {
    anyTransaction: false,
    over100: false,
    over500: true,
    aiPattern: true,
  },
};

function readValid(): Persisted {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Persisted | null;
    if (!parsed || typeof parsed !== "object") return INITIAL;
    const r = parsed.rules;
    if (!r || typeof r !== "object") return INITIAL;
    return {
      rules: {
        anyTransaction: r.anyTransaction === true,
        over100: r.over100 === true,
        over500: r.over500 === true,
        aiPattern: r.aiPattern !== false, // default-on
      },
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
    /* non-fatal */
  }
}

export const useFinanceAlertsStore = create<FinanceAlertsState>((set, get) => ({
  ...INITIAL,
  hydrated: false,
  set: (rule, on) => {
    const next = { ...get().rules, [rule]: on };
    set({ rules: next });
    write({ rules: next });
  },
  reset: () => {
    set({ ...INITIAL, hydrated: true });
    write(INITIAL);
  },
  hydrate: () => {
    if (get().hydrated) return;
    const loaded = readValid();
    set({ ...loaded, hydrated: true });
  },
}));
