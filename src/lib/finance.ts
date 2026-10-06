import type { CoverageBand, FinancialSnapshot } from "@/types";

export function monthlySurplus(monthlyIncome: number, essentialExpenses: number): number {
  if (!Number.isFinite(monthlyIncome) || !Number.isFinite(essentialExpenses)) {
    throw new Error("Income and expenses must be finite numbers.");
  }
  return Math.max(monthlyIncome - essentialExpenses, 0);
}

export function illustrativeEmergencyTarget(essentialExpenses: number): number {
  if (!Number.isFinite(essentialExpenses)) {
    throw new Error("Essential expenses must be a finite number.");
  }
  return Math.max(essentialExpenses, 0) * 3;
}

export function emergencyCoverageMonths(
  liquidSavings: number,
  essentialExpenses: number,
): number | null {
  if (!Number.isFinite(liquidSavings) || !Number.isFinite(essentialExpenses)) {
    throw new Error("Savings and expenses must be finite numbers.");
  }
  if (essentialExpenses <= 0) return null;
  return Math.max(liquidSavings, 0) / essentialExpenses;
}

export function coverageBand(snapshot: Pick<FinancialSnapshot, "liquidSavings" | "essentialExpenses">): CoverageBand {
  const months = emergencyCoverageMonths(snapshot.liquidSavings, snapshot.essentialExpenses);
  if (months === null) return "not-computable";
  if (months < 1) return "under-1";
  if (months < 3) return "one-to-three";
  return "three-plus";
}

export function snapshotMetrics(snapshot: FinancialSnapshot) {
  return {
    monthlySurplus: monthlySurplus(snapshot.monthlyIncome, snapshot.essentialExpenses),
    illustrativeEmergencyTarget: illustrativeEmergencyTarget(snapshot.essentialExpenses),
    emergencyCoverageMonths: emergencyCoverageMonths(
      snapshot.liquidSavings,
      snapshot.essentialExpenses,
    ),
    coverageBand: coverageBand(snapshot),
  };
}
