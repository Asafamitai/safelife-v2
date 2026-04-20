"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useOnboardingStore } from "@/lib/store/onboarding";

/**
 * Client-side redirect wrapper that funnels new visitors through the
 * onboarding flow the first time they land on a /parent/* or /family/*
 * route.
 *
 * Why client-side: this app ships as `output: "export"`, so Next.js's
 * server `redirect()` helper isn't available. We read the persisted
 * `onboarding` store after mount and call `router.replace`.
 *
 * Invite routing: if `?invite=XYZ` appears on the landing page, we send
 * the user straight into the invite step so the counterpart persona can
 * be pre-selected.
 */
export function FirstRunGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const hydrated = useOnboardingStore((s) => s.hydrated);
  const completed = useOnboardingStore((s) => s.completed);
  const hydrate = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    const invite = params.get("invite");

    // Invite hand-off from the landing page.
    if (invite && pathname === "/") {
      router.replace(`/onboarding/connect/?invite=${invite}`);
      return;
    }

    // Only gate the app routes — the marketing landing and the onboarding
    // routes themselves stay open to anyone.
    const isAppRoute =
      pathname.startsWith("/parent") || pathname.startsWith("/family");
    if (!isAppRoute) return;
    if (completed) return;

    router.replace("/onboarding/");
  }, [hydrated, completed, pathname, params, router]);

  return <>{children}</>;
}
