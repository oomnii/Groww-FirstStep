import { getInvestmentOption, investmentOptions } from "@/data/investmentOptions";
import type {
  AllocationChoice,
  FirewallSignal,
  InvestmentOption,
  RiskLevel,
  TimeHorizon,
} from "@/types";

export const FIREWALL_THRESHOLDS = {
  singleOptionCautionPercent: 60,
  singleOptionStrongPercent: 80,
  nonDiversifiedCautionPercent: 35,
  nonDiversifiedStrongPercent: 60,
  thinBufferHighRiskPercent: 25,
} as const;

export interface FirewallInput {
  allocations: AllocationChoice[];
  riskLevel: RiskLevel;
  horizon: TimeHorizon;
  emergencyCoverageMonths: number | null;
  essentialExpenses: number;
}

function activeAllocations(allocations: AllocationChoice[]): AllocationChoice[] {
  return allocations.filter(
    (allocation) => Number.isFinite(allocation.percent) && allocation.percent > 0,
  );
}

export function evaluateFirewall(
  input: FirewallInput,
  options: InvestmentOption[] = investmentOptions,
): FirewallSignal[] {
  const signals: FirewallSignal[] = [];
  const chosen = activeAllocations(input.allocations);
  const optionById = new Map(options.map((option) => [option.id, option]));

  for (const allocation of chosen) {
    const option = optionById.get(allocation.optionId) ?? getInvestmentOption(allocation.optionId);
    const name = option?.name ?? "One option";

    if (allocation.percent > FIREWALL_THRESHOLDS.singleOptionCautionPercent) {
      const severity =
        allocation.percent > FIREWALL_THRESHOLDS.singleOptionStrongPercent ? "strong" : "caution";
      signals.push({
        id: `concentration-${allocation.optionId}`,
        severity,
        title: "A large share is in one option",
        reason: `${name} is set above 60% of the chosen investment amount in this illustration.`,
        explanation:
          "Putting most of the amount into a single educational option means this scenario depends heavily on that one example.",
        possibleAdjustment:
          "You could explore spreading the amount so no single educational option is above 60%.",
      });
    }

    if (option && !option.diversified && allocation.percent > FIREWALL_THRESHOLDS.nonDiversifiedCautionPercent) {
      const severity =
        allocation.percent > FIREWALL_THRESHOLDS.nonDiversifiedStrongPercent ? "strong" : "caution";
      signals.push({
        id: `non-diversified-${allocation.optionId}`,
        severity,
        title: "A non-diversified example has a large share",
        reason: `${name} is a non-diversified educational option set above 35% of the chosen investment amount.`,
        explanation: `${name} stands in for a holding that is not spread out. A larger share means this illustration moves with that one fictional example.`,
        possibleAdjustment:
          "You could lower that share to 35% or below, or explore a diversified educational basket instead.",
      });
    }
  }

  const highRiskSelected = chosen.some((allocation) => {
    const option = optionById.get(allocation.optionId);
    return option?.risk === "high";
  });

  if (input.riskLevel === "low" && highRiskSelected) {
    signals.push({
      id: "risk-mismatch",
      severity: "strong",
      title: "Higher-volatility option with a Low comfort level",
      reason: "The comfort level from your answers is Low, and a High risk educational option is included.",
      explanation:
        "Your answers suggested less comfort with large ups and downs, while this option is the prototype’s higher-volatility example.",
      possibleAdjustment:
        "You could explore a Low or Moderate educational option, or revisit your answers if they do not feel right.",
    });
  }

  if (input.horizon === "under-1-year" && highRiskSelected) {
    signals.push({
      id: "horizon-mismatch",
      severity: "strong",
      title: "Higher-volatility option with a short goal horizon",
      reason: "The goal horizon is under 1 year, and a High risk educational option is included.",
      explanation:
        "A short horizon means there is less time in this illustration to wait through a large drop before the money is needed.",
      possibleAdjustment:
        "You could explore a lower-volatility educational option, or check whether the time horizon you entered still fits.",
    });
  }

  const highRiskShare = chosen.reduce((total, allocation) => {
    const option = optionById.get(allocation.optionId);
    return option?.risk === "high" ? total + allocation.percent : total;
  }, 0);

  const coverageIsThin =
    input.essentialExpenses > 0 &&
    input.emergencyCoverageMonths !== null &&
    input.emergencyCoverageMonths < 1;

  if (coverageIsThin && highRiskShare > FIREWALL_THRESHOLDS.thinBufferHighRiskPercent) {
    signals.push({
      id: "buffer-mismatch",
      severity: "strong",
      title: "Thin cash buffer with a higher-volatility share",
      reason:
        "Emergency coverage is under 1 month, and more than 25% of the chosen investment amount is in High risk educational options.",
      explanation:
        "With less than a month of essential expenses in liquid savings, a large share in higher-volatility examples can make the illustration harder to hold if money is needed soon.",
      possibleAdjustment:
        "You could direct more of this illustration toward the buffer, or keep the higher-volatility share at 25% or below.",
    });
  }

  return signals;
}
