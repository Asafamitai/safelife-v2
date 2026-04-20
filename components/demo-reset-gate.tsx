"use client";

import { useEffect, useState } from "react";
import { useDigestStore } from "@/lib/store/digest";
import { useEventsStore } from "@/lib/store/events";
import { useIntegrationsStore } from "@/lib/store/integrations";
import { useMedsStore } from "@/lib/store/meds";
import { useMembersStore } from "@/lib/store/members";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useSafeZonesStore } from "@/lib/store/safe-zones";
import { useVoiceSettingsStore } from "@/lib/store/voice-settings";
import { useTourStore } from "@/lib/tour";

/**
 * Mounted on the marketing landing page. Every time a visitor returns
 * to `/`, the demo snaps back to a clean seed state — persisted keys
 * cleared, Zustand stores reset — so investor walkthroughs always
 * start identically.
 *
 * First-time marketing visitors have no state to reset, so this is a
 * no-op for them (including the toast — it only shows when something
 * was actually cleared).
 */
/**
 * Tracks whether this page load already ran a reset. Module-scoped (not
 * component state) so React 18 StrictMode's double-invoked effects
 * don't re-observe "no keys" on the second pass and skip the toast.
 */
let resetRanThisLoad = false;

export function DemoResetGate() {
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If a previous mount already did the reset on this page load, still
    // show the toast (state may have been cleared between them) but skip
    // repeating the resets.
    if (!resetRanThisLoad) {
      let hadState = false;
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith("safelife:")) {
            hadState = true;
            break;
          }
        }
      } catch {
        return;
      }
      if (!hadState) return;

      // Reset every in-memory store to its seed first. Some store resets
      // write their INITIAL state back to localStorage, so we do them
      // before the cleanup pass that removes safelife:* keys.
      useEventsStore.getState().reset();
      useMedsStore.getState().reset();
      useMembersStore.getState().reset();
      useIntegrationsStore.getState().reset();
      useSafeZonesStore.getState().reset();
      useDigestStore.getState().reset();
      useOnboardingStore.getState().reset();
      useVoiceSettingsStore.getState().reset();
      useTourStore.getState().stop();

      try {
        const toRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith("safelife:")) toRemove.push(key);
        }
        toRemove.forEach((k) => window.localStorage.removeItem(k));
      } catch {
        /* non-fatal */
      }

      resetRanThisLoad = true;
    }

    setToastVisible(true);
    const t = window.setTimeout(() => setToastVisible(false), 2800);
    return () => window.clearTimeout(t);
  }, []);

  if (!toastVisible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-bold text-white shadow-card"
    >
      <span aria-hidden className="mr-1.5">🔄</span>
      Demo reset — fresh session ready
    </div>
  );
}
