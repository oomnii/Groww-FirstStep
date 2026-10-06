import { expect, type Page } from "@playwright/test";

export const STORAGE_KEY = "groww-starter-prototype-v1";
export const EVENTS_KEY = "groww-starter-prototype-events-v1";

export const BANNED_PHRASES = [
  "guaranteed return",
  "best stock",
  "safe investment",
  "you will earn",
  "safest investment",
  "you should definitely buy",
  "this will make you money",
];

const COMFORT = {
  low: [
    "I would need that money immediately",
    "Within a year",
    "Not familiar — I have not really watched this happen",
    "I would rather keep the money in savings",
  ],
  moderate: [
    "I would feel uncomfortable, but I could wait",
    "In 1–3 years",
    "Somewhat familiar — I know values can rise and fall",
    "I could keep a smaller amount invested and review it",
  ],
  high: [
    "I could continue with the plan",
    "In more than 3 years",
    "Familiar — I have seen or read about larger swings",
    "I could stay with a longer-term plan",
  ],
} as const;

export async function resetPrototype(page: Page) {
  await page.goto("/");
  await page.evaluate(
    ([stateKey, eventsKey]) => {
      localStorage.removeItem(stateKey);
      localStorage.removeItem(eventsKey);
    },
    [STORAGE_KEY, EVENTS_KEY] as const,
  );
}

export async function savedState(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
}

export async function startBlank(page: Page) {
  await resetPrototype(page);
  await page.goto("/starter");
  await expect(page.getByRole("heading", { name: "Your starting point" })).toBeVisible();
}

export async function startFromPersona(
  page: Page,
  persona: "student" | "intern" | "first-job" | "higher-income",
) {
  await resetPrototype(page);
  await page.goto(`/starter?persona=${persona}`);
  await expect(page.getByRole("heading", { name: "Your starting point" })).toBeVisible();
  await expect(page.locator("#monthlyIncome")).not.toHaveValue("");
}

export async function continueWizard(page: Page) {
  await page.getByRole("button", { name: "Continue" }).click();
}

export async function chooseGoal(page: Page, goal: RegExp, horizon: RegExp, amount = "20000") {
  await page.locator("#type").getByRole("radio", { name: goal }).check();
  await page.getByLabel("Target amount").fill(amount);
  await page.locator("#horizon").getByRole("radio", { name: horizon }).check();
}

export async function answerComfort(page: Page, level: keyof typeof COMFORT) {
  for (const label of COMFORT[level]) {
    await page.getByRole("radio", { name: label, exact: true }).check();
  }
}

export async function reviewPersona(
  page: Page,
  persona: "student" | "intern" | "first-job" | "higher-income",
  options: { goal: RegExp; horizon: RegExp; comfort: keyof typeof COMFORT },
) {
  await startFromPersona(page, persona);
  await continueWizard(page);
  await expect(page.getByRole("heading", { name: "Your goal" })).toBeVisible();
  await chooseGoal(page, options.goal, options.horizon);
  await continueWizard(page);
  await expect(page.getByRole("heading", { name: "Your comfort with risk" })).toBeVisible();
  await answerComfort(page, options.comfort);
  await continueWizard(page);
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
}

export async function openPlan(page: Page) {
  await page.getByRole("link", { name: "See illustrative split" }).click();
  await expect(page.getByRole("heading", { name: "Your starter plan", exact: true })).toBeVisible();
}

export async function openSimulation(page: Page, optionName: string) {
  await page.getByRole("radio", { name: optionName, exact: true }).check();
  await page.locator("#confidence").getByRole("radio", { name: "2", exact: true }).check();
  await page.getByRole("button", { name: "See what risk feels like" }).click();
  await expect(page.getByRole("heading", { name: "Risk in rupees" })).toBeVisible();
}

export async function illustrate(page: Page, amount: string, percent: string) {
  await page.locator("#simulation-amount").fill(amount);
  await page.locator("#allocation-percent").fill(percent);
  await expect(page.locator("#allocation-percent")).toHaveValue(percent);
}

export async function expectNoMisleadingClaims(page: Page) {
  const text = (await page.locator("body").innerText()).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    expect(text, `rendered page contains “${phrase}”`).not.toContain(phrase);
  }
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);
}

export async function expectInsideViewport(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  const width = page.viewportSize()?.width ?? 0;
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  expect(box.width).toBeGreaterThan(0);
}
