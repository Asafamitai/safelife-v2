import type { Page } from "@playwright/test";

/**
 * Most specs want to land directly on an app route. The FirstRunGate
 * redirects un-onboarded visitors to /onboarding, which would break
 * pre-M8 test assumptions. This helper flips the onboarding flag to
 * "completed" BEFORE the page loads, so specs don't have to.
 *
 * Call it before `page.goto(...)` in every spec that starts on a
 * /parent or /family route.
 */
export function bypassOnboarding(
  page: Page,
  persona: "parent" | "family" = "family"
) {
  return page.addInitScript((p) => {
    try {
      window.localStorage.setItem(
        "safelife:onboarding",
        JSON.stringify({ completed: true, persona: p, invitedBy: null })
      );
    } catch {}
  }, persona);
}
