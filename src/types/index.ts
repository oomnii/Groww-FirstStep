export type InvestmentExperience = "none" | "beginner";

export interface UserPersona {
  id: string;
  code: string;
  name: string;
  age: number;
  monthlyIncome: number;
  essentialExpenses: number;
  liquidSavings: number;
  investmentExperience: InvestmentExperience;
  summary: string;
}

export interface SnapshotDraft {
  age: string;
  monthlyIncome: string;
  essentialExpenses: string;
  liquidSavings: string;
}

export interface FinancialSnapshot {
  age: number;
  monthlyIncome: number;
  essentialExpenses: number;
  liquidSavings: number;
  investmentExperience: InvestmentExperience | null;
}

export type GoalType =
  | "emergency-buffer"
  | "laptop"
  | "travel"
  | "higher-studies"
  | "long-term-wealth";

export type TimeHorizon =
  | "under-1-year"
  | "1-3-years"
  | "3-5-years"
  | "5-plus-years";

export interface Goal {
  type: GoalType;
  targetAmount: number;
  horizon: TimeHorizon;
}

export interface GoalDraft {
  type: GoalType | null;
  targetAmount: string;
  horizon: TimeHorizon | null;
}

export interface RiskQuestionOption {
  id: string;
  label: string;
  score: number;
}

export interface RiskQuestion {
  id: string;
  prompt: string;
  help?: string;
  options: RiskQuestionOption[];
}

export type RiskLevel = "low" | "moderate" | "high";

export interface RiskFactor {
  questionId: string;
  prompt: string;
  answerId: string;
  answerLabel: string;
  points: number;
  maxPoints: number;
}

export interface RiskProfile {
  level: RiskLevel;
  score: number;
  maxScore: number;
  factors: RiskFactor[];
  summary: string;
  bandRule: string;
}

export interface InvestmentOption {
  id: string;
  name: string;
  risk: RiskLevel;
  diversified: boolean;
  purpose: string;
  description: string;
  illustrates: string;
  whatCouldGoWrong: string;
}

export type PlanPriority =
  | "improve-cashflow"
  | "buffer-first"
  | "mixed"
  | "explore-more";

export type CoverageBand =
  | "not-computable"
  | "under-1"
  | "one-to-three"
  | "three-plus";

export interface PlanAllocation {
  id: "buffer" | "explore";
  label: string;
  amount: number;
  shareOfSurplus: number;
  note: string;
}

export type PlanCategoryId = "buffer" | "goal-reserve" | "exploration";

export type BufferStanding = "weak" | "developing" | "comparatively-healthy" | "not-calculated";

export interface PlanCategory {
  id: PlanCategoryId;
  label: string;
  amount: number;
  shareOfSurplus: number;
  note: string;
}

export interface StarterPlan {
  monthlySurplus: number;
  illustrativeEmergencyTarget: number;
  emergencyCoverageMonths: number | null;
  coverageBand: CoverageBand;
  priority: PlanPriority;
  investableAmountShown: boolean;
  headline: string;
  explanation: string;
  allocations: PlanAllocation[];
  categories: PlanCategory[];
  bufferStanding: BufferStanding;
  standingLabel: string;
  whyCoverage: string;
  whyHorizon: string;
  whyRisk: string;
  nextLook: string;
  notes: string[];
  disclaimer: string;
}

export interface RiskScenario {
  id: string;
  label: string;
  changePercent: number;
  startingAmount: number;
  scenarioValue: number;
  rupeeChange: number;
  isForecast: false;
  note: string;
}

export type FirewallSeverity = "info" | "caution" | "strong";

export interface FirewallSignal {
  id: string;
  severity: FirewallSeverity;
  title: string;
  reason: string;
  explanation: string;
  possibleAdjustment: string;
}

export interface AllocationChoice {
  optionId: string;
  percent: number;
}

export type JourneyStage =
  | "understand"
  | "plan"
  | "simulate"
  | "protect"
  | "decide"
  | "progress";

export type FirewallChoice = "adjust" | "continue";

export type ScenarioComfort = "exit" | "wait" | "stay";

export interface SavedSimulation {
  optionId: string;
  amount: number;
  allocationPercent: number;
  comfort: ScenarioComfort;
  firewallSignalIds: string[];
  firewallChoice: FirewallChoice | null;
}

export interface ProgressState {
  stage: JourneyStage;
  wizardStep: number;
  furthestStep: number;
  snapshotComplete: boolean;
  goalComplete: boolean;
  riskComplete: boolean;
  reviewComplete: boolean;
  completedStages: JourneyStage[];
  simulationReviewed: boolean;
  firewallChoice: FirewallChoice | null;
  updatedAt: string | null;
}

export interface PrototypeState {
  version: 1;
  personaId: string | null;
  snapshot: SnapshotDraft;
  goal: GoalDraft;
  riskAnswers: Record<string, string>;
  wizardStep: number;
  furthestStep: number;
  simulationReviewed: boolean;
  firewallChoice: FirewallChoice | null;
  selectedOptionId: string | null;
  confidenceBaseline: number | null;
  simulationAmount: string;
  allocationPercent: number | null;
  scenarioComfort: ScenarioComfort | null;
  scenarioAcknowledged: boolean;
  savedSimulation: SavedSimulation | null;
  planViewed: boolean;
  confidenceNow: number | null;
  updatedAt: string | null;
}
