/**
 * Ask without a Claude key: the page must still answer using the rule-based
 * parser and show the "Rules" pill instead of "Live AI". This is the static
 * Pages build's default experience — if it regresses, the demo breaks for
 * anyone who hasn't pasted their own key.
 */
import { test, expect } from "@playwright/test";

test("family ask answers via rules when no Claude key is set", async ({
  page,
}) => {
  // Guarantee a fresh session (no leaked key between specs).
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("safelife:anthropic-key");
    } catch {}
  });

  await page.goto("/family/ask");

  const input = page.getByPlaceholder(/dad take his morning meds/i);
  await input.fill("How is dad today?");
  await page.getByRole("button", { name: /^ask$/i }).click();

  // Fallback must produce a visible answer — the rules path always returns one.
  await expect(page.getByText(/How is dad today\?/)).toBeVisible();
  await expect(page.getByLabel(/answered by built-in rules/i)).toBeVisible();
  await expect(page.getByLabel(/answered by claude/i)).toBeHidden();
});
