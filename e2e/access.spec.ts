import { expect, test } from "@playwright/test";
import {
  expectInsideViewport,
  expectNoHorizontalOverflow,
  expectNoMisleadingClaims,
  illustrate,
  openPlan,
  openSimulation,
  reviewPersona,
  startBlank,
} from "./helpers";

test("Eval 15 — the core journey can be completed from the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();

  await startBlank(page);
  await page.locator("#age").focus();
  await page.keyboard.type("22");
  await page.keyboard.press("Tab");
  await expect(page.locator("#monthlyIncome")).toBeFocused();
  await page.keyboard.type("8000");
  await page.keyboard.press("Tab");
  await expect(page.locator("#essentialExpenses")).toBeFocused();
  await page.keyboard.type("5500");
  await page.keyboard.press("Tab");
  await expect(page.locator("#liquidSavings")).toBeFocused();
  await page.keyboard.type("3000");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Back to intro" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "Your goal" })).toBeVisible();
  await page.locator("#type").getByRole("radio", { name: /Travel/ }).focus();
  await page.keyboard.press("Space");
  await page.locator("#targetAmount").focus();
  await page.keyboard.type("20000");
  await page.locator("#horizon").getByRole("radio", { name: /1–3 years/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: "Your comfort with risk" })).toBeVisible();
  for (const label of [
    "I would feel uncomfortable, but I could wait",
    "In 1–3 years",
    "Somewhat familiar — I know values can rise and fall",
    "I could keep a smaller amount invested and review it",
  ]) {
    await page.getByRole("radio", { name: label, exact: true }).focus();
    await page.keyboard.press("Space");
  }
  await page.getByRole("button", { name: "Continue" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await expect(page.getByText("₹2,500")).toBeVisible();

  await page.getByRole("link", { name: "See illustrative split" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Your starter plan", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "Stability Bucket", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.locator("#confidence").getByRole("radio", { name: "3", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "See what risk feels like" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Risk in rupees" })).toBeVisible();
  await page.locator("#simulation-amount").focus();
  await page.keyboard.type("2000");
  await page.locator("#allocation-percent").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("If ₹20 temporarily fell 20%")).toBeVisible();
});

test.describe("Eval 16 — mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("critical controls stay inside a 390px width", async ({ page }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);
    await expectInsideViewport(page, "a.btn-primary");

    await startBlank(page);
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Continue" }).scrollIntoViewIfNeeded();
    await expectInsideViewport(page, "button.btn-primary");

    await reviewPersona(page, "student", {
      goal: /Travel/,
      horizon: /1–3 years/,
      comfort: "moderate",
    });
    await openPlan(page);
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "See what risk feels like" }).scrollIntoViewIfNeeded();
    await expectInsideViewport(page, "button.btn-primary");

    await openSimulation(page, "Stability Bucket");
    await illustrate(page, "1000", "20");
    await expectNoHorizontalOverflow(page);
    await page.locator("#simulation-amount").scrollIntoViewIfNeeded();
    await expectInsideViewport(page, "#simulation-amount");
    await page.locator("#allocation-percent").scrollIntoViewIfNeeded();
    await expectInsideViewport(page, "#allocation-percent");

    await page.goto("/progress");
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Start over" }).scrollIntoViewIfNeeded();
    await expectInsideViewport(page, "button.btn-ghost");
  });
});

test("Rendered pages do not show misleading investment claims", async ({ page }) => {
  await page.goto("/");
  await expectNoMisleadingClaims(page);
  await page.goto("/starter");
  await expectNoMisleadingClaims(page);
  await reviewPersona(page, "student", {
    goal: /Laptop/,
    horizon: /Under 1 year/,
    comfort: "low",
  });
  await expectNoMisleadingClaims(page);
  await openPlan(page);
  await expectNoMisleadingClaims(page);
  await openSimulation(page, "Single Stock Demo");
  await illustrate(page, "5000", "100");
  await expect(page.getByRole("heading", { name: "FOMO Firewall" })).toBeVisible();
  await expectNoMisleadingClaims(page);
  await page.goto("/progress");
  await expectNoMisleadingClaims(page);
});
