/**
 * Pitching the demo: every return to the marketing landing resets the
 * app to its seed state, so the next investor walkthrough starts clean.
 */
import { test, expect } from "@playwright/test";

test("landing wipes prior demo state and shows a confirmation toast", async ({
  page,
}) => {
  // Seed some demo state at the same origin without addInitScript —
  // init scripts run on every navigation and would re-seed the state
  // we're trying to clear below.
  await page.goto("/privacy/");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "safelife:onboarding",
      JSON.stringify({
        completed: true,
        persona: "family",
        invitedBy: null,
      })
    );
    window.localStorage.setItem(
      "safelife:voice-settings",
      JSON.stringify({ mode: "on-focus" })
    );
  });

  await page.goto("/");

  await expect(
    page.getByRole("status").getByText(/demo reset/i)
  ).toBeVisible();

  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys.filter((k) => k.startsWith("safelife:"))).toEqual([]);
});

test("landing with no prior state stays quiet (no toast)", async ({
  page,
}) => {
  await page.goto("/");
  // Toast only fires when there was actually something to clear.
  await page.waitForTimeout(800);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("after reset on landing, returning to app redirects through onboarding", async ({
  page,
}) => {
  await page.goto("/privacy/");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "safelife:onboarding",
      JSON.stringify({ completed: true, persona: "family", invitedBy: null })
    );
  });

  await page.goto("/");
  await page.waitForTimeout(400);

  await page.goto("/family/home/");
  await expect(page).toHaveURL(/\/onboarding\/?$/);
});
