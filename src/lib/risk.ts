import { RISK_BAND_RULE, riskQuestions } from "@/data/riskQuestions";
import type { RiskLevel, RiskProfile, RiskQuestion } from "@/types";

export function riskLevelForScore(score: number): RiskLevel {
  if (score <= 2) return "low";
  if (score <= 5) return "moderate";
  return "high";
}

export function riskLevelLabel(level: RiskLevel): string {
  if (level === "low") return "Low";
  if (level === "moderate") return "Moderate";
  return "High";
}

export function scoreRisk(
  answers: Record<string, string>,
  questions: RiskQuestion[] = riskQuestions,
): RiskProfile | null {
  const factors = [];
  let score = 0;
  let maxScore = 0;

  for (const question of questions) {
    const maxPoints = Math.max(...question.options.map((option) => option.score));
    maxScore += maxPoints;
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) return null;
    score += selected.score;
    factors.push({
      questionId: question.id,
      prompt: question.prompt,
      answerId: selected.id,
      answerLabel: selected.label,
      points: selected.score,
      maxPoints,
    });
  }

  const level = riskLevelForScore(score);
  const lead =
    level === "low"
      ? "Your answers suggest lower comfort with short-term ups and downs."
      : level === "moderate"
        ? "Your answers suggest a middle level of comfort with ups and downs."
        : "Your answers suggest more comfort with ups and downs.";
  return {
    level,
    score,
    maxScore,
    factors,
    bandRule: RISK_BAND_RULE,
    summary: `${lead} In this prototype they scored ${score} out of ${maxScore}. ${RISK_BAND_RULE} This describes the answers you gave. It is not a forecast and not a recommendation.`,
  };
}
