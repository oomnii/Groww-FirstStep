import { getInvestmentOption } from "@/data/investmentOptions";
import { goalTitle, horizonLabel } from "@/data/goals";
import { coverageBand, monthlySurplus } from "@/lib/finance";
import { formatRupees } from "@/lib/money";
import { bufferStandingCopy } from "@/lib/plan";
import { riskLevelLabel, scoreRisk } from "@/lib/risk";
import { goalFromDraft, snapshotFromDraft, validateRiskAnswers } from "@/lib/validation";
import type { PrototypeState } from "@/types";

export const CONFIDENCE_DROP_MESSAGE =
  "Understanding more risk can sometimes reduce confidence. That can still be useful.";

export interface JourneyCheck {
  id: "snapshot" | "goal" | "risk" | "plan" | "scenario" | "pressure";
  label: string;
  done: boolean;
}

export function journeyChecklist(state: PrototypeState): JourneyCheck[] {
  const snapshot = snapshotFromDraft(state.snapshot, null);
  const goal = goalFromDraft(state.goal);
  const riskComplete = Object.keys(validateRiskAnswers(state.riskAnswers)).length === 0;
  const decisionSaved = state.savedSimulation !== null;
  return [
    { id: "snapshot", label: "Financial snapshot", done: snapshot !== null },
    { id: "goal", label: "Goal defined", done: goal !== null },
    { id: "risk", label: "Risk profile understood", done: riskComplete },
    { id: "plan", label: "Starter Plan reviewed", done: snapshot !== null && state.planViewed },
    { id: "scenario", label: "Risk scenario simulated", done: decisionSaved },
    { id: "pressure", label: "Decision pressure-tested", done: decisionSaved },
  ];
}

export function confidenceNote(before: number | null, now: number | null): string | null {
  if (before === null || now === null || now >= before) return null;
  return CONFIDENCE_DROP_MESSAGE;
}

export function firewallSignalSummary(id: string): string {
  if (id.startsWith("concentration-")) return "A large share is in one option";
  if (id.startsWith("non-diversified-")) return "A non-diversified example has a large share";
  if (id === "risk-mismatch") return "Higher-volatility option with a Low comfort level";
  if (id === "horizon-mismatch") return "Higher-volatility option with a short goal horizon";
  if (id === "buffer-mismatch") return "Thin cash buffer with a higher-volatility share";
  return "A pause was recorded";
}

export function summarizeFirewallSignals(ids: string[]): string[] {
  const lines: string[] = [];
  for (const id of ids) {
    const line = firewallSignalSummary(id);
    if (!lines.includes(line)) lines.push(line);
  }
  return lines;
}

export function whatYouLearned(state: PrototypeState): string {
  const snapshot = snapshotFromDraft(state.snapshot, null);
  if (!snapshot) return "Nothing has been saved yet, so there is no journey summary.";
  const surplus = monthlySurplus(snapshot.monthlyIncome, snapshot.essentialExpenses);
  const standing = bufferStandingCopy(coverageBand(snapshot));
  const goal = goalFromDraft(state.goal);
  const profile = scoreRisk(state.riskAnswers);
  const parts = [
    `Monthly surplus from the amounts entered is ${formatRupees(surplus)}.`,
    standing.whyCoverage,
  ];
  if (goal) {
    parts.push(
      `The goal entered is ${goalTitle(goal.type)}, with a time horizon of ${horizonLabel(goal.horizon)}.`,
    );
  }
  if (profile) {
    parts.push(`The comfort answers were grouped as ${riskLevelLabel(profile.level)}.`);
  }
  const saved = state.savedSimulation;
  if (saved && saved.firewallSignalIds.length === 0) {
    parts.push("No major mismatch was recorded for the saved illustration.");
  } else if (saved) {
    parts.push(
      `${saved.firewallSignalIds.length} pause${saved.firewallSignalIds.length === 1 ? "" : "s"} ${saved.firewallSignalIds.length === 1 ? "was" : "were"} recorded for the saved illustration.`,
    );
  }
  return parts.join(" ");
}

export function whyLearningMattered(
  topic: "diversification" | "horizon" | "buffer",
  state: PrototypeState,
): string {
  const snapshot = snapshotFromDraft(state.snapshot, null);
  const goal = goalFromDraft(state.goal);
  const saved = state.savedSimulation;
  const option = saved ? getInvestmentOption(saved.optionId) : undefined;

  if (topic === "diversification") {
    if (!option) return "No illustrated option is saved, so this was not applied to a choice yet.";
    if (option.diversified) {
      return `${option.name} is a diversified example in this prototype.`;
    }
    return `${option.name} is not diversified, so a large share can raise a pause.`;
  }

  if (topic === "horizon") {
    if (!goal) return "No time horizon is saved, so this was not applied to a choice yet.";
    if (goal.horizon === "under-1-year") {
      return "The horizon is under 1 year, so a higher-volatility option can raise a pause.";
    }
    return `The horizon entered is ${horizonLabel(goal.horizon)}.`;
  }

  if (!snapshot) return "No amounts are saved, so months of coverage were not calculated.";
  const standing = bufferStandingCopy(coverageBand(snapshot));
  return `Under this prototype’s assumption, the buffer is ${standing.standingLabel.toLowerCase()}.`;
}
