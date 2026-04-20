/**
 * Timeline M7 guardrails:
 *  - filter chip toggles reflect in URL ?f= and hide non-matching cards,
 *  - digest card dismiss on Home persists across reload.
 */
import { test, expect } from "@playwright/test";

test("timeline filter reflects in URL and narrows the feed", async ({
  page,
}) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("safelife:digest");
    } catch {}
  });

  await page.goto("/family/timeline");

  // Seed events include at least one scam and one med — both variants are
  // default-visible.
  await expect(page.getByText(/suspicious text blocked/i)).toBeVisible();
  await expect(page.getByText(/morning meds — done/i)).toBeVisible();

  await page.getByRole("button", { name: /^💊meds$/i }).click();

  await expect(page).toHaveURL(/\?f=med/);
  await expect(page.getByText(/morning meds — done/i)).toBeVisible();
  await expect(page.getByText(/suspicious text blocked/i)).toBeHidden();

  // Clear resets the URL and re-shows everything.
  await page.getByRole("button", { name: /^clear$/i }).click();
  await expect(page).not.toHaveURL(/\?f=/);
  await expect(page.getByText(/suspicious text blocked/i)).toBeVisible();
});

test("home digest card dismiss persists across reload", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("safelife:digest");
    } catch {}
  });

  await page.goto("/family/home");

  // Digest needs a moment to compute + hydrate. The dismiss button only
  // renders after a result is available.
  const dismiss = page.getByRole("button", { name: /^dismiss$/i });
  await expect(dismiss).toBeVisible();
  await dismiss.click();

  const collapsed = page.getByRole("link", { name: /see this week/i });
  await expect(collapsed).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("link", { name: /see this week/i })
  ).toBeVisible();
});
