import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PARENT_ROUTES = ["/parent/home", "/parent/scam"];

for (const route of PARENT_ROUTES) {
  test(`parent route ${route} has no WCAG AA contrast violations`, async ({
    page,
  }) => {
    await page.goto(route);
    // Settle layout / fonts before scanning.
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag21aa"])
      .include("main, body")
      .analyze();

    const contrast = results.violations.filter(
      (v) => v.id === "color-contrast"
    );

    expect(
      contrast,
      contrast
        .flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(" ")}`))
        .join("\n")
    ).toEqual([]);
  });
}
