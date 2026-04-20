"use client";

import { create } from "zustand";
import type { DigestResultWithSource } from "@/lib/digest";

/**
 * Persisted state for the "This week" digest card:
 *  - the last computed result (so we don't refetch on every route change),
 *  - a `dismissedAt` timestamp so the Home card stays hidden after dismissal,
 *  - `shouldRecompute()` — 6h freshness window.
 *
 * Zustand's persist middleware isn't used; a thin handwritten layer keeps
 * the store small and avoids the library peer-dep surface. The store is
 * client-only (`"use client"`).
 */

const STORAGE_KEY = "safelife:digest";
const FRESHNESS_MS = 6 * 60 * 60 * 1000;

interface Persisted {
  result: DigestResultWithSource | null;
  dismissedAt: number | null;
}

interface DigestState extends Persisted {
  hydrated: boolean;
  setResult: (result: DigestResultWithSource) => void;
  dismiss: () => void;
  reset: () => void;
  shouldRecompute: () => boolean;
  hydrate: () => void;
}

const INITIAL: Persisted = { result: null, dismissedAt: null };

function read(): Persisted {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Persisted;
    if (typeof parsed !== "object" || parsed === null) return INITIAL;
    return {
      result: parsed.result ?? null,
      dismissedAt: typeof parsed.dismissedAt === "number" ? parsed.dismissedAt : null,
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
    // Quota errors etc. are non-fatal — fall through.
  }
}

export const useDigestStore = create<DigestState>((set, get) => ({
  ...INITIAL,
  hydrated: false,
  setResult: (result) => {
    set({ result });
    write({ result, dismissedAt: get().dismissedAt });
  },
  dismiss: () => {
    const dismissedAt = Date.now();
    set({ dismissedAt });
    write({ result: get().result, dismissedAt });
  },
  reset: () => {
    set({ ...INITIAL, hydrated: true });
    write(INITIAL);
  },
  shouldRecompute: () => {
    const r = get().result;
    if (!r) return true;
    return Date.now() - r.computedAt > FRESHNESS_MS;
  },
  hydrate: () => {
    if (get().hydrated) return;
    const loaded = read();
    set({ ...loaded, hydrated: true });
  },
}));
