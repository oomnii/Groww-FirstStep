import { expect, test } from "@playwright/test";
import { EVENTS_KEY, savedState, startBlank, STORAGE_KEY } from "./helpers";

test("Eval 12 — entered answers remain after a reload", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("24");
  await page.getByLabel("Monthly income").fill("18000");
  await page.getByLabel("Essential monthly expenses").fill("9000");
  await page.getByLabel("Current liquid savings").fill("12000");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your goal" })).toBeVisible();
  await page.locator("#type").getByRole("radio", { name: /Travel/ }).check();
  await page.getByLabel("Target amount").fill("15000");
  await page.locator("#horizon").getByRole("radio", { name: /1–3 years/ }).check();
  await expect.poll(async () => savedState(page)).toContain("15000");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your goal" })).toBeVisible();
  await expect(page.getByLabel("Target amount")).toHaveValue("15000");
  await expect(page.locator("#type").getByRole("radio", { name: /Travel/ })).toBeChecked();
  await page.getByRole("button", { name: "1. Start" }).click();
  await expect(page.getByLabel("Monthly income")).toHaveValue("18000");
});

test("Eval 13 — Start over clears this prototype’s saved answers", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("24");
  await page.getByLabel("Monthly income").fill("18000");
  await page.getByLabel("Essential monthly expenses").fill("9000");
  await page.getByLabel("Current liquid savings").fill("12000");
  await expect.poll(async () => savedState(page)).toContain("18000");
  await page.evaluate(() => localStorage.setItem("unrelated-app-key", "keep-me"));
  await page.getByRole("button", { name: "Start over" }).click();
  await page.getByRole("button", { name: "Clear saved answers" }).click();
  await expect(page.getByLabel("Monthly income")).toHaveValue("");
  await expect(page.getByLabel("Age")).toHaveValue("");
  await page.reload();
  await expect(page.getByLabel("Monthly income")).toHaveValue("");
  const stored = await savedState(page);
  expect(stored ?? "").not.toContain("18000");
  const leftover = await page.evaluate(
    ([eventsKey, decoy]) => ({
      events: localStorage.getItem(eventsKey),
      decoy: localStorage.getItem(decoy),
    }),
    [EVENTS_KEY, "unrelated-app-key"] as const,
  );
  expect(leftover.decoy).toBe("keep-me");
  expect(leftover.events ?? "").not.toContain("snapshot_completed");
  await page.evaluate(() => localStorage.removeItem("unrelated-app-key"));
  expect(STORAGE_KEY).toBe("groww-starter-prototype-v1");
});

test("Back returns to the previous step and keeps the amount entered", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("22");
  await page.getByLabel("Monthly income").fill("12000");
  await page.getByLabel("Essential monthly expenses").fill("7000");
  await page.getByLabel("Current liquid savings").fill("4000");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your goal" })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("heading", { name: "Your starting point" })).toBeVisible();
  await expect(page.getByLabel("Monthly income")).toHaveValue("12000");
});

test("A negative amount stays on the step with a neutral message", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("22");
  await page.getByLabel("Monthly income").fill("-5");
  await page.getByLabel("Essential monthly expenses").fill("1000");
  await page.getByLabel("Current liquid savings").fill("0");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your starting point" })).toBeVisible();
  await expect(page.getByText("Negative values are not used in this prototype.")).toBeVisible();
});

test("An amount above the prototype maximum is rejected", async ({ page }) => {
  await startBlank(page);
  await page.getByLabel("Age").fill("22");
  await page.getByLabel("Monthly income").fill("1000001");
  await page.getByLabel("Essential monthly expenses").fill("1000");
  await page.getByLabel("Current liquid savings").fill("0");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Your starting point" })).toBeVisible();
  await expect(page.getByText("Enter an amount up to ₹10,00,000.")).toBeVisible();
});

test("The main routes open without a login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Groww FirstStep" })).toBeVisible();
  await expect(page.getByText(/log in|sign in|password/i)).toHaveCount(0);
  await page.goto("/plan");
  await expect(page.getByRole("heading", { name: "Your starter plan", exact: true })).toBeVisible();
  await expect(page.getByText("Add a starting point first.")).toBeVisible();
  await page.goto("/simulate");
  await expect(page.getByRole("heading", { name: "Risk in rupees" })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Where this journey stands" })).toBeVisible();
});
