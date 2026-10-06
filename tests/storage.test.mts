import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { personas } from "../src/data/personas.ts";
import { deriveProgress } from "../src/lib/progress.ts";
import { emptyPrototypeState, sanitizePrototypeState, stateFromPersona } from "../src/lib/storage.ts";

describe("saved prototype state", () => {
  it("rejects an unknown version", () => {
    assert.equal(sanitizePrototypeState({ version: 2 }), null);
    assert.equal(sanitizePrototypeState(null), null);
  });

  it("drops unknown choices and clamps the wizard step", () => {
    const sanitized = sanitizePrototypeState({
      version: 1,
      personaId: "missing",
      snapshot: { age: "22", monthlyIncome: "1", essentialExpenses: "1", liquidSavings: "1" },
      goal: { type: "not-a-goal", targetAmount: "10", horizon: "1-3-years" },
      riskAnswers: { "temporary-drop": "need-now", other: "nope" },
      wizardStep: 9,
      furthestStep: 1,
      simulationReviewed: true,
      firewallChoice: "continue",
      updatedAt: "2026-10-06T00:00:00.000Z",
    });
    assert.ok(sanitized);
    assert.equal(sanitized.personaId, null);
    assert.equal(sanitized.goal.type, null);
    assert.equal(sanitized.goal.horizon, "1-3-years");
    assert.deepEqual(sanitized.riskAnswers, { "temporary-drop": "need-now" });
    assert.equal(sanitized.wizardStep, 3);
    assert.equal(sanitized.furthestStep, 3);
    assert.equal(sanitized.firewallChoice, "continue");
    assert.equal(sanitized.selectedOptionId, null);
    assert.equal(sanitized.confidenceBaseline, null);
  });

  it("keeps a known option and a 1–5 confidence answer", () => {
    const sanitized = sanitizePrototypeState({
      version: 1,
      selectedOptionId: "not-real",
      confidenceBaseline: 9,
    });
    assert.ok(sanitized);
    assert.equal(sanitized.selectedOptionId, null);
    assert.equal(sanitized.confidenceBaseline, null);

    const kept = sanitizePrototypeState({
      version: 1,
      selectedOptionId: "growth-basket",
      confidenceBaseline: 2,
    });
    assert.ok(kept);
    assert.equal(kept.selectedOptionId, "growth-basket");
    assert.equal(kept.confidenceBaseline, 2);
  });

  it("builds a fresh draft from a demo persona", () => {
    const state = stateFromPersona(personas[0]);
    assert.equal(state.personaId, "student");
    assert.equal(state.snapshot.monthlyIncome, "8000");
    assert.equal(state.snapshot.liquidSavings, "3000");
    assert.equal(state.wizardStep, 0);
    assert.equal(state.goal.type, null);
    assert.equal(state.simulationAmount, "");
    assert.equal(state.savedSimulation, null);
  });

  it("keeps a saved illustration and drops an unfinished amount", () => {
    const sanitized = sanitizePrototypeState({
      version: 1,
      simulationAmount: "",
      allocationPercent: 40,
      scenarioComfort: "wait",
      scenarioAcknowledged: true,
      savedSimulation: {
        optionId: "single-stock-demo",
        amount: 5000,
        allocationPercent: 40,
        comfort: "wait",
        firewallSignalIds: ["non-diversified-single-stock-demo"],
        firewallChoice: "continue",
      },
    });
    assert.ok(sanitized);
    assert.equal(sanitized.simulationAmount, "");
    assert.equal(sanitized.allocationPercent, 40);
    assert.equal(sanitized.savedSimulation?.firewallChoice, "continue");
    assert.equal(sanitized.savedSimulation?.amount, 5000);
  });

  it("drops a saved illustration of ₹0 or a 0% share", () => {
    const zeroAmount = sanitizePrototypeState({
      version: 1,
      savedSimulation: {
        optionId: "stability-bucket",
        amount: 0,
        allocationPercent: 40,
        comfort: "wait",
        firewallSignalIds: [],
        firewallChoice: null,
      },
    });
    const zeroShare = sanitizePrototypeState({
      version: 1,
      savedSimulation: {
        optionId: "stability-bucket",
        amount: 2000,
        allocationPercent: 0,
        comfort: "wait",
        firewallSignalIds: [],
        firewallChoice: null,
      },
    });
    assert.equal(zeroAmount?.savedSimulation, null);
    assert.equal(zeroShare?.savedSimulation, null);
  });

  it("marks understand as saved only after a complete review", () => {
    const empty = deriveProgress(emptyPrototypeState());
    assert.equal(empty.reviewComplete, false);
    assert.equal(empty.stage, "understand");

    const complete = deriveProgress({
      ...stateFromPersona(personas[2]),
      goal: { type: "travel", targetAmount: "20000", horizon: "1-3-years" },
      riskAnswers: {
        "temporary-drop": "uncomfortable-wait",
        "need-money": "one-to-three",
        familiarity: "somewhat",
        "longer-goal": "smaller-amount",
      },
      wizardStep: 3,
      furthestStep: 3,
    });
    assert.equal(complete.reviewComplete, true);
    assert.equal(complete.stage, "plan");
    assert.deepEqual(complete.completedStages, ["understand"]);
  });
});
