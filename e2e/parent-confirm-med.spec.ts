import { test, expect } from "@playwright/test";

test("parent can confirm a medication", async ({ page }) => {
  await page.goto("/parent/home");

  // Pre-condition: at least one med shows the confirm button.
  const confirmBtn = page
    .getByRole("button", { name: /mark .* as taken/i })
    .first();
  await expect(confirmBtn).toBeVisible();

  // Tap target meets 44pt min — assert pixel size.
  const box = await confirmBtn.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

  await confirmBtn.click();

  // After confirming, the same card flips to a "Taken at" badge.
  await expect(page.getByText(/taken at/i).first()).toBeVisible();
});
