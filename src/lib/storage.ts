import { getPersona } from "@/data/personas";
import { goalDefinitions, horizonDefinitions } from "@/data/goals";
import { getInvestmentOption } from "@/data/investmentOptions";
import { riskQuestions } from "@/data/riskQuestions";
import { clearPrototypeEvents } from "@/lib/events";
import { SIMULATION_AMOUNT_MAX } from "@/lib/simulationSession";
import { parseWholeNumber } from "@/lib/money";
import type {
  FirewallChoice,
  GoalDraft,
  GoalType,
  PrototypeState,
  SavedSimulation,
  ScenarioComfort,
  SnapshotDraft,
  TimeHorizon,
  UserPersona,
} from "@/types";

export const STORAGE_KEY = "groww-starter-prototype-v1";

export function emptyPrototypeState(): PrototypeState {
  return {
    version: 1,
    personaId: null,
    snapshot: {
      age: "",
      monthlyIncome: "",
      essentialExpenses: "",
      liquidSavings: "",
    },
    goal: {
      type: null,
      targetAmount: "",
      horizon: null,
    },
    riskAnswers: {},
    wizardStep: 0,
    furthestStep: 0,
    simulationReviewed: false,
    firewallChoice: null,
    selectedOptionId: null,
    confidenceBaseline: null,
    simulationAmount: "",
    allocationPercent: null,
    scenarioComfort: null,
    scenarioAcknowledged: false,
    savedSimulation: null,
    planViewed: false,
    confidenceNow: null,
    updatedAt: null,
  };
}

export function stateFromPersona(persona: UserPersona): PrototypeState {
  return {
    ...emptyPrototypeState(),
    personaId: persona.id,
    snapshot: {
      age: String(persona.age),
      monthlyIncome: String(persona.monthlyIncome),
      essentialExpenses: String(persona.essentialExpenses),
      liquidSavings: String(persona.liquidSavings),
    },
    updatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function draftString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function clampStep(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) return 0;
  return Math.min(3, Math.max(0, value));
}

function sanitizeSnapshot(value: unknown): SnapshotDraft {
  const empty = emptyPrototypeState().snapshot;
  if (!isRecord(value)) return empty;
  return {
    age: draftString(value.age),
    monthlyIncome: draftString(value.monthlyIncome),
    essentialExpenses: draftString(value.essentialExpenses),
    liquidSavings: draftString(value.liquidSavings),
  };
}

function sanitizeGoal(value: unknown): GoalDraft {
  const empty = emptyPrototypeState().goal;
  if (!isRecord(value)) return empty;
  const type = goalDefinitions.some((goal) => goal.type === value.type)
    ? (value.type as GoalType)
    : null;
  const horizon = horizonDefinitions.some((item) => item.id === value.horizon)
    ? (value.horizon as TimeHorizon)
    : null;
  return {
    type,
    targetAmount: draftString(value.targetAmount),
    horizon,
  };
}

function sanitizeAnswers(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const answers: Record<string, string> = {};
  for (const question of riskQuestions) {
    const selected = value[question.id];
    if (typeof selected !== "string") continue;
    if (question.options.some((option) => option.id === selected)) {
      answers[question.id] = selected;
    }
  }
  return answers;
}

function sanitizeChoice(value: unknown): FirewallChoice | null {
  if (value === "adjust" || value === "continue") return value;
  return null;
}

function sanitizeOptionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return getInvestmentOption(value) ? value : null;
}

function sanitizeConfidence(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > 5) return null;
  return value;
}

function sanitizeComfort(value: unknown): ScenarioComfort | null {
  if (value === "exit" || value === "wait" || value === "stay") return value;
  return null;
}

function sanitizePercent(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 0 || value > 100) return null;
  return value;
}

function sanitizeAmountDraft(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") return "";
  const parsed = parseWholeNumber(value);
  if (parsed === null || parsed > SIMULATION_AMOUNT_MAX) return "";
  return String(parsed);
}

