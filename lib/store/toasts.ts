"use client";

import { create } from "zustand";

export type ToastTone = "ok" | "info" | "warn";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  body?: string;
}

interface ToastsState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

const TIMEOUT_MS = 3500;

export const useToastsStore = create<ToastsState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    if (typeof window !== "undefined") {
      window.setTimeout(() => get().remove(id), TIMEOUT_MS);
    }
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
