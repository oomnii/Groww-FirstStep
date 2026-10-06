import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFirewall } from "../src/lib/firewall.ts";
import {
  ABOVE_SURPLUS_MESSAGE,
  allocatedAmount,
  amountExceedsSurplus,
  comfortConflicts,
  completedSavedSimulation,
  firewallInputForSimulation,
  lowerConcentrationScenario,
  MISSING_CONTEXT_MESSAGE,
  parseSimulationAmount,
  scenarioCardsVisible,
  simulationSaveRefusal,
  simulationSliderMax,
  ZERO_AMOUNT_MESSAGE,
  ZERO_SHARE_MESSAGE,
} from "../src/lib/simulationSession.ts";
import { illustrateScenario } from "../src/lib/simulator.ts";

describe("simulation session", () => {
  it("does not turn a blank amount into a suggested number", () => {
    assert.equal(parseSimulationAmount(""), null);
    assert.equal(parseSimulationAmount("   "), null);
    assert.equal(simulationSliderMax(0, null), 0);
  });

  it("keeps a zero surplus from offering a positive slider scale", () => {
    assert.equal(simulationSliderMax(0, null), 0);
    assert.equal(simulationSliderMax(0, 0), 0);
    assert.equal(amountExceedsSurplus(1, 0), true);
    assert.match(ABOVE_SURPLUS_MESSAGE, /above the monthly surplus/i);
  });

  it("lets a typed amount sit above surplus without clamping the scale away", () => {
    assert.equal(simulationSliderMax(2500, null), 2500);
    assert.equal(simulationSliderMax(2500, 5000), 5000);
    assert.equal(amountExceedsSurplus(5000, 2500), true);
    assert.equal(amountExceedsSurplus(2500, 2500), false);
  });

  it("flags only a strong difference from the earlier comfort answer", () => {
    assert.equal(comfortConflicts("continue-plan", "exit"), true);
    assert.equal(comfortConflicts("need-now", "stay"), true);
    assert.equal(comfortConflicts("need-now", "wait"), false);
    assert.equal(comfortConflicts("continue-plan", "stay"), false);
    assert.equal(comfortConflicts(undefined, "exit"), false);
  });

  it("sends each firewall rule through the existing evaluator", () => {
    const concentration = evaluateFirewall(
      firewallInputForSimulation({
        optionId: "stability-bucket",
        percent: 70,
        riskLevel: "moderate",
        horizon: "3-5-years",
        emergencyCoverageMonths: 4,
        essentialExpenses: 20000,
      }),
    );
    assert.ok(concentration.some((signal) => signal.id === "concentration-stability-bucket"));

    const single = evaluateFirewall(
      firewallInputForSimulation({
        optionId: "single-stock-demo",
        percent: 40,
        riskLevel: "moderate",
        horizon: "3-5-years",
        emergencyCoverageMonths: 4,
        essentialExpenses: 20000,
      }),
    );
    assert.ok(single.some((signal) => signal.id === "non-diversified-single-stock-demo"));

    const lowGrowth = evaluateFirewall(
      firewallInputForSimulation({
        optionId: "growth-basket",
        percent: 20,
        riskLevel: "low",
        horizon: "3-5-years",
        emergencyCoverageMonths: 4,
        essentialExpenses: 20000,
      }),
    );
    assert.ok(lowGrowth.some((signal) => signal.id === "risk-mismatch"));

    const short = evaluateFirewall(
      firewallInputForSimulation({
        optionId: "growth-basket",
        percent: 20,
        riskLevel: "moderate",
        horizon: "under-1-year",
        emergencyCoverageMonths: 4,
        essentialExpenses: 20000,
      }),
    );
    assert.ok(short.some((signal) => signal.id === "horizon-mismatch"));

    const thin = evaluateFirewall(
      firewallInputForSimulation({
        optionId: "growth-basket",
        percent: 30,
        riskLevel: "moderate",
        horizon: "3-5-years",
        emergencyCoverageMonths: 0.4,
        essentialExpenses: 20000,
      }),
    );
    assert.ok(thin.some((signal) => signal.id === "buffer-mismatch"));
  });

  it("can raise the same combination the firewall already allows", () => {
    const signals = evaluateFirewall(
      firewallInputForSimulation({
        optionId: "single-stock-demo",
        percent: 100,
        riskLevel: "low",
        horizon: "under-1-year",
        emergencyCoverageMonths: 0.2,
        essentialExpenses: 5500,
      }),
    );
    assert.deepEqual(
      signals.map((signal) => signal.id).sort(),
      [
        "buffer-mismatch",
        "concentration-single-stock-demo",
        "horizon-mismatch",
        "non-diversified-single-stock-demo",
        "risk-mismatch",
      ],
    );
    const comparison = lowerConcentrationScenario(5000, 100, signals);
    assert.ok(comparison);
    assert.equal(comparison.percent, 25);
    assert.deepEqual(comparison.scenario, illustrateScenario(allocatedAmount(5000, 25), -20));
    assert.equal(comparison.scenario.scenarioValue, 1000);
  });

  const validDraft = {
    optionId: "stability-bucket",
    amount: 2000,
    allocationPercent: 40,
    hasGoal: true,
    hasRiskProfile: true,
    comfort: "wait" as const,
    acknowledged: true,
    firewallSignalIds: [] as string[],
    firewallChoice: null,
  };

  it("does not save an amount of ₹0", () => {
    const refusal = simulationSaveRefusal({
      amount: 0,
      allocationPercent: 40,
      hasGoal: true,
      hasRiskProfile: true,
    });
    assert.equal(refusal?.message, ZERO_AMOUNT_MESSAGE);
    assert.equal(refusal?.focusId, "simulation-amount");
    assert.equal(completedSavedSimulation({ ...validDraft, amount: 0 }), null);
    assert.equal(scenarioCardsVisible(0, 40), false);
  });

  it("does not save an allocation of 0%", () => {
    const refusal = simulationSaveRefusal({
      amount: 2000,
      allocationPercent: 0,
      hasGoal: true,
      hasRiskProfile: true,
    });
    assert.equal(refusal?.message, ZERO_SHARE_MESSAGE);
    assert.equal(refusal?.focusId, "allocation-percent");
    assert.equal(completedSavedSimulation({ ...validDraft, allocationPercent: 0 }), null);
    assert.equal(scenarioCardsVisible(2000, 0), false);
    assert.equal(scenarioCardsVisible(null, 40), false);
  });

  it("does not produce a saved decision when the goal is missing", () => {
    const refusal = simulationSaveRefusal({
      amount: 2000,
      allocationPercent: 40,
      hasGoal: false,
      hasRiskProfile: true,
    });
    assert.equal(refusal?.message, MISSING_CONTEXT_MESSAGE);
    assert.equal(refusal?.focusId, "starter-flow-link");
    assert.equal(completedSavedSimulation({ ...validDraft, hasGoal: false }), null);
  });

  it("does not produce a saved decision when the risk profile is missing", () => {
    const refusal = simulationSaveRefusal({
      amount: 2000,
      allocationPercent: 40,
      hasGoal: true,
      hasRiskProfile: false,
    });
    assert.equal(refusal?.focusId, "starter-flow-link");
    assert.equal(completedSavedSimulation({ ...validDraft, hasRiskProfile: false }), null);
  });

  it("still saves a normal simulation", () => {
    assert.equal(simulationSaveRefusal(validDraft), null);
    assert.equal(scenarioCardsVisible(2000, 40), true);
    assert.deepEqual(completedSavedSimulation(validDraft), {
      optionId: "stability-bucket",
      amount: 2000,
      allocationPercent: 40,
      comfort: "wait",
      firewallSignalIds: [],
      firewallChoice: null,
    });
    assert.deepEqual(
      completedSavedSimulation({
        ...validDraft,
        firewallSignalIds: ["concentration-stability-bucket"],
        firewallChoice: "continue",
      }),
      {
        optionId: "stability-bucket",
        amount: 2000,
        allocationPercent: 40,
        comfort: "wait",
        firewallSignalIds: ["concentration-stability-bucket"],
        firewallChoice: "continue",
      },
    );
  });
});
