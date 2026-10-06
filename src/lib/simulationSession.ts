import type { FirewallInput } from "@/lib/firewall";
import { parseWholeNumber } from "@/lib/money";
import { illustrateScenario } from "@/lib/simulator";
import { LIMITS } from "@/lib/validation";
import type {
  FirewallChoice,
  FirewallSignal,
  RiskLevel,
  RiskScenario,
  SavedSimulation,
  ScenarioComfort,
  TimeHorizon,
} from "@/types";

export const SIMULATION_AMOUNT_MAX = LIMITS.monthlyIncome.max;

export const ABOVE_SURPLUS_MESSAGE =
  "This is above the monthly surplus calculated from the information you entered.";

export const COMFORT_CONFLICT_MESSAGE =
  "Your response here differs from your earlier risk comfort.";

export const FIREWALL_CLEAR_MESSAGE =
  "No major mismatch detected from the information entered.";

export const SIMULATION_DISCLAIMER =
  "Illustrative mathematical scenario — not a market forecast.";

export const ZERO_AMOUNT_MESSAGE = "Enter an amount above ₹0.";

export const ZERO_SHARE_MESSAGE = "Set a share above 0%.";

export const MISSING_CONTEXT_MESSAGE =
  "Complete the Starter flow so the FOMO Firewall can evaluate this decision properly.";

export function scenarioCardsVisible(amount: number | null, allocationPercent: number | null): boolean {
  return amount !== null && amount > 0 && allocationPercent !== null && allocationPercent > 0;
}

/** Blocks a completed save. Blank amounts and amounts above surplus are handled separately. */
export function simulationSaveRefusal(input: {
  amount: number | null;
  allocationPercent: number | null;
  hasGoal: boolean;
  hasRiskProfile: boolean;
}): { message: string; focusId: string } | null {
  if (input.amount === 0) {
    return { message: ZERO_AMOUNT_MESSAGE, focusId: "simulation-amount" };
  }
  if (input.allocationPercent === 0) {
    return { message: ZERO_SHARE_MESSAGE, focusId: "allocation-percent" };
  }
  if (!input.hasGoal || !input.hasRiskProfile) {
    return { message: MISSING_CONTEXT_MESSAGE, focusId: "starter-flow-link" };
  }
  return null;
}

export function completedSavedSimulation(input: {
  optionId: string | null;
  amount: number | null;
  allocationPercent: number | null;
  hasGoal: boolean;
  hasRiskProfile: boolean;
  comfort: ScenarioComfort | null;
  acknowledged: boolean;
  firewallSignalIds: string[];
  firewallChoice: FirewallChoice | null;
}): SavedSimulation | null {
  if (simulationSaveRefusal(input)) return null;
  if (!input.optionId || input.amount === null || input.allocationPercent === null) return null;
  if (!input.comfort || !input.acknowledged) return null;
  if (input.firewallSignalIds.length > 0 && input.firewallChoice !== "continue") return null;
  return {
    optionId: input.optionId,
    amount: input.amount,
    allocationPercent: input.allocationPercent,
    comfort: input.comfort,
    firewallSignalIds: input.firewallSignalIds,
    firewallChoice: input.firewallSignalIds.length > 0 ? input.firewallChoice : null,
  };
}

const EARLIER_COMFORT: Record<string, ScenarioComfort> = {
  "need-now": "exit",
  "uncomfortable-wait": "wait",
  "continue-plan": "stay",
};

const COMFORT_RANK: Record<ScenarioComfort, number> = {
  exit: 0,
  wait: 1,
  stay: 2,
};

export function parseSimulationAmount(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = parseWholeNumber(raw);
  if (value === null || value > SIMULATION_AMOUNT_MAX) return null;
  return value;
}

export function amountExceedsSurplus(amount: number, monthlySurplus: number): boolean {
  return amount > monthlySurplus;
}

/** Slider scale. A zero surplus does not create a positive range until an amount is typed. */
export function simulationSliderMax(monthlySurplus: number, entered: number | null): number {
  if (monthlySurplus <= 0) return entered ?? 0;
  if (entered !== null && entered > monthlySurplus) return entered;
  return monthlySurplus;
}

export function allocatedAmount(amount: number, percent: number): number {
  if (amount <= 0 || percent <= 0) return 0;
  return Math.round((amount * percent) / 100);
}

export function comfortConflicts(
  earlierTemporaryDropAnswer: string | undefined,
  current: ScenarioComfort,
): boolean {
  const earlier = earlierTemporaryDropAnswer ? EARLIER_COMFORT[earlierTemporaryDropAnswer] : undefined;
  if (!earlier) return false;
  return Math.abs(COMFORT_RANK[earlier] - COMFORT_RANK[current]) >= 2;
}

export function firewallInputForSimulation(input: {
  optionId: string;
  percent: number;
  riskLevel: RiskLevel;
  horizon: TimeHorizon;
  emergencyCoverageMonths: number | null;
  essentialExpenses: number;
}): FirewallInput {
  return {
    allocations: [{ optionId: input.optionId, percent: input.percent }],
    riskLevel: input.riskLevel,
    horizon: input.horizon,
    emergencyCoverageMonths: input.emergencyCoverageMonths,
    essentialExpenses: input.essentialExpenses,
  };
}

export function lowerConcentrationPercent(percent: number, signals: FirewallSignal[]): number | null {
  const caps: number[] = [];
  if (signals.some((signal) => signal.id.startsWith("non-diversified"))) caps.push(35);
  if (signals.some((signal) => signal.id.startsWith("concentration"))) caps.push(60);
  if (signals.some((signal) => signal.id === "buffer-mismatch")) caps.push(25);
  if (signals.some((signal) => signal.id === "risk-mismatch" || signal.id === "horizon-mismatch")) {
    caps.push(25);
  }
  const below = caps.filter((cap) => cap < percent);
  if (below.length === 0) return null;
  return Math.min(...below);
}

export function lowerConcentrationScenario(
  amount: number,
  percent: number,
  signals: FirewallSignal[],
): { percent: number; scenario: RiskScenario } | null {
  const lower = lowerConcentrationPercent(percent, signals);
  if (lower === null) return null;
  return {
    percent: lower,
    scenario: illustrateScenario(allocatedAmount(amount, lower), -20),
  };
}
