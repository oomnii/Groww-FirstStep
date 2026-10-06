import { goalDefinitions, horizonDefinitions } from "@/data/goals";
import { riskQuestions } from "@/data/riskQuestions";
import { formatRupees, parseWholeNumber } from "@/lib/money";
import type { FinancialSnapshot, Goal, GoalDraft, InvestmentExperience, SnapshotDraft } from "@/types";

export const LIMITS = {
  age: { min: 16, max: 80 },
  monthlyIncome: { min: 0, max: 1_000_000 },
  essentialExpenses: { min: 0, max: 1_000_000 },
  liquidSavings: { min: 0, max: 50_000_000 },
  targetAmount: { min: 1, max: 50_000_000 },
} as const;

export type FieldErrors = Record<string, string>;

function moneyError(raw: string, label: string, max: number, allowZero: boolean): string | null {
  if (raw.trim() === "") {
    return allowZero
      ? `Enter ${label}. Use 0 if there is none.`
      : `Enter ${label} above ₹0.`;
  }
  if (raw.includes("-")) {
    return "Use 0 or a positive amount. Negative values are not used in this prototype.";
  }
  const value = parseWholeNumber(raw);
  if (value === null) {
    return "Use digits only, in whole rupees.";
  }
  if (!allowZero && value < 1) {
    return `Enter ${label} above ₹0.`;
  }
  if (value > max) {
    return `Enter an amount up to ${formatRupees(max)}.`;
  }
  return null;
}

export function validateSnapshotFields(draft: SnapshotDraft): FieldErrors {
  const errors: FieldErrors = {};
  const ageRaw = draft.age.trim();
  if (ageRaw === "") {
    errors.age = "Enter your age.";
  } else if (ageRaw.includes("-") || ageRaw.includes(".")) {
    errors.age = "Use a whole number for age.";
  } else {
    const age = parseWholeNumber(ageRaw);
    if (age === null) {
      errors.age = "Use a whole number for age.";
    } else if (age < LIMITS.age.min || age > LIMITS.age.max) {
      errors.age = `Enter an age from ${LIMITS.age.min} to ${LIMITS.age.max}.`;
    }
  }

  const incomeError = moneyError(
    draft.monthlyIncome,
    "monthly income",
    LIMITS.monthlyIncome.max,
    true,
  );
  if (incomeError) errors.monthlyIncome = incomeError;

  const expenseError = moneyError(
    draft.essentialExpenses,
    "essential monthly expenses",
    LIMITS.essentialExpenses.max,
    true,
  );
  if (expenseError) errors.essentialExpenses = expenseError;

  const savingsError = moneyError(
    draft.liquidSavings,
    "current liquid savings",
    LIMITS.liquidSavings.max,
    true,
  );
  if (savingsError) errors.liquidSavings = savingsError;

  return errors;
}

export function snapshotFromDraft(
  draft: SnapshotDraft,
  investmentExperience: InvestmentExperience | null,
): FinancialSnapshot | null {
  if (Object.keys(validateSnapshotFields(draft)).length > 0) return null;
  return {
    age: parseWholeNumber(draft.age) as number,
    monthlyIncome: parseWholeNumber(draft.monthlyIncome) as number,
    essentialExpenses: parseWholeNumber(draft.essentialExpenses) as number,
    liquidSavings: parseWholeNumber(draft.liquidSavings) as number,
    investmentExperience,
  };
}

export function validateGoalFields(draft: GoalDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.type || !goalDefinitions.some((goal) => goal.type === draft.type)) {
    errors.type = "Choose a goal to continue.";
  }
  const amountError = moneyError(draft.targetAmount, "a target amount", LIMITS.targetAmount.max, false);
  if (amountError) errors.targetAmount = amountError;
  if (!draft.horizon || !horizonDefinitions.some((horizon) => horizon.id === draft.horizon)) {
    errors.horizon = "Choose a time horizon to continue.";
  }
  return errors;
}

export function goalFromDraft(draft: GoalDraft): Goal | null {
  if (Object.keys(validateGoalFields(draft)).length > 0 || !draft.type || !draft.horizon) {
    return null;
  }
  return {
    type: draft.type,
    targetAmount: parseWholeNumber(draft.targetAmount) as number,
    horizon: draft.horizon,
  };
}

export function validateRiskAnswers(answers: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  for (const question of riskQuestions) {
    const selected = answers[question.id];
    const known = question.options.some((option) => option.id === selected);
    if (!known) {
      errors[question.id] = "Choose the answer that feels closest.";
    }
  }
  return errors;
}
