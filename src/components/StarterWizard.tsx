"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getPersona } from "@/data/personas";
import { goalDefinitions, goalTitle, horizonDefinitions, horizonLabel } from "@/data/goals";
import { riskQuestions } from "@/data/riskQuestions";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { RiskExplanation } from "@/components/RiskExplanation";
import { TextField } from "@/components/TextField";
import { usePrototypeState } from "@/components/usePrototypeState";
import { recordEvent } from "@/lib/events";
import { coverageBand, emergencyCoverageMonths, illustrativeEmergencyTarget, monthlySurplus } from "@/lib/finance";
import { formatCoverageMonths, formatRupees } from "@/lib/money";
import { riskLevelLabel, scoreRisk } from "@/lib/risk";
import { resetPrototypeStore, savePrototypeState, stateFromPersona, emptyPrototypeState } from "@/lib/storage";
import {
  goalFromDraft,
  snapshotFromDraft,
  validateGoalFields,
  validateRiskAnswers,
  validateSnapshotFields,
  type FieldErrors,
} from "@/lib/validation";
import type { GoalDraft, GoalType, PrototypeState, SnapshotDraft, TimeHorizon } from "@/types";

const STEPS = [
  { short: "Start", title: "Your starting point" },
  { short: "Goal", title: "Your goal" },
  { short: "Risk", title: "Your comfort with risk" },
  { short: "Review", title: "Review" },
];

function focusFirstError(errors: FieldErrors) {
  const firstId = Object.keys(errors)[0];
  if (!firstId) return;
  const node = document.getElementById(firstId);
  if (!node) return;
  if (node instanceof HTMLInputElement) {
    node.focus();
    return;
  }
  node.querySelector("input")?.focus();
}

