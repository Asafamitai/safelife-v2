"use client";

import { create } from "zustand";

interface ConnectionRecord {
  connectedAt: string;
}

interface IntegrationsState {
  connected: Record<string, ConnectionRecord>;
  isConnected: (id: string) => boolean;
  connect: (id: string) => void;
  disconnect: (id: string) => void;
  reset: () => void;
}

export const useIntegrationsStore = create<IntegrationsState>((set, get) => ({
  // A few seeded so the page doesn't look empty on first load.
  connected: {
    "verizon": { connectedAt: "Yesterday" },
    "google-calendar": { connectedAt: "2 days ago" },
  },
  isConnected: (id) => Boolean(get().connected[id]),
  connect: (id) =>
    set((state) => ({
      connected: {
        ...state.connected,
        [id]: { connectedAt: "Just now" },
      },
    })),
  disconnect: (id) =>
    set((state) => {
      const next = { ...state.connected };
      delete next[id];
      return { connected: next };
    }),
  reset: () => set({ connected: {} }),
}));
