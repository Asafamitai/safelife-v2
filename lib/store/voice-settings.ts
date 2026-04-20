"use client";

import { create } from "zustand";

/**
 * How much voice does the parent-side user want?
 *
 *  - "off":      silent. No auto-speech, no mic. Closest to the pre-M9 demo.
 *  - "on-tap":   default. The speaker button reads a card aloud only when
 *                explicitly tapped. Safe on iOS — every utterance stems
 *                from a user gesture.
 *  - "on-focus": the parent screen auto-reads a card when the user focuses
 *                or scrolls it into view. Higher touch, can be chatty.
 *
 * Persisted in localStorage so the preference survives reload.
 */

const STORAGE_KEY = "safelife:voice-settings";

export type VoiceMode = "off" | "on-tap" | "on-focus";

interface Persisted {
  mode: VoiceMode;
}

interface VoiceSettingsState extends Persisted {
  hydrated: boolean;
  setMode: (m: VoiceMode) => void;
  hydrate: () => void;
  reset: () => void;
}

const INITIAL: Persisted = { mode: "on-tap" };

function read(): Persisted {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Persisted;
    if (
      parsed?.mode === "off" ||
      parsed?.mode === "on-tap" ||
      parsed?.mode === "on-focus"
    ) {
      return { mode: parsed.mode };
    }
  } catch {
    /* fall through */
  }
  return INITIAL;
}

function write(state: Persisted) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota errors non-fatal */
  }
}

export const useVoiceSettingsStore = create<VoiceSettingsState>((set, get) => ({
  ...INITIAL,
  hydrated: false,
  setMode: (mode) => {
    set({ mode });
    write({ mode });
  },
  hydrate: () => {
    if (get().hydrated) return;
    const loaded = read();
    set({ ...loaded, hydrated: true });
  },
  reset: () => {
    set({ ...INITIAL, hydrated: true });
    write(INITIAL);
  },
}));
