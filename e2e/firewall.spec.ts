import { expect, test } from "@playwright/test";
import { illustrate, openPlan, openSimulation, reviewPersona } from "./helpers";

test("Eval 6 — a short horizon with a higher-volatility option raises a mismatch", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Laptop/,
    horizon: /Under 1 year/,
    comfort: "high",
  });
  await openPlan(page);
  await openSimulation(page, "Growth Basket");
  await illustrate(page, "2000", "40");
  await expect(page.getByText("Higher-volatility option with a short goal horizon")).toBeVisible();
});

test("Eval 7 — a low comfort level with Growth Basket raises a risk mismatch", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "low",
  });
  await openPlan(page);
  await openSimulation(page, "Growth Basket");
  await illustrate(page, "2000", "40");
  await expect(page.getByText("Higher-volatility option with a Low comfort level")).toBeVisible();
});

test("Eval 8 — Single Stock Demo above 35% raises a non-diversification signal", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await openSimulation(page, "Single Stock Demo");
  await illustrate(page, "2000", "40");
  await expect(page.getByText("A non-diversified example has a large share")).toBeVisible();
  await expect(page.getByText("A large share is in one option")).toHaveCount(0);
});

test("Eval 9 — one option above 60% raises a concentration signal", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await openSimulation(page, "Balanced Basket");
  await illustrate(page, "2000", "70");
  await expect(page.getByText("A large share is in one option")).toBeVisible();
});

test("Eval 10 — a thin buffer with a higher-volatility share raises a buffer signal", async ({ page }) => {
  await reviewPersona(page, "student", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await openSimulation(page, "Growth Basket");
  await illustrate(page, "2000", "40");
  await expect(page.getByText("Thin cash buffer with a higher-volatility share")).toBeVisible();
});

test("Eval 11 — ₹5,000 at −20% is illustrated as ₹4,000", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await openSimulation(page, "Stability Bucket");
  await illustrate(page, "5000", "100");
  await expect(
    page.getByText("If ₹5,000 temporarily fell 20%, the value would be ₹4,000."),
  ).toBeVisible();
});

test("Eval 14 — a firewall signal can be continued and saved", async ({ page }) => {
  await reviewPersona(page, "intern", {
    goal: /Travel/,
    horizon: /1–3 years/,
    comfort: "moderate",
  });
  await openPlan(page);
  await openSimulation(page, "Balanced Basket");
  await illustrate(page, "2000", "70");
  await page.getByRole("radio", { name: "I would be uncomfortable but wait" }).check();
  const continueButton = page.getByRole("button", { name: "Continue with this simulation" });
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.locator("#scenario-acknowledgement")).toBeFocused();
  await page.locator("#scenario-acknowledgement").check();
  await page.getByRole("button", { name: "Save this simulated decision" }).click();
  await expect(page.getByText(/Saved illustration:/)).toBeVisible();
  await expect(page.getByText(/Pauses recorded:/)).toBeVisible();
  await expect(page).toHaveURL(/\/simulate$/);
});
