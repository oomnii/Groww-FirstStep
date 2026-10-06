"use client";

import type { RiskProfile } from "@/types";
import { ExplainToggle } from "@/components/ExplainToggle";
import { riskLevelLabel } from "@/lib/risk";

export function RiskExplanation({ profile }: { profile: RiskProfile }) {
  return (
    <div className="stack">
      <p className="comfort">
        Your current comfort level: <strong>{riskLevelLabel(profile.level)}</strong>
      </p>
      <p className="hint">A description of these answers. Not a suggestion to choose an option.</p>
      <ExplainToggle label="Why am I seeing this?">
        <p>{profile.summary}</p>
        <ul className="factor-list">
          {profile.factors.map((factor) => (
            <li key={factor.questionId}>
              <p>
                <strong>{factor.prompt}</strong>
              </p>
              <p>{factor.answerLabel}</p>
              <p className="hint">
                Counted as {factor.points} out of {factor.maxPoints} toward that comfort level in this prototype.
              </p>
            </li>
          ))}
        </ul>
      </ExplainToggle>
    </div>
  );
}
