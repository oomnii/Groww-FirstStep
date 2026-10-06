import { expect, test, type Page } from "@playwright/test";
import { STORAGE_KEY } from "./helpers";

const comfortAnswers = {
  "temporary-drop": "uncomfortable-wait",
  "need-money": "one-to-three",
  familiarity: "somewhat",
  "longer-goal": "smaller-amount",
};

function draft(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    snapshot: {
      age: "23",
      monthlyIncome: "20000",
      essentialExpenses: "12000",
      liquidSavings: "15000",
    },
    goal: { type: "travel", targetAmount: "20000", horizon: "1-3-years" },
    riskAnswers: comfortAnswers,
    ...overrides,
  };
}

async function openSeededSimulation(page: Page, state: Record<string, unknown>) {
  await page.goto("/");
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: STORAGE_KEY, value: state },
  );
  await page.goto("/simulate");
  await expect(page.getByRole("heading", { name: "Risk in rupees" })).toBeVisible();
}

async function fillDecision(page: Page, amount: string, percent: string) {
  await page.getByRole("radio", { name: /Stability Bucket/ }).check();
  await page.locator("#simulation-amount").fill(amount);
  await page.locator("#allocation-percent").fill(percent);
  await page.getByRole("radio", { name: "I would be uncomfortable but wait" }).check();
  await page.locator("#scenario-acknowledgement").check();
}

async function savedSimulation(page: Page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedSimulation: unknown };
    return parsed.savedSimulation;
  }, STORAGE_KEY);
}

test("an amount of ₹0 cannot be saved and does not show scenario cards", async ({ page }) => {
  await openSeededSimulation(page, draft());
  await fillDecision(page, "0", "40");
  await expect(page.getByText(/temporarily fell/)).toHaveCount(0);
  await page.getByRole("button", { name: "Save this simulated decision" }).click();
  await expect(page.getByText("Enter an amount above ₹0.")).toBeVisible();
  await expect(page.locator("#simulation-amount")).toBeFocused();
  await expect(page.getByText(/Saved illustration:/)).toHaveCount(0);
  expect(await savedSimulation(page)).toBeNull();
});

test("an allocation of 0% cannot be saved and does not show scenario cards", async ({ page }) => {
  await openSeededSimulation(page, draft());
  await fillDecision(page, "2000", "40");
  await expect(page.getByText("If ₹800 temporarily fell 20%, the value would be ₹640.")).toBeVisible();
  await page.locator("#allocation-percent").fill("0");
  await expect(page.locator("#allocation-percent")).toHaveValue("0");
  await expect(page.getByText(/temporarily fell/)).toHaveCount(0);
  await page.getByRole("button", { name: "Save this simulated decision" }).click();
  await expect(page.locator(".field-error")).toHaveText("Set a share above 0%.");
  await expect(page.locator("#allocation-percent")).toBeFocused();
  expect(await savedSimulation(page)).toBeNull();
});

test("a missing goal cannot produce a saved decision", async ({ page }) => {
  await openSeededSimulation(
    page,
    draft({ goal: { type: null, targetAmount: "", horizon: null } }),
  );
  await expect(page.getByText(/Complete the Starter flow/)).toBeVisible();
  await fillDecision(page, "2000", "40");
  await page.getByRole("button", { name: "Save this simulated decision" }).click();
  await expect(page.locator("#starter-flow-link")).toBeFocused();
  await expect(page.getByRole("link", { name: "Return to the starter flow" })).toHaveAttribute(
    "href",
    "/starter",
  );
  expect(await savedSimulation(page)).toBeNull();
});

test("a missing risk profile cannot produce a saved decision", async ({ page }) => {
  await openSeededSimulation(page, draft({ riskAnswers: {} }));
  await fillDecision(page, "2000", "40");
  await page.getByRole("button", { name: "Save this simulated decision" }).click();
  await expect(page.locator(".field-error")).toHaveText(
    "Complete the Starter flow so the FOMO Firewall can evaluate this decision properly.",
  );
  await expect(page.locator("#starter-flow-link")).toBeFocused();
  expect(await savedSimulation(page)).toBeNull();
});

test("a normal simulation still saves, including an amount above surplus", async ({ page }) => {
  await openSeededSimulation(page, draft());
  await fillDecision(page, "9000", "40");
  await expect(
    page.getByText("This is above the monthly surplus calculated from the information you entered."),
  ).toBeVisible();
  await expect(page.getByText("If ₹3,600 temporarily fell 20%, the value would be ₹2,880.")).toBeVisible();
  await page.getByRole("button", { name: "Save this simulated decision" }).click();
  await expect(page.getByText(/Saved illustration: Stability Bucket, ₹9,000, 40% share/)).toBeVisible();
  const saved = await savedSimulation(page);
  expect(saved).toMatchObject({ amount: 9000, allocationPercent: 40, optionId: "stability-bucket" });
});
