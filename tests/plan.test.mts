import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { personas } from "../src/data/personas.ts";
import { buildStarterPlan } from "../src/lib/plan.ts";
import { scoreRisk } from "../src/lib/risk.ts";
import type { FinancialSnapshot, Goal, UserPersona } from "../src/types/index.ts";

function snapshotFromPersona(persona: UserPersona): FinancialSnapshot {
  return {
    age: persona.age,
    monthlyIncome: persona.monthlyIncome,
    essentialExpenses: persona.essentialExpenses,
    liquidSavings: persona.liquidSavings,
    investmentExperience: persona.investmentExperience,
  };
}

function allocation(plan: ReturnType<typeof buildStarterPlan>, id: "buffer" | "explore") {
  const match = plan.allocations.find((item) => item.id === id);
  assert.ok(match);
  return match;
}

describe("starter plan rules", () => {
  it("keeps Persona A on a buffer-first illustration", () => {
    const plan = buildStarterPlan(snapshotFromPersona(personas[0]));
    assert.equal(plan.monthlySurplus, 2500);
    assert.equal(plan.illustrativeEmergencyTarget, 16500);
    assert.equal(plan.coverageBand, "under-1");
    assert.equal(plan.priority, "buffer-first");
    assert.equal(plan.investableAmountShown, true);
    assert.equal(allocation(plan, "buffer").amount, 2250);
    assert.equal(allocation(plan, "explore").amount, 250);
    assert.match(plan.headline, /illustrative/i);
  });

  it("uses a mixed illustration for Personas B and C", () => {
    const intern = buildStarterPlan(snapshotFromPersona(personas[1]));
    assert.equal(intern.monthlySurplus, 8000);
    assert.equal(intern.illustrativeEmergencyTarget, 36000);
    assert.equal(intern.emergencyCoverageMonths, 1.25);
    assert.equal(intern.priority, "mixed");
    assert.equal(allocation(intern, "buffer").amount, 4800);
    assert.equal(allocation(intern, "explore").amount, 3200);

    const employee = buildStarterPlan(snapshotFromPersona(personas[2]));
    assert.equal(employee.monthlySurplus, 15000);
    assert.equal(employee.illustrativeEmergencyTarget, 60000);
    assert.equal(employee.emergencyCoverageMonths, 2);
    assert.equal(employee.priority, "mixed");
    assert.equal(allocation(employee, "buffer").amount, 9000);
    assert.equal(allocation(employee, "explore").amount, 6000);
  });

  it("allows a larger exploration share for Persona D", () => {
    const plan = buildStarterPlan(snapshotFromPersona(personas[3]));
    assert.equal(plan.monthlySurplus, 30000);
    assert.equal(plan.illustrativeEmergencyTarget, 90000);
    assert.ok(Math.abs((plan.emergencyCoverageMonths ?? 0) - 100000 / 30000) < 1e-10);
    assert.equal(plan.coverageBand, "three-plus");
    assert.equal(plan.priority, "explore-more");
    assert.equal(allocation(plan, "buffer").amount, 7500);
    assert.equal(allocation(plan, "explore").amount, 22500);
  });

  it("does not show an investable amount when surplus is zero", () => {
    const plan = buildStarterPlan({
      age: 22,
      monthlyIncome: 10000,
      essentialExpenses: 12000,
      liquidSavings: 5000,
      investmentExperience: null,
    });
    assert.equal(plan.monthlySurplus, 0);
    assert.equal(plan.priority, "improve-cashflow");
    assert.equal(plan.investableAmountShown, false);
    assert.deepEqual(plan.allocations, []);
    assert.match(plan.explanation, /not a judgment/i);
  });

  it("treats zero essential expenses as a non-computable buffer", () => {
    const plan = buildStarterPlan({
      age: 24,
      monthlyIncome: 20000,
      essentialExpenses: 0,
      liquidSavings: 0,
      investmentExperience: null,
    });
    assert.equal(plan.monthlySurplus, 20000);
    assert.equal(plan.illustrativeEmergencyTarget, 0);
    assert.equal(plan.emergencyCoverageMonths, null);
    assert.equal(plan.priority, "explore-more");
    assert.equal(allocation(plan, "buffer").amount, 5000);
    assert.equal(allocation(plan, "explore").amount, 15000);
  });

  it("checks cash flow before coverage", () => {
    const plan = buildStarterPlan({
      age: 25,
      monthlyIncome: 0,
      essentialExpenses: 0,
      liquidSavings: 10000,
      investmentExperience: null,
    });
    assert.equal(plan.priority, "improve-cashflow");
  });

  it("keeps the three displayed categories equal to the surplus", () => {
    const goal: Goal = { type: "travel", targetAmount: 20000, horizon: "under-1-year" };
    const low = scoreRisk({
      "temporary-drop": "need-now",
      "need-money": "within-year",
      familiarity: "not-familiar",
      "longer-goal": "keep-savings",
    });
    const high = scoreRisk({
      "temporary-drop": "continue-plan",
      "need-money": "later",
      familiarity: "familiar",
      "longer-goal": "stay-plan",
    });
    assert.ok(low && high);

    for (const persona of personas) {
      const plan = buildStarterPlan(snapshotFromPersona(persona), goal, low);
      const total = plan.categories.reduce((sum, item) => sum + item.amount, 0);
      assert.equal(total, plan.monthlySurplus);
      assert.equal(plan.categories[0].label, "Safety / buffer");
      assert.equal(plan.categories[0].amount, allocation(plan, "buffer").amount);
    }

    const student = snapshotFromPersona(personas[0]);
    const shortLow = buildStarterPlan(student, goal, low);
    const shortHigh = buildStarterPlan(student, { ...goal, horizon: "5-plus-years" }, high);
    const reserve = (plan: ReturnType<typeof buildStarterPlan>) =>
      plan.categories.find((item) => item.id === "goal-reserve")?.amount ?? 0;
    assert.ok(reserve(shortLow) > reserve(shortHigh));
    assert.equal(shortLow.bufferStanding, "weak");
    assert.equal(buildStarterPlan(snapshotFromPersona(personas[1])).bufferStanding, "developing");
    assert.equal(buildStarterPlan(snapshotFromPersona(personas[3])).bufferStanding, "comparatively-healthy");
  });

  it("puts the optional slice into a goal reserve for an emergency-buffer goal", () => {
    const plan = buildStarterPlan(snapshotFromPersona(personas[0]), {
      type: "emergency-buffer",
      targetAmount: 16500,
      horizon: "5-plus-years",
    });
    assert.equal(
      plan.categories.find((item) => item.id === "goal-reserve")?.amount,
      allocation(plan, "explore").amount,
    );
    assert.equal(plan.categories.find((item) => item.id === "exploration")?.amount, 0);
  });

  it("keeps a zero surplus useful without an investable split", () => {
    const plan = buildStarterPlan({
      age: 22,
      monthlyIncome: 0,
      essentialExpenses: 4000,
      liquidSavings: 0,
      investmentExperience: null,
    });
    assert.equal(plan.monthlySurplus, 0);
    assert.equal(plan.categories.length, 3);
    assert.ok(plan.categories.every((item) => item.amount === 0));
    assert.match(plan.explanation, /not a judgment/i);
    assert.match(plan.nextLook, /monthly room/i);
  });

  it("keeps allocation rupees equal to the surplus", () => {
    for (const persona of personas) {
      const plan = buildStarterPlan(snapshotFromPersona(persona));
      const total = plan.allocations.reduce((sum, item) => sum + item.amount, 0);
      assert.equal(total, plan.monthlySurplus);
    }
  });
});
