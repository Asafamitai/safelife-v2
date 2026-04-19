import { test, expect } from "@playwright/test";

test("family member can open the scam-check review sheet", async ({ page }) => {
  await page.goto("/family/home");

  // The feed should render with at least one card.
  await expect(page.getByText("Today")).toBeVisible();

  // Open the bottom sheet.
  await page.getByRole("button", { name: /check a message now/i }).click();

  // Sheet content should be visible with the title and primary action.
  await expect(page.getByRole("heading", { name: /check a message/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /open scam checker/i })).toBeVisible();

  // Closing the sheet hides the title.
  await page.getByRole("button", { name: /not now/i }).click();
  await expect(
    page.getByRole("heading", { name: /check a message/i })
  ).toBeHidden();
});
