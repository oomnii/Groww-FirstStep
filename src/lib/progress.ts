import type { JourneyStage, ProgressState, PrototypeState } from "@/types";
import { goalFromDraft, snapshotFromDraft, validateRiskAnswers } from "@/lib/validation";

export function deriveProgress(state: PrototypeState): ProgressState {
  const snapshot = snapshotFromDraft(state.snapshot, null);
  const goal = goalFromDraft(state.goal);
  const riskComplete = Object.keys(validateRiskAnswers(state.riskAnswers)).length === 0;
  const snapshotComplete = snapshot !== null;
  const goalComplete = goal !== null;
  const reviewComplete =
    snapshotComplete && goalComplete && riskComplete && state.furthestStep >= 3;

  const completedStages: JourneyStage[] = [];
  if (reviewComplete) completedStages.push("understand");

  let stage: JourneyStage = "understand";
  if (reviewComplete) stage = "plan";

  return {
    stage,
    wizardStep: state.wizardStep,
    furthestStep: state.furthestStep,
    snapshotComplete,
    goalComplete,
    riskComplete,
    reviewComplete,
    completedStages,
    simulationReviewed: state.simulationReviewed,
    firewallChoice: state.firewallChoice,
    updatedAt: state.updatedAt,
  };
}
