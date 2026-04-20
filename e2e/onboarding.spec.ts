/**
 * Onboarding M8 guardrails:
 *  - fresh browser lands in /onboarding when an app route is requested,
 *  - full four-step flow drops the user on the chosen persona's home,
 *  - an invite URL pre-fills the opposite persona's side.
 */
import { test, expect } from "@playwright/test";

/**
 * Clear any persisted onboarding state ONCE after load. Avoid
 * `addInitScript`-style clearing — that runs on every navigation and
 * would wipe the state we're trying to observe, e.g. "completed" being
 * written during the flow.
 */
async function clearStorageOnce(page: import("@playwright/test").Page) {
  // Hit any page at the same origin so localStorage has an origin to
  // clear against. `/` is cheap.
  await page.goto("/");
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch {}
  });
}

test("first-run visitor is redirected from /family/home to /onboarding", async ({
  page,
}) => {
  await clearStorageOnce(page);

  await page.goto("/family/home");

  await expect(page).toHaveURL(/\/onboarding\/?$/);
  await expect(
    page.getByRole("heading", {
      name: /make sure they/i,
    })
  ).toBeVisible();
});

test("completing onboarding as family lands on /family/home and sticks", async ({
  page,
}) => {
  await clearStorageOnce(page);

  await page.goto("/onboarding/");
  await page.getByRole("link", { name: /get started/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/persona/);
  await page.getByRole("button", { name: /i'm the family member/i }).click();
  await page.getByRole("button", { name: /^continue$/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/connect/);
  await page.getByRole("button", { name: /^continue$/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/done/);
  await page.getByRole("button", { name: /open safelife/i }).click();

  await expect(page).toHaveURL(/\/family\/home/);

  // Gate should not push us back through onboarding after completion.
  await page.goto("/parent/home/");
  await expect(page).toHaveURL(/\/parent\/home/);
});

test("opening an invite URL pre-selects the opposite persona", async ({
  page,
}) => {
  await clearStorageOnce(page);

  // Payload: sender=Maya, role=family — recipient should end up as the parent side.
  const invite =
    "eyJtZW1iZXJJZCI6Im0tbWF5YSIsIm1lbWJlck5hbWUiOiJNYXlhIiwicm9sZSI6ImZhbWlseSIsInYiOjF9";

  await page.goto(`/?invite=${invite}`);

  await expect(page).toHaveURL(
    new RegExp(`/onboarding/connect/?\\?invite=${invite}$`)
  );
  await expect(
    page.getByRole("heading", { name: /you've been invited/i })
  ).toBeVisible();
  await expect(page.getByText(/maya/i)).toBeVisible();
  await expect(page.getByText(/loved one/i)).toBeVisible();
});
