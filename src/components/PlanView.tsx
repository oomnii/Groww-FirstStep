"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { goalTitle, horizonLabel } from "@/data/goals";
import { investmentOptions } from "@/data/investmentOptions";
import { planChangeFactors } from "@/data/planFactors";
import { getPersona } from "@/data/personas";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { ExplainToggle } from "@/components/ExplainToggle";
import { Meter } from "@/components/Meter";
import { usePrototypeState } from "@/components/usePrototypeState";
import { recordEvent } from "@/lib/events";
import { formatCoverageMonths, formatRupees } from "@/lib/money";
import { buildStarterPlan } from "@/lib/plan";
import { riskLevelLabel, scoreRisk } from "@/lib/risk";
import { savePrototypeState } from "@/lib/storage";
import { goalFromDraft, snapshotFromDraft } from "@/lib/validation";
import type { RiskLevel } from "@/types";

const CATEGORY_TONE = {
  buffer: "indigo",
  "goal-reserve": "sky",
  exploration: "mint",
} as const;

function barPercent(part: number, whole: number): number {
  if (whole <= 0 || part <= 0) return 0;
  return Math.min(100, (part / whole) * 100);
}

function riskTone(level: RiskLevel): string {
  return riskLevelLabel(level);
}

export function PlanView() {
  const router = useRouter();
  const store = usePrototypeState();
  const [draftReady, setDraftReady] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidenceBaseline, setConfidenceBaseline] = useState<number | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const planVisit = useRef(false);
  const [optionError, setOptionError] = useState<string | null>(null);

  if (store.loaded && !draftReady) {
    setDraftReady(true);
    setSelectedOptionId(store.state.selectedOptionId);
    setConfidenceBaseline(store.state.confidenceBaseline);
  }

  function persist(next: { selectedOptionId: string | null; confidenceBaseline: number | null }) {
    savePrototypeState({
      ...store.state,
      selectedOptionId: next.selectedOptionId,
      confidenceBaseline: next.confidenceBaseline,
      planViewed: true,
    });
  }

  useEffect(() => {
    if (!store.loaded || planVisit.current) return;
    const persona = store.state.personaId ? getPersona(store.state.personaId) : undefined;
    const snapshot = snapshotFromDraft(store.state.snapshot, persona?.investmentExperience ?? null);
    if (!snapshot) return;
    planVisit.current = true;
    recordEvent("plan_viewed");
    if (!store.state.planViewed) {
      savePrototypeState({ ...store.state, planViewed: true });
    }
  }, [store.loaded, store.state]);

  function chooseOption(id: string) {
    setSelectedOptionId(id);
    setOptionError(null);
    persist({ selectedOptionId: id, confidenceBaseline });
  }

  function chooseConfidence(id: string) {
    const value = Number(id);
    setConfidenceBaseline(value);
    setLeaveError(null);
    persist({ selectedOptionId, confidenceBaseline: value });
  }

  function openSimulation() {
    if (!selectedOptionId) {
      setOptionError("Choose an educational option before opening the scenario page.");
      document.getElementById("educational-options")?.focus();
      return;
    }
    if (confidenceBaseline === null) {
      setLeaveError("Choose a confidence answer before opening the scenario page.");
      document.getElementById("confidence")?.focus();
      return;
    }
    router.push("/simulate");
  }

  if (!store.loaded) return <p className="loading">Loading your saved answers…</p>;

  const persona = store.state.personaId ? getPersona(store.state.personaId) : undefined;
  const snapshot = snapshotFromDraft(store.state.snapshot, persona?.investmentExperience ?? null);
  const goal = goalFromDraft(store.state.goal);
  const profile = scoreRisk(store.state.riskAnswers);
  const plan = snapshot ? buildStarterPlan(snapshot, goal, profile) : null;
  const income = snapshot?.monthlyIncome ?? 0;
  const expenses = snapshot?.essentialExpenses ?? 0;
  const savings = snapshot?.liquidSavings ?? 0;
  const coveragePercent = plan
    ? barPercent(savings, plan.illustrativeEmergencyTarget)
    : 0;

  return (
    <div className="plan-page stack">
      <p className="eyebrow">Plan</p>
      <h1>Your starter plan</h1>
      {!plan || !snapshot ? (
        <div className="notice">
          <p>Add a starting point first. This page uses only what you save in this browser.</p>
          <div className="inline-actions">
            <Link className="btn btn-primary" href="/starter">
              Build my starter plan
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="section-intro">
            This is an educational illustration from the amounts and answers saved in this browser.
            It is not personal investment advice.
          </p>

          <section className="stack" aria-labelledby="starting-point">
            <h2 id="starting-point">Your starting point</h2>
            <div className="meter-grid">
              <Meter
                label="Monthly income"
                value={formatRupees(income)}
                percent={null}
                tone="indigo"
              />
              <Meter
                label="Essential expenses"
                value={formatRupees(expenses)}
                percent={income > 0 ? barPercent(expenses, income) : expenses > 0 ? 100 : 0}
                detail={
                  expenses > income
                    ? "Essential expenses are higher than monthly income in the amounts entered."
                    : undefined
                }
                tone="stone"
              />
              <Meter
                label="Monthly surplus"
                value={formatRupees(plan.monthlySurplus)}
                percent={barPercent(plan.monthlySurplus, income)}
                detail="Income minus essential expenses, and never below ₹0."
                tone="mint"
              />
              <Meter
                label="Emergency coverage"
                value={formatCoverageMonths(plan.emergencyCoverageMonths)}
                percent={coveragePercent}
                detail={
                  plan.bufferStanding === "not-calculated"
                    ? undefined
                    : `Illustrative target ${formatRupees(plan.illustrativeEmergencyTarget)}, from three months of essential expenses in this prototype.`
                }
                tone={
                  plan.bufferStanding === "developing"
                    ? "sky"
                    : plan.bufferStanding === "comparatively-healthy"
                      ? "indigo"
                      : "stone"
                }
              />
            </div>
            <p className={`standing standing-${plan.bufferStanding}`}>
              <span className="standing-label">{plan.standingLabel}</span>
              <span>{plan.whyCoverage}</span>
            </p>
          </section>

          <section className="stack" aria-labelledby="starter-plan">
            <h2 id="starter-plan">Your Starter Plan</h2>
            <p>{plan.headline}</p>
            <p>{plan.explanation}</p>
            {goal ? (
              <p>
                Goal: {goalTitle(goal.type)}. Time horizon: {horizonLabel(goal.horizon)}. Target:{" "}
                {formatRupees(goal.targetAmount)}.
              </p>
            ) : (
              <p>No goal is saved yet. The split below does not set aside a goal reserve.</p>
            )}
            <div className="stack">
              {plan.categories.map((category) => (
                <article className="card stack" key={category.id}>
                  <h3>{category.label}</h3>
                  <p className="comfort">{formatRupees(category.amount)}</p>
                  <Meter
                    label="Share of monthly surplus"
                    value={`${Math.round(category.shareOfSurplus * 100)}%`}
                    percent={category.shareOfSurplus * 100}
                    tone={CATEGORY_TONE[category.id]}
                  />
                  <p className="hint">{category.note}</p>
                </article>
              ))}
            </div>
            {!plan.investableAmountShown ? (
              <p className="notice">This illustration does not show an amount available to invest.</p>
            ) : null}
            <div className="stack">
              <h3>Why this plan looks like this</h3>
              <p>{plan.whyHorizon}</p>
              <p>{plan.whyRisk}</p>
              <ExplainToggle label="Why am I seeing this?">
                <p>
                  The lines above come from the coverage band, the goal horizon, and the comfort
                  answers saved in this browser. They are predefined explanations, not a new
                  calculation.
                </p>
              </ExplainToggle>
            </div>
            <p>{plan.nextLook}</p>
            <p className="callout">{plan.disclaimer}</p>
          </section>

          <section className="stack" aria-labelledby="what-changes">
            <h2 id="what-changes">What could change this plan?</h2>
            <ul className="factor-list">
              {planChangeFactors.map((factor) => (
                <li key={factor.id}>
                  <p>
                    <strong>{factor.title}</strong>
                  </p>
                  <p>{factor.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="stack" aria-labelledby="educational-options">
            <h2 id="educational-options" tabIndex={-1}>
              Explore educational options
            </h2>
            <p>These four categories are fictional. Pick one to carry into the scenario page.</p>
            {optionError ? (
              <p className="field-error" role="alert">
                {optionError}
              </p>
            ) : null}
            <div className="stack">
              {investmentOptions.map((option) => (
                <article className="card stack" key={option.id}>
                  <label className="choice">
                    <input
                      type="radio"
                      name="educational-option"
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={() => chooseOption(option.id)}
                    />
                    <span>
                      <span className="choice-title">{option.name}</span>
                    </span>
                  </label>
                  <dl className="summary-list">
                    <div>
                      <dt>Risk level</dt>
                      <dd>{riskTone(option.risk)}</dd>
                    </div>
                    <div>
                      <dt>Diversification</dt>
                      <dd>{option.diversified ? "Diversified" : "Not diversified"}</dd>
                    </div>
                  </dl>
                  <p>{option.illustrates}</p>
                  <ExplainToggle label="What could go wrong?">
                    <p>{option.whatCouldGoWrong}</p>
                  </ExplainToggle>
                </article>
              ))}
            </div>
          </section>

          <section className="stack" aria-labelledby="confidence-heading">
            <h2 id="confidence-heading">Before you continue</h2>
            <ChoiceGroup
              id="confidence"
              name="confidence"
              layout="scale"
              legend="How confident do you currently feel about making your first investment decision?"
              hint="1 is less confident right now. 5 is more confident right now. Any answer is fine."
              value={confidenceBaseline === null ? null : String(confidenceBaseline)}
              options={[1, 2, 3, 4, 5].map((score) => ({
                id: String(score),
                label: String(score),
              }))}
              error={leaveError ?? undefined}
              onChange={chooseConfidence}
            />
            <div className="inline-actions">
              <button className="btn btn-primary" type="button" onClick={openSimulation}>
                See what risk feels like
              </button>
              <Link className="btn btn-secondary" href="/starter">
                Edit answers
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
