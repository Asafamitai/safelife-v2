/**
 * M9 voice guardrails:
 *  - the parent Home speaker button calls `speechSynthesis.speak` with the
 *    current greeting (happy path),
 *  - switching voice mode to "off" in Settings suppresses the utterance.
 */
import { test, expect } from "@playwright/test";
import { bypassOnboarding } from "./_setup";

function withVoiceMode(
  page: import("@playwright/test").Page,
  mode: "off" | "on-tap" | "on-focus"
) {
  return page.addInitScript((m) => {
    try {
      window.localStorage.setItem(
        "safelife:voice-settings",
        JSON.stringify({ mode: m })
      );
    } catch {}
  }, mode);
}

test("parent home speaker reads the greeting aloud", async ({ page }) => {
  await bypassOnboarding(page, "parent");
  await withVoiceMode(page, "on-tap");

  // Instrument speechSynthesis BEFORE any page script runs.
  await page.addInitScript(() => {
    (window as unknown as { __spoken?: string[] }).__spoken = [];
    const raw = window.SpeechSynthesisUtterance;
    window.SpeechSynthesisUtterance = new Proxy(raw, {
      construct(target, args) {
        const instance = new target(args[0] as string);
        (window as unknown as { __spoken: string[] }).__spoken.push(
          args[0] as string
        );
        return instance;
      },
    }) as typeof SpeechSynthesisUtterance;
  });

  await page.goto("/parent/home");

  await page
    .getByRole("button", { name: /read today's summary aloud/i })
    .click();

  const spoken = await page.evaluate(
    () => (window as unknown as { __spoken: string[] }).__spoken
  );
  expect(spoken.join(" ")).toMatch(/good morning, dad/i);
});

test("voice mode 'off' prevents the speaker from speaking", async ({
  page,
}) => {
  await bypassOnboarding(page, "parent");
  await withVoiceMode(page, "off");

  await page.addInitScript(() => {
    (window as unknown as { __spoken?: string[] }).__spoken = [];
    const raw = window.SpeechSynthesisUtterance;
    window.SpeechSynthesisUtterance = new Proxy(raw, {
      construct(target, args) {
        const instance = new target(args[0] as string);
        (window as unknown as { __spoken: string[] }).__spoken.push(
          args[0] as string
        );
        return instance;
      },
    }) as typeof SpeechSynthesisUtterance;
  });

  await page.goto("/parent/home");

  await page
    .getByRole("button", { name: /read today's summary aloud/i })
    .click();

  const spoken = await page.evaluate(
    () => (window as unknown as { __spoken: string[] }).__spoken
  );
  expect(spoken).toEqual([]);
});
