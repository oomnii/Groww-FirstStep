import type { GoalType, TimeHorizon } from "@/types";

export interface GoalDefinition {
  type: GoalType;
  title: string;
  description: string;
}

export interface HorizonDefinition {
  id: TimeHorizon;
  label: string;
  description: string;
}

export const goalDefinitions: GoalDefinition[] = [
  {
    type: "emergency-buffer",
    title: "Emergency buffer",
    description: "A cash cushion for unexpected costs.",
  },
  {
    type: "laptop",
    title: "Laptop / major purchase",
    description: "A specific purchase you want to plan toward.",
  },
  {
    type: "travel",
    title: "Travel",
    description: "A trip or time away.",
  },
  {
    type: "higher-studies",
    title: "Higher studies",
    description: "Course fees or other study costs.",
  },
  {
    type: "long-term-wealth",
    title: "Long-term wealth",
    description: "Money you may not need for many years.",
  },
];

export const horizonDefinitions: HorizonDefinition[] = [
  {
    id: "under-1-year",
    label: "Under 1 year",
    description: "You may need this money soon.",
  },
  {
    id: "1-3-years",
    label: "1–3 years",
    description: "There is some time before the goal.",
  },
  {
    id: "3-5-years",
    label: "3–5 years",
    description: "The goal is a few years away.",
  },
  {
    id: "5-plus-years",
    label: "5+ years",
    description: "You are looking further ahead.",
  },
];

export function goalTitle(type: GoalType): string {
  return goalDefinitions.find((goal) => goal.type === type)?.title ?? type;
}

export function horizonLabel(horizon: TimeHorizon): string {
  return horizonDefinitions.find((item) => item.id === horizon)?.label ?? horizon;
}
