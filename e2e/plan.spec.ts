import { expect, test } from "@playwright/test";
import { continueWizard, expectNoMisleadingClaims, openPlan, reviewPersona, startBlank } from "./helpers";

test("Eval 1 — student with a low buffer sees a buffer-first plan", async ({ page }) => {
  await reviewPersona(page, "student", {
    goal: /Laptop/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await expect(page.getByText("Monthly surplus", { exact: true })).toBeVisible();
  await expect(page.getByText("₹2,500")).toBeVisible();
  await openPlan(page);
  await expect(
    page.getByText("An illustrative way to think about your monthly surplus is buffer first."),
  ).toBeVisible();
  await expect(page.getByText("None of them is a default.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Safety / buffer" })).toBeVisible();
  await expect(page.getByText("₹2,250")).toBeVisible();
  await expect(page.locator('input[name="educational-option"]:checked')).toHaveCount(0);
  await expectNoMisleadingClaims(page);
});

test("Eval 2 — zero income does not crash and explains a zero surplus", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("22");
  await page.getByLabel("Monthly income").fill("0");
  await page.getByLabel("Essential monthly expenses").fill("4000");
  await page.getByLabel("Current liquid savings").fill("0");
  await continueWizard(page);
  await page.locator("#type").getByRole("radio", { name: /Emergency buffer/ }).check();
  await page.getByLabel("Target amount").fill("10000");
  await page.locator("#horizon").getByRole("radio", { name: /1–3 years/ }).check();
  await continueWizard(page);
  await page.getByRole("radio", { name: "I would feel uncomfortable, but I could wait", exact: true }).check();
  await page.getByRole("radio", { name: "In 1–3 years", exact: true }).check();
  await page.getByRole("radio", { name: "Somewhat familiar — I know values can rise and fall", exact: true }).check();
  await page.getByRole("radio", { name: "I could keep a smaller amount invested and review it", exact: true }).check();
  await continueWizard(page);
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await expect(page.getByText("₹0").first()).toBeVisible();
  await expect(page.getByText("no amount is shown as available to invest")).toBeVisible();
  await openPlan(page);
  await expect(page.getByText("This illustration does not show an amount available to invest.")).toBeVisible();
  await expect(page.getByText("not a judgment")).toBeVisible();
});

test("Eval 3 — expenses above income keep surplus at zero without pressure", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("23");
  await page.getByLabel("Monthly income").fill("5000");
  await page.getByLabel("Essential monthly expenses").fill("8000");
  await page.getByLabel("Current liquid savings").fill("1000");
  await continueWizard(page);
  await page.locator("#type").getByRole("radio", { name: /Travel/ }).check();
  await page.getByLabel("Target amount").fill("10000");
  await page.locator("#horizon").getByRole("radio", { name: /1–3 years/ }).check();
  await continueWizard(page);
  await page.getByRole("radio", { name: "I would feel uncomfortable, but I could wait", exact: true }).check();
  await page.getByRole("radio", { name: "In 1–3 years", exact: true }).check();
  await page.getByRole("radio", { name: "Somewhat familiar — I know values can rise and fall", exact: true }).check();
  await page.getByRole("radio", { name: "I could keep a smaller amount invested and review it", exact: true }).check();
  await continueWizard(page);
  await expect(page.getByText("Essential expenses are at least as high as income")).toBeVisible();
  await openPlan(page);
  await expect(page.getByText("Monthly surplus").first()).toBeVisible();
  await expect(page.getByText("This illustration does not show an amount available to invest.")).toBeVisible();
  await expect(page.getByText("not a judgment")).toBeVisible();
  await expect(page.getByText(/you should/i)).toHaveCount(0);
});

test("Eval 4 — intern with a modest surplus sees a mixed plan", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await expect(page.getByText("An illustrative way to think about your monthly surplus is a mix.")).toBeVisible();
  await expect(page.getByText("₹4,800")).toBeVisible();
  await expect(page.getByText("Developing")).toBeVisible();
});

test("Eval 5 — first-job buffer plan differs from the low-buffer plan", async ({ page }) => {
  await reviewPersona(page, "first-job", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await expect(page.getByText("An illustrative way to think about your monthly surplus is a mix.")).toBeVisible();
  await expect(page.getByText("₹9,000")).toBeVisible();
  await expect(
    page.getByText("An illustrative way to think about your monthly surplus is buffer first."),
  ).toHaveCount(0);
});
