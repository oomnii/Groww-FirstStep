import type { RiskQuestion } from "@/types";

export const riskQuestions: RiskQuestion[] = [
  {
    id: "temporary-drop",
    prompt: "If an amount you had invested temporarily fell by 20%, what feels closest?",
    help: "A 20% fall means ₹1,000 would be shown as ₹800 for a while. This is a hypothetical, not a prediction.",
    options: [
      { id: "need-now", label: "I would need that money immediately", score: 0 },
      { id: "uncomfortable-wait", label: "I would feel uncomfortable, but I could wait", score: 1 },
      { id: "continue-plan", label: "I could continue with the plan", score: 2 },
    ],
  },
  {
    id: "need-money",
    prompt: "When might you need this money?",
    options: [
      { id: "within-year", label: "Within a year", score: 0 },
      { id: "one-to-three", label: "In 1–3 years", score: 1 },
      { id: "later", label: "In more than 3 years", score: 2 },
    ],
  },
  {
    id: "familiarity",
    prompt: "How familiar are you with market fluctuations?",
    help: "Market fluctuations mean prices can move up and down.",
    options: [
      { id: "not-familiar", label: "Not familiar — I have not really watched this happen", score: 0 },
      { id: "somewhat", label: "Somewhat familiar — I know values can rise and fall", score: 1 },
      { id: "familiar", label: "Familiar — I have seen or read about larger swings", score: 2 },
    ],
  },
  {
    id: "longer-goal",
    prompt: "If your goal is still years away and markets fall, what feels closer?",
    options: [
      { id: "keep-savings", label: "I would rather keep the money in savings", score: 0 },
      { id: "smaller-amount", label: "I could keep a smaller amount invested and review it", score: 1 },
      { id: "stay-plan", label: "I could stay with a longer-term plan", score: 2 },
    ],
  },
];

export const RISK_BAND_RULE = "0–2 is Low, 3–5 is Moderate, and 6–8 is High.";
