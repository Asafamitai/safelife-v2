"use client";

import { create } from "zustand";

/**
 * Safe Zones live on the family side — caregivers set them up, enable
 * / disable per zone, and get timeline entries when the loved one enters
 * or leaves. The geometry layer (lat/lng, shape) is intentionally left
 * out of v1; zones are symbolic for the demo.
 */

export interface SafeZone {
  id: string;
  name: string;
  /** Emoji icon chosen from the picker. */
  icon: string;
  /** Geofence radius in meters. */
  radius: number;
  enabled: boolean;
}

interface SafeZonesState {
  zones: SafeZone[];
  add: (zone: Omit<SafeZone, "id">) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  reset: () => void;
}

const SEED: SafeZone[] = [
  { id: "sz-home", name: "Home", icon: "🏠", radius: 150, enabled: true },
  { id: "sz-grocery", name: "Grocery", icon: "🛒", radius: 100, enabled: true },
  { id: "sz-park", name: "Park", icon: "🌳", radius: 120, enabled: false },
];

export const useSafeZonesStore = create<SafeZonesState>((set) => ({
  zones: SEED,
  add: (z) =>
    set((state) => ({
      zones: [...state.zones, { ...z, id: `sz-${Date.now()}` }],
    })),
  remove: (id) =>
    set((state) => ({ zones: state.zones.filter((z) => z.id !== id) })),
  toggle: (id) =>
    set((state) => ({
      zones: state.zones.map((z) =>
        z.id === id ? { ...z, enabled: !z.enabled } : z
      ),
    })),
  reset: () => set({ zones: SEED }),
}));