function sanitizeSavedSimulation(value: unknown): SavedSimulation | null {
  if (!isRecord(value)) return null;
  const optionId = sanitizeOptionId(value.optionId);
  const comfort = sanitizeComfort(value.comfort);
  const allocationPercent = sanitizePercent(value.allocationPercent);
  const amount =
    typeof value.amount === "number" &&
    Number.isInteger(value.amount) &&
    value.amount >= 1 &&
    value.amount <= SIMULATION_AMOUNT_MAX
      ? value.amount
      : null;
  if (!optionId || !comfort || allocationPercent === null || allocationPercent < 1 || amount === null) {
    return null;
  }
  const firewallSignalIds = Array.isArray(value.firewallSignalIds)
    ? value.firewallSignalIds.filter((id): id is string => typeof id === "string").slice(0, 20)
    : [];
  return {
    optionId,
    amount,
    allocationPercent,
    comfort,
    firewallSignalIds,
    firewallChoice: sanitizeChoice(value.firewallChoice),
  };
}

export function sanitizePrototypeState(value: unknown): PrototypeState | null {
  if (!isRecord(value) || value.version !== 1) return null;
  const personaId = typeof value.personaId === "string" && getPersona(value.personaId)
    ? value.personaId
    : value.personaId === null
      ? null
      : null;
  const wizardStep = clampStep(value.wizardStep);
  const furthestStep = Math.max(wizardStep, clampStep(value.furthestStep));
  return {
    version: 1,
    personaId,
    snapshot: sanitizeSnapshot(value.snapshot),
    goal: sanitizeGoal(value.goal),
    riskAnswers: sanitizeAnswers(value.riskAnswers),
    wizardStep,
    furthestStep,
    simulationReviewed: value.simulationReviewed === true,
    firewallChoice: sanitizeChoice(value.firewallChoice),
    selectedOptionId: sanitizeOptionId(value.selectedOptionId),
    confidenceBaseline: sanitizeConfidence(value.confidenceBaseline),
    simulationAmount: sanitizeAmountDraft(value.simulationAmount),
    allocationPercent: sanitizePercent(value.allocationPercent),
    scenarioComfort: sanitizeComfort(value.scenarioComfort),
    scenarioAcknowledged: value.scenarioAcknowledged === true,
    savedSimulation: sanitizeSavedSimulation(value.savedSimulation),
    planViewed: value.planViewed === true,
    confidenceNow: sanitizeConfidence(value.confidenceNow),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function loadPrototypeState(): PrototypeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizePrototypeState(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function savePrototypeState(state: PrototypeState): void {
  if (typeof window === "undefined") return;
  const next: PrototypeState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  clientStoreSnapshot = { loaded: true, state: next };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearPrototypeState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export interface PrototypeStoreSnapshot {
  loaded: boolean;
  state: PrototypeState;
}

const serverStoreSnapshot: PrototypeStoreSnapshot = {
  loaded: false,
  state: emptyPrototypeState(),
};

let clientStoreSnapshot: PrototypeStoreSnapshot = {
  loaded: true,
  state: serverStoreSnapshot.state,
};
let hasReadStorage = false;
const storeListeners = new Set<() => void>();

function emitPrototypeStore(): void {
  for (const listener of storeListeners) listener();
}

export function subscribePrototypeStore(listener: () => void): () => void {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

export function getPrototypeServerSnapshot(): PrototypeStoreSnapshot {
  return serverStoreSnapshot;
}

export function getPrototypeClientSnapshot(): PrototypeStoreSnapshot {
  if (!hasReadStorage && typeof window !== "undefined") {
    hasReadStorage = true;
    clientStoreSnapshot = {
      loaded: true,
      state: loadPrototypeState() ?? emptyPrototypeState(),
    };
  }
  return clientStoreSnapshot;
}

export function resetPrototypeStore(): void {
  clientStoreSnapshot = { loaded: true, state: emptyPrototypeState() };
  clearPrototypeState();
  clearPrototypeEvents();
  emitPrototypeStore();
}
