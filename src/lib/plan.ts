import type {
  BufferStanding,
  CoverageBand,
  FinancialSnapshot,
  Goal,
  PlanAllocation,
  PlanCategory,
  PlanPriority,
  RiskProfile,
  StarterPlan,
  TimeHorizon,
} from "@/types";
import { goalTitle, horizonLabel } from "@/data/goals";
import { coverageBand, emergencyCoverageMonths, illustrativeEmergencyTarget, monthlySurplus } from "@/lib/finance";
import { formatRupees } from "@/lib/money";
import { riskLevelLabel } from "@/lib/risk";

export const PLAN_SHARES = {
  bufferFirst: 0.9,
  mixed: 0.6,
  exploreMore: 0.25,
} as const;

export const PLAN_DISCLAIMER =
  "This is an educational illustration based on the amounts entered. It is not a forecast, not investment advice, and not a recommendation to buy or sell anything.";

/** Share of the optional slice shown as a goal reserve before comfort is applied. */
export const EXPLORE_GOAL_RESERVE_SHARE: Record<TimeHorizon, number> = {
  "under-1-year": 0.8,
  "1-3-years": 0.5,
  "3-5-years": 0.3,
  "5-plus-years": 0.15,
};

/** Added to the goal-reserve share of the optional slice. Negative moves rupees toward exploration. */
export const RISK_EXPLORE_SHIFT = {
  low: 0.2,
  moderate: 0,
  high: -0.1,
} as const;

export function bufferStandingCopy(band: CoverageBand): {
  bufferStanding: BufferStanding;
  standingLabel: string;
  whyCoverage: string;
} {
  if (band === "under-1") {
    return {
      bufferStanding: "weak",
      standingLabel: "Weak",
      whyCoverage:
        "Under this prototype’s three-month assumption, savings cover less than one month of essential expenses. That is why most of a monthly surplus is shown with the buffer.",
    };
  }
  if (band === "one-to-three") {
    return {
      bufferStanding: "developing",
      standingLabel: "Developing",
      whyCoverage:
        "Savings cover at least one month of essential expenses, and less than the illustrative three-month buffer. That is why the surplus is shown as a mix.",
    };
  }
  if (band === "three-plus") {
    return {
      bufferStanding: "comparatively-healthy",
      standingLabel: "Comparatively healthy",
      whyCoverage:
        "Savings cover at least the illustrative three-month buffer used here. Inside this prototype that is the comparatively healthy band. It is not a statement that the buffer is enough for every person.",
    };
  }
  return {
    bufferStanding: "not-calculated",
    standingLabel: "Not calculated",
    whyCoverage:
      "Essential expenses are ₹0, so this prototype does not turn savings into months of coverage. The three-month rupee target is also ₹0.",
  };
}

export function exploreGoalReserveShare(goal?: Goal | null, risk?: RiskProfile | null): number {
  if (!goal) return 0;
  if (goal.type === "emergency-buffer") return 1;
  const shift = risk ? RISK_EXPLORE_SHIFT[risk.level] : 0;
  return Math.min(1, Math.max(0, EXPLORE_GOAL_RESERVE_SHARE[goal.horizon] + shift));
}

export function splitSurplus(total: number, bufferShare: number): { buffer: number; explore: number } {
  if (total <= 0) return { buffer: 0, explore: 0 };
  const buffer = Math.min(total, Math.max(0, Math.round(total * bufferShare)));
  return { buffer, explore: total - buffer };
}

function allocationsFor(
  surplus: number,
  bufferShare: number,
  bufferNote: string,
  exploreNote: string,
): PlanAllocation[] {
  const split = splitSurplus(surplus, bufferShare);
  return [
    {
      id: "buffer",
      label: "Toward the illustrative cash buffer",
      amount: split.buffer,
      shareOfSurplus: surplus === 0 ? 0 : split.buffer / surplus,
      note: bufferNote,
    },
    {
      id: "explore",
      label: "Optional goal exploration",
      amount: split.explore,
      shareOfSurplus: surplus === 0 ? 0 : split.explore / surplus,
      note: exploreNote,
    },
  ];
}

function goalNote(goal?: Goal | null): string | null {
  if (!goal) return null;
  return `The goal entered in this prototype is ${goalTitle(goal.type)} (${horizonLabel(goal.horizon)}, target ${formatRupees(goal.targetAmount)}).`;
}

