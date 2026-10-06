import type { RiskScenario } from "@/types";

export const SCENARIO_CHANGES = [-10, -20, -30] as const;

export const SCENARIO_NOTE =
  "Mathematical illustration only. This is not a forecast of what an investment will do.";

export function illustrateScenario(startingAmount: number, changePercent: number): RiskScenario {
  if (!Number.isFinite(startingAmount) || startingAmount < 0) {
    throw new Error("Starting amount must be a finite number of zero or more.");
  }
  if (!Number.isFinite(changePercent)) {
    throw new Error("Change percent must be a finite number.");
  }
  const scenarioValue = Math.round(startingAmount * (1 + changePercent / 100));
  return {
    id: `scenario-${changePercent}`,
    label: `${changePercent}%`,
    changePercent,
    startingAmount,
    scenarioValue,
    rupeeChange: scenarioValue - startingAmount,
    isForecast: false,
    note: SCENARIO_NOTE,
  };
}

export function illustrateDownsideScenarios(startingAmount: number): RiskScenario[] {
  return SCENARIO_CHANGES.map((change) => illustrateScenario(startingAmount, change));
}
