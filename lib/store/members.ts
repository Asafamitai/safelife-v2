"use client";

import { create } from "zustand";

export type MemberRole = "Parent" | "Primary caregiver" | "Family";

export interface Member {
  id: string;
  name: string;
  initials: string;
  role: MemberRole;
  /** Free-text contact line, e.g. phone number or "—". */
  contact?: string;
  /** Hue used by the avatar gradient. Just an index into a small palette. */
  hue: 0 | 1 | 2 | 3;
}

interface MembersState {
  members: Member[];
  add: (member: Omit<Member, "id">) => void;
  remove: (id: string) => void;
  reset: () => void;
}

const SEED: Member[] = [
  {
    id: "m-dad",
    name: "Dad",
    initials: "D",
    role: "Parent",
    contact: "555 0101",
    hue: 1,
  },
  {
    id: "m-maya",
    name: "Maya",
    initials: "MA",
    role: "Primary caregiver",
    contact: "555 0177",
    hue: 0,
  },
  {
    id: "m-sam",
    name: "Sam",
    initials: "SA",
    role: "Family",
    contact: "555 0142",
    hue: 2,
  },
];

export const useMembersStore = create<MembersState>((set) => ({
  members: SEED,
  add: (m) =>
    set((state) => ({
      members: [...state.members, { ...m, id: `m-${Date.now()}` }],
    })),
  remove: (id) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
  reset: () => set({ members: SEED }),
}));