function whyHorizon(goal?: Goal | null): string {
  if (!goal) {
    return "No goal is saved yet, so this illustration does not set aside a goal reserve. A goal and a time horizon would change how the optional slice is shown.";
  }
  if (goal.type === "emergency-buffer") {
    return "The goal entered is an emergency buffer, so the optional slice is shown as a goal reserve rather than investment exploration.";
  }
  if (goal.horizon === "under-1-year") {
    return "The time horizon is under 1 year, so most of the optional slice is shown as a goal reserve. Money marked for a near date is not shown as the main exploration amount.";
  }
  if (goal.horizon === "1-3-years") {
    return "The time horizon is 1–3 years, so the optional slice is split evenly between a goal reserve and investment exploration before comfort is applied.";
  }
  if (goal.horizon === "3-5-years") {
    return "The time horizon is 3–5 years, so a larger part of the optional slice is shown as investment exploration.";
  }
  return "The time horizon is 5+ years, so most of the optional slice is shown as investment exploration.";
}

function whyRisk(goal?: Goal | null, risk?: RiskProfile | null): string {
  if (!risk) {
    return "Comfort answers are not saved yet, so they do not change this split.";
  }
  if (goal?.type === "emergency-buffer") {
    return "Comfort answers are saved. They do not move this split, because the goal entered is the emergency buffer itself.";
  }
  const level = riskLevelLabel(risk.level);
  if (risk.level === "low") {
    return `Your answers were grouped as ${level} comfort with ups and downs, so more of the optional slice is shown as a goal reserve.`;
  }
  if (risk.level === "high") {
    return `Your answers were grouped as ${level} comfort with ups and downs, so a little more of the optional slice is shown as investment exploration.`;
  }
  return `Your answers were grouped as ${level} comfort. That does not move the horizon split in this prototype.`;
}

function nextLook(priority: PlanPriority): string {
  if (priority === "improve-cashflow") {
    return "What to look at next is monthly room. The educational options below are for learning, not an amount to put in this month.";
  }
  if (priority === "buffer-first") {
    return "What to look at next is the cash buffer. The educational options below show different kinds of risk. None of them is a default.";
  }
  if (priority === "mixed") {
    return "What to look at next is the mix of buffer and goal room. The educational options below are ways to compare that mix.";
  }
  return "What to look at next is the larger exploration share. The educational options below are still fictional categories.";
}

function categoriesFor(
  surplus: number,
  bufferAmount: number,
  exploreAmount: number,
  bufferNote: string,
  goal?: Goal | null,
  risk?: RiskProfile | null,
): PlanCategory[] {
  const reserveShare = exploreGoalReserveShare(goal, risk);
  const goalReserve =
    exploreAmount === 0 ? 0 : Math.min(exploreAmount, Math.round(exploreAmount * reserveShare));
  const exploration = exploreAmount - goalReserve;
  const portion = (amount: number) => (surplus === 0 ? 0 : amount / surplus);
  return [
    {
      id: "buffer",
      label: "Safety / buffer",
      amount: bufferAmount,
      shareOfSurplus: portion(bufferAmount),
      note: bufferNote,
    },
    {
      id: "goal-reserve",
      label: "Goal reserve",
      amount: goalReserve,
      shareOfSurplus: portion(goalReserve),
      note: goal
        ? "Shown aside for the goal and time horizon entered here. It is not a separate account."
        : "No goal is saved yet, so this line stays at ₹0.",
    },
    {
      id: "exploration",
      label: "Investment exploration",
      amount: exploration,
      shareOfSurplus: portion(exploration),
      note: "Shown as room to look at a fictional option. It is not an instruction to invest that amount.",
    },
  ];
}