export function StarterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personaParam = searchParams.get("persona");
  const store = usePrototypeState();
  const requestedPersona = personaParam ? getPersona(personaParam) : undefined;
  const unknownPersona = Boolean(personaParam && !requestedPersona);
  const [state, setState] = useState<PrototypeState>(store.state);
  const [storeReady, setStoreReady] = useState(false);
  const [appliedPersona, setAppliedPersona] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skipInitialFocus = useRef(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmReset, setConfirmReset] = useState(false);

  if (store.loaded && (!storeReady || personaParam !== appliedPersona)) {
    setStoreReady(true);
    setAppliedPersona(personaParam);
    setErrors({});
    if (requestedPersona && store.state.personaId !== requestedPersona.id) {
      setState(stateFromPersona(requestedPersona));
    } else {
      setState(store.state);
    }
  }

  useEffect(() => {
    if (!store.loaded) return;
    savePrototypeState(state);
  }, [store.loaded, state]);

  useEffect(() => {
    recordEvent("starter_started");
  }, []);

  useEffect(() => {
    if (!store.loaded) return;
    if (skipInitialFocus.current) {
      skipInitialFocus.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [store.loaded, state.wizardStep]);

  function updateSnapshot(field: keyof SnapshotDraft, value: string) {
    setState((current) => ({
      ...current,
      snapshot: { ...current.snapshot, [field]: value },
    }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateGoal(patch: Partial<GoalDraft>) {
    setState((current) => ({
      ...current,
      goal: { ...current.goal, ...patch },
    }));
  }

  function goTo(step: number) {
    setErrors({});
    setState((current) => ({ ...current, wizardStep: step }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.wizardStep === 0) {
      const nextErrors = validateSnapshotFields(state.snapshot);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        focusFirstError(nextErrors);
        return;
      }
    }
    if (state.wizardStep === 1) {
      const nextErrors = validateGoalFields(state.goal);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        focusFirstError(nextErrors);
        return;
      }
    }
    if (state.wizardStep === 2) {
      const nextErrors = validateRiskAnswers(state.riskAnswers);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        focusFirstError(nextErrors);
        return;
      }
    }
    if (state.wizardStep >= 3) return;
    if (state.wizardStep === 0) recordEvent("snapshot_completed");
    if (state.wizardStep === 1) recordEvent("goal_completed");
    if (state.wizardStep === 2) recordEvent("risk_completed");
    setErrors({});
    setState((current) => ({
      ...current,
      wizardStep: current.wizardStep + 1,
      furthestStep: Math.max(current.furthestStep, current.wizardStep + 1),
    }));
  }

  function startOver() {
    resetPrototypeStore();
    setAppliedPersona(personaParam);
    setState(emptyPrototypeState());
    setErrors({});
    setConfirmReset(false);
    router.replace("/starter");
  }

  if (!store.loaded) {
    return <p className="loading">Loading your saved answers…</p>;
  }

  const persona = state.personaId ? getPersona(state.personaId) : undefined;
  const snapshot = snapshotFromDraft(state.snapshot, persona?.investmentExperience ?? null);
  const goal = goalFromDraft(state.goal);
  const profile = scoreRisk(state.riskAnswers);
  const surplus = snapshot ? monthlySurplus(snapshot.monthlyIncome, snapshot.essentialExpenses) : null;
  const emergencyTarget = snapshot ? illustrativeEmergencyTarget(snapshot.essentialExpenses) : null;
  const coverage = snapshot
    ? emergencyCoverageMonths(snapshot.liquidSavings, snapshot.essentialExpenses)
    : null;

  return (
    <div className="narrow">
      <p className="step-count">Step {state.wizardStep + 1} of 4</p>
      <ol className="stepper" aria-label="Starter steps">
        {STEPS.map((step, index) => (
          <li key={step.short}>
            <button
              type="button"
              aria-current={index === state.wizardStep ? "step" : undefined}
              disabled={index > state.furthestStep}
              onClick={() => goTo(index)}
            >
              {index + 1}. {step.short}
            </button>
          </li>
        ))}
      </ol>

      {unknownPersona ? (
        <p className="notice" role="status">
          That demo was not found. You can enter your own amounts.
        </p>
      ) : null}
      {persona ? (
        <p className="notice" role="status">
          Started from the {persona.name} demo. Change any number — nothing here is locked.
        </p>
      ) : null}

      <form className="stack" onSubmit={handleSubmit} noValidate>
        <h1 ref={headingRef} tabIndex={-1}>
          {STEPS[state.wizardStep]?.title}
        </h1>

        {state.wizardStep === 0 ? (
          <div className="field-grid two">
            <TextField
              className="span-2"
              id="age"
              label="Age"
              hint="This prototype is built around people in their early twenties. Other ages from 16 to 80 can still be entered."
              value={state.snapshot.age}
              error={errors.age}
              onChange={(value) => updateSnapshot("age", value)}
            />
            <TextField
              id="monthlyIncome"
              label="Monthly income"
              hint="Use 0 if you have no income this month."
              prefix="₹"
              value={state.snapshot.monthlyIncome}
              error={errors.monthlyIncome}
              onChange={(value) => updateSnapshot("monthlyIncome", value)}
            />
            <TextField
              id="essentialExpenses"
              label="Essential monthly expenses"
              hint="Rent, food, travel, and other costs you need to pay. This can be higher than income."
              prefix="₹"
              value={state.snapshot.essentialExpenses}
              error={errors.essentialExpenses}
              onChange={(value) => updateSnapshot("essentialExpenses", value)}
            />
            <TextField
              className="span-2"
              id="liquidSavings"
              label="Current liquid savings"
              hint="Money you could use soon, such as a bank balance. 0 is fine."
              prefix="₹"
              value={state.snapshot.liquidSavings}
              error={errors.liquidSavings}
              onChange={(value) => updateSnapshot("liquidSavings", value)}
            />
          </div>
        ) : null}

        {state.wizardStep === 1 ? (
          <div className="stack">
            <ChoiceGroup
              id="type"
              name="goal-type"
              legend="What are you planning toward?"
              value={state.goal.type}
              error={errors.type}
              options={goalDefinitions.map((item) => ({
                id: item.type,
                label: item.title,
                description: item.description,
              }))}
              onChange={(id) => {
                updateGoal({ type: id as GoalType });
                setErrors((current) => {
                  const next = { ...current };
                  delete next.type;
                  return next;
                });
              }}
            />
            <TextField
              id="targetAmount"
              label="Target amount"
              hint="The amount this goal represents in the illustration. It is not a required investment."
              prefix="₹"
              value={state.goal.targetAmount}
              error={errors.targetAmount}
              onChange={(value) => {
                updateGoal({ targetAmount: value });
                setErrors((current) => {
                  const next = { ...current };
                  delete next.targetAmount;
                  return next;
                });
              }}
            />
            <ChoiceGroup
              id="horizon"
              name="horizon"
              legend="Time horizon"
              hint="A shorter horizon usually leaves less time to wait through a drop."
              value={state.goal.horizon}
              error={errors.horizon}
              options={horizonDefinitions.map((item) => ({
                id: item.id,
                label: item.label,
                description: item.description,
              }))}
              onChange={(id) => {
                updateGoal({ horizon: id as TimeHorizon });
                setErrors((current) => {
                  const next = { ...current };
                  delete next.horizon;
                  return next;
                });
              }}
            />
          </div>
        ) : null}

        {state.wizardStep === 2 ? (
          <div className="stack">
            <p>These answers only describe comfort inside this prototype. They do not predict markets.</p>
            {riskQuestions.map((question) => (
              <ChoiceGroup
                key={question.id}
                id={question.id}
                name={question.id}
                legend={question.prompt}
                hint={question.help}
                value={state.riskAnswers[question.id] ?? null}
                error={errors[question.id]}
                options={question.options.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
                onChange={(id) => {
                  setState((current) => ({
                    ...current,
                    riskAnswers: { ...current.riskAnswers, [question.id]: id },
                  }));
                  setErrors((current) => {
                    const next = { ...current };
                    delete next[question.id];
                    return next;
                  });
                }}
              />
            ))}
            {profile ? <RiskExplanation profile={profile} /> : (
              <p className="hint">Answer the questions to see a comfort level.</p>
            )}
          </div>
        ) : null}

        {state.wizardStep === 3 ? (
          <div className="stack">
            {!snapshot || !goal || !profile ? (
              <div className="notice">
                <p>Some answers need another look before this review can be completed.</p>
                <div className="inline-actions">
                  {!snapshot ? (
                    <button className="btn btn-secondary" type="button" onClick={() => goTo(0)}>
                      Check starting point
                    </button>
                  ) : null}
                  {!goal ? (
                    <button className="btn btn-secondary" type="button" onClick={() => goTo(1)}>
                      Check goal
                    </button>
                  ) : null}
                  {!profile ? (
                    <button className="btn btn-secondary" type="button" onClick={() => goTo(2)}>
                      Check comfort questions
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <p>
                  This summary is based only on the information you entered in this prototype. It is
                  an educational illustration, not investment advice, and not a forecast.
                </p>
                <dl className="summary-list">
                  <div>
                    <dt>Age</dt>
                    <dd>{snapshot.age}</dd>
                  </div>
                  <div>
                    <dt>Monthly income</dt>
                    <dd>{formatRupees(snapshot.monthlyIncome)}</dd>
                  </div>
                  <div>
                    <dt>Essential monthly expenses</dt>
                    <dd>{formatRupees(snapshot.essentialExpenses)}</dd>
                  </div>
                  <div>
                    <dt>Monthly surplus</dt>
                    <dd>{formatRupees(surplus ?? 0)}</dd>
                  </div>
                  <div>
                    <dt>Current liquid savings</dt>
                    <dd>{formatRupees(snapshot.liquidSavings)}</dd>
                  </div>
                  <div>
                    <dt>Illustrative emergency target</dt>
                    <dd>{formatRupees(emergencyTarget ?? 0)}</dd>
                  </div>
                  <div>
                    <dt>Emergency coverage</dt>
                    <dd>{formatCoverageMonths(coverage)}</dd>
                  </div>
                  <div>
                    <dt>Goal</dt>
                    <dd>
                      {goalTitle(goal.type)} · {formatRupees(goal.targetAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt>Time horizon</dt>
                    <dd>{horizonLabel(goal.horizon)}</dd>
                  </div>
                  <div>
                    <dt>Comfort level</dt>
                    <dd>{riskLevelLabel(profile.level)}</dd>
                  </div>
                </dl>
                <div className="callout">
                  <p>
                    Monthly surplus is income minus essential expenses. This prototype never shows
                    it below ₹0.
                    {surplus === 0
                      ? " Essential expenses are at least as high as income, so no amount is shown as available to invest."
                      : ` That is ${formatRupees(snapshot.monthlyIncome)} minus ${formatRupees(snapshot.essentialExpenses)}.`}
                  </p>
                  <p>
                    The emergency target is three months of essential expenses. That is an
                    illustrative assumption in this prototype, not a rule that fits everyone.
                    {snapshot.essentialExpenses === 0
                      ? " Because essential expenses are ₹0, months of coverage are not calculated."
                      : coverage !== null && coverageBand(snapshot) === "under-1"
                        ? " Coverage is under one month of essential expenses."
                        : ""}
                  </p>
                </div>
                <RiskExplanation profile={profile} />
                <div className="inline-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => goTo(0)}>
                    Edit starting point
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => goTo(1)}>
                    Edit goal
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => goTo(2)}>
                    Edit comfort answers
                  </button>
                  <Link className="btn btn-primary" href="/plan">
                    See illustrative split
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : null}

        {state.wizardStep < 3 ? (
          <div className="wizard-actions">
            {state.wizardStep > 0 ? (
              <button className="btn btn-ghost" type="button" onClick={() => goTo(state.wizardStep - 1)}>
                Back
              </button>
            ) : (
              <Link className="btn btn-ghost" href="/">
                Back to intro
              </Link>
            )}
            <button className="btn btn-primary" type="submit">
              Continue
            </button>
          </div>
        ) : (
          <div className="wizard-actions">
            <button className="btn btn-ghost" type="button" onClick={() => goTo(2)}>
              Back
            </button>
          </div>
        )}
      </form>

      <div className="reset-box">
        {confirmReset ? (
          <div className="stack">
            <p>This clears only the answers saved by this prototype in this browser.</p>
            <div className="inline-actions">
              <button className="btn btn-secondary" type="button" onClick={startOver}>
                Clear saved answers
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setConfirmReset(false)}>
                Keep going
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost" type="button" onClick={() => setConfirmReset(true)}>
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