export function buildStarterPlan(
  snapshot: FinancialSnapshot,
  goal?: Goal | null,
  risk?: RiskProfile | null,
): StarterPlan {
  const surplus = monthlySurplus(snapshot.monthlyIncome, snapshot.essentialExpenses);
  const target = illustrativeEmergencyTarget(snapshot.essentialExpenses);
  const coverage = emergencyCoverageMonths(snapshot.liquidSavings, snapshot.essentialExpenses);
  const band = coverageBand(snapshot);
  const notes = [
    "Three months of essential expenses is an illustrative assumption in this prototype, not a universal rule.",
  ];
  const extra = goalNote(goal);
  if (extra) notes.push(extra);

  if (surplus <= 0) {
    notes.push("No monthly amount is shown as available to invest, because the surplus is ₹0.");
    return {
      monthlySurplus: surplus,
      illustrativeEmergencyTarget: target,
      emergencyCoverageMonths: coverage,
      coverageBand: band,
      priority: "improve-cashflow",
      investableAmountShown: false,
      headline: "An illustrative way to think about this month starts with cash flow.",
      explanation:
        "Monthly income does not leave anything after essential expenses in the amounts entered, so this prototype does not show an amount available to invest. The illustration focuses on creating a little monthly room first. That is a starting point, not a judgment.",
      allocations: [],
      categories: categoriesFor(
        surplus,
        0,
        0,
        "Nothing is shown toward a buffer this month, because the surplus is ₹0.",
        goal,
        risk,
      ),
      ...bufferStandingCopy(band),
      whyHorizon: whyHorizon(goal),
      whyRisk: whyRisk(goal, risk),
      nextLook: nextLook("improve-cashflow"),
      notes,
      disclaimer: PLAN_DISCLAIMER,
    };
  }

  let priority: PlanPriority;
  let bufferShare: number;
  let headline: string;
  let explanation: string;
  let bufferNote: string;
  let exploreNote: string;

  if (band === "under-1") {
    priority = "buffer-first";
    bufferShare = PLAN_SHARES.bufferFirst;
    headline = "An illustrative way to think about your monthly surplus is buffer first.";
    explanation =
      "Liquid savings cover less than one month of essential expenses. In this prototype, most of the monthly surplus is shown toward a cash buffer, and a small share is optional exploration. Resilience may matter before taking on a larger amount of market risk.";
    bufferNote = "Shown toward savings you could use if costs come up.";
    exploreNote = "Optional in this illustration. It is not an amount you are expected to invest.";
  } else if (band === "one-to-three") {
    priority = "mixed";
    bufferShare = PLAN_SHARES.mixed;
    headline = "An illustrative way to think about your monthly surplus is a mix.";
    explanation =
      "Liquid savings cover at least one month of essential expenses, and less than the illustrative three-month buffer. This prototype splits the monthly surplus between adding to that buffer and exploring the goal you have in mind.";
    bufferNote = "Shown toward the illustrative buffer.";
    exploreNote = "Shown as room to explore a goal. It is not a forecast of results.";
  } else if (snapshot.essentialExpenses <= 0) {
    priority = "explore-more";
    bufferShare = PLAN_SHARES.exploreMore;
    headline = "An illustrative way to think about your monthly surplus leaves more room to explore.";
    explanation =
      "Essential expenses are ₹0, so this prototype’s three-month illustration is also ₹0 and months of coverage are not calculated. A larger share of the monthly surplus is shown for goal exploration. This is an illustration, not advice to invest that amount.";
    bufferNote = "Kept flexible, because a rupee buffer target is not calculated when essential expenses are ₹0.";
    exploreNote = "A larger illustrative share for the goal you entered.";
  } else {
    priority = "explore-more";
    bufferShare = PLAN_SHARES.exploreMore;
    headline = "An illustrative way to think about your monthly surplus leaves more room to explore.";
    explanation =
      "Liquid savings cover at least the illustrative three-month buffer used in this prototype. A larger share of the monthly surplus is shown for goal exploration, with a smaller share kept flexible. This is not a statement that three months is the right buffer for everyone.";
    bufferNote = "Kept flexible even though the illustrative buffer is already covered.";
    exploreNote = "A larger illustrative share for the goal you entered.";
  }

  const allocations = allocationsFor(surplus, bufferShare, bufferNote, exploreNote);
  const bufferAmount = allocations.find((item) => item.id === "buffer")?.amount ?? 0;
  const exploreAmount = allocations.find((item) => item.id === "explore")?.amount ?? 0;

  return {
    monthlySurplus: surplus,
    illustrativeEmergencyTarget: target,
    emergencyCoverageMonths: coverage,
    coverageBand: band,
    priority,
    investableAmountShown: true,
    headline,
    explanation,
    allocations,
    categories: categoriesFor(surplus, bufferAmount, exploreAmount, bufferNote, goal, risk),
    ...bufferStandingCopy(band),
    whyHorizon: whyHorizon(goal),
    whyRisk: whyRisk(goal, risk),
    nextLook: nextLook(priority),
    notes,
    disclaimer: PLAN_DISCLAIMER,
  };
}
