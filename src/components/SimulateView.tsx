"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { goalTitle, horizonLabel } from "@/data/goals";
import { investmentOptions } from "@/data/investmentOptions";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { ExplainToggle } from "@/components/ExplainToggle";
import { usePrototypeState } from "@/components/usePrototypeState";
import { recordEvent } from "@/lib/events";
import { evaluateFirewall } from "@/lib/firewall";
import { emergencyCoverageMonths, monthlySurplus } from "@/lib/finance";
import { formatRupees, parseWholeNumber } from "@/lib/money";
import { riskLevelLabel, scoreRisk } from "@/lib/risk";
import {
  ABOVE_SURPLUS_MESSAGE,
  allocatedAmount,
  amountExceedsSurplus,
  COMFORT_CONFLICT_MESSAGE,
  comfortConflicts,
  FIREWALL_CLEAR_MESSAGE,
  firewallInputForSimulation,
  lowerConcentrationScenario,
  completedSavedSimulation,
  MISSING_CONTEXT_MESSAGE,
  parseSimulationAmount,
  scenarioCardsVisible,
  SIMULATION_AMOUNT_MAX,
  SIMULATION_DISCLAIMER,
  simulationSaveRefusal,
  simulationSliderMax,
  ZERO_AMOUNT_MESSAGE,
} from "@/lib/simulationSession";
import { illustrateDownsideScenarios } from "@/lib/simulator";
import { savePrototypeState } from "@/lib/storage";
import { goalFromDraft, snapshotFromDraft } from "@/lib/validation";
import type { FirewallChoice, FirewallSignal, SavedSimulation, ScenarioComfort } from "@/types";

function SimulationEvents({ started, firewall }: { started: boolean; firewall: boolean }) {
  const startedLogged = useRef(false);
  const firewallLogged = useRef(false);

  useEffect(() => {
    if (started && !startedLogged.current) {
      startedLogged.current = true;
      recordEvent("simulation_started");
    }
    if (firewall && !firewallLogged.current) {
      firewallLogged.current = true;
      recordEvent("firewall_triggered");
    }
  }, [started, firewall]);

  return null;
}

const COMFORT_OPTIONS: { id: ScenarioComfort; label: string }[] = [
  { id: "exit", label: "I would need to exit" },
  { id: "wait", label: "I would be uncomfortable but wait" },
  { id: "stay", label: "I could stay with my plan" },
];

function controlForSignal(id: string): string {
  if (id.startsWith("concentration") || id.startsWith("non-diversified")) return "allocation-percent";
  if (id === "buffer-mismatch") return "simulation-amount";
  return "simulation-option";
}

function amountProblem(raw: string): string | null {
  if (raw.trim() === "") return null;
  if (raw.includes("-")) {
    return "Use 0 or a positive amount. Negative values are not used in this prototype.";
  }
  const value = parseWholeNumber(raw);
  if (value === null) return "Use digits only, in whole rupees.";
  if (value > SIMULATION_AMOUNT_MAX) {
    return `Enter an amount up to ${formatRupees(SIMULATION_AMOUNT_MAX)}.`;
  }
  return null;
}

export function SimulateView() {
  const store = usePrototypeState();
  const [ready, setReady] = useState(false);
  const [optionId, setOptionId] = useState<string | null>(null);
  const [amountRaw, setAmountRaw] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [comfort, setComfort] = useState<ScenarioComfort | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [firewallChoice, setFirewallChoice] = useState<FirewallChoice | null>(null);
  const [saved, setSaved] = useState<SavedSimulation | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (store.loaded && !ready) {
    setReady(true);
    setOptionId(store.state.selectedOptionId);
    setAmountRaw(store.state.simulationAmount);
    setPercent(store.state.allocationPercent);
    setComfort(store.state.scenarioComfort);
    setAcknowledged(store.state.scenarioAcknowledged);
    setFirewallChoice(store.state.firewallChoice);
    setSaved(store.state.savedSimulation);
    setReviewed(store.state.simulationReviewed);
  }

  function persist(next: {
    optionId: string | null;
    amountRaw: string;
    percent: number | null;
    comfort: ScenarioComfort | null;
    acknowledged: boolean;
    firewallChoice: FirewallChoice | null;
    saved: SavedSimulation | null;
    simulationReviewed: boolean;
  }) {
    savePrototypeState({
      ...store.state,
      selectedOptionId: next.optionId,
      simulationAmount: next.amountRaw,
      allocationPercent: next.percent,
      scenarioComfort: next.comfort,
      scenarioAcknowledged: next.acknowledged,
      firewallChoice: next.firewallChoice,
      savedSimulation: next.saved,
      simulationReviewed: next.simulationReviewed,
    });
  }

  function snapshotDraft() {
    return {
      optionId,
      amountRaw,
      percent,
      comfort,
      acknowledged,
      firewallChoice,
      saved,
      simulationReviewed: reviewed,
    };
  }

  function changeInputs(
    patch: Partial<{
      optionId: string | null;
      amountRaw: string;
      percent: number | null;
      comfort: ScenarioComfort | null;
    }>,
  ) {
    const next = {
      ...snapshotDraft(),
      ...patch,
      acknowledged: false,
      firewallChoice: null,
    };
    if (patch.optionId !== undefined) setOptionId(patch.optionId);
    if (patch.amountRaw !== undefined) setAmountRaw(patch.amountRaw);
    if (patch.percent !== undefined) setPercent(patch.percent);
    if (patch.comfort !== undefined) setComfort(patch.comfort);
    setAcknowledged(false);
    setFirewallChoice(null);
    setFormError(null);
    persist(next);
  }

  if (!store.loaded) return <p className="loading">Loading your saved answers…</p>;

  const personaExperience = null;
  const snapshot = snapshotFromDraft(store.state.snapshot, personaExperience);
  const goal = goalFromDraft(store.state.goal);
  const profile = scoreRisk(store.state.riskAnswers);
  const surplus = snapshot ? monthlySurplus(snapshot.monthlyIncome, snapshot.essentialExpenses) : null;
  const coverage = snapshot
    ? emergencyCoverageMonths(snapshot.liquidSavings, snapshot.essentialExpenses)
    : null;
  const option = investmentOptions.find((item) => item.id === optionId) ?? null;
  const amount = parseSimulationAmount(amountRaw);
  const amountError = amountProblem(amountRaw);
  const aboveSurplus = amount !== null && surplus !== null && amountExceedsSurplus(amount, surplus);
  const share = percent ?? 0;
  const illustrated = amount === null ? 0 : allocatedAmount(amount, share);
  const scenarios = scenarioCardsVisible(amount, percent)
    ? illustrateDownsideScenarios(illustrated)
    : [];
  const sliderMax = simulationSliderMax(surplus ?? 0, amount);
  const signals: FirewallSignal[] =
    option && amount !== null && amount > 0 && share > 0 && profile && goal
      ? evaluateFirewall(
          firewallInputForSimulation({
            optionId: option.id,
            percent: share,
            riskLevel: profile.level,
            horizon: goal.horizon,
            emergencyCoverageMonths: coverage,
            essentialExpenses: snapshot?.essentialExpenses ?? 0,
          }),
        )
      : [];
  const comparison =
    amount !== null && signals.length > 0
      ? lowerConcentrationScenario(amount, share, signals)
      : null;
  const conflict =
    comfort !== null && comfortConflicts(store.state.riskAnswers["temporary-drop"], comfort);
  const checksReady = Boolean(option && amount !== null && amount > 0 && share > 0 && profile && goal);

  function adjustChoice() {
    const target = signals[0] ? controlForSignal(signals[0].id) : "simulation-amount";
    const next = { ...snapshotDraft(), firewallChoice: "adjust" as const, acknowledged: false };
    setFirewallChoice("adjust");
    setAcknowledged(false);
    persist(next);
    document.getElementById(target)?.focus();
  }

  function continueSimulation() {
    const next = { ...snapshotDraft(), firewallChoice: "continue" as const };
    setFirewallChoice("continue");
    persist(next);
    document.getElementById("scenario-acknowledgement")?.focus();
  }

  function saveDecision() {
    if (!option) {
      setFormError("Choose an educational option before saving this illustration.");
      document.getElementById("simulation-option")?.focus();
      return;
    }
    if (amount === null || amountError) {
      setFormError("Enter a whole-rupee amount before saving this illustration.");
      document.getElementById("simulation-amount")?.focus();
      return;
    }
    if (amount === 0) {
      setFormError(ZERO_AMOUNT_MESSAGE);
      document.getElementById("simulation-amount")?.focus();
      return;
    }
    if (percent === null) {
      setFormError("Set the share for the selected option before saving this illustration.");
      document.getElementById("allocation-percent")?.focus();
      return;
    }
    const refusal = simulationSaveRefusal({
      amount,
      allocationPercent: percent,
      hasGoal: Boolean(goal),
      hasRiskProfile: Boolean(profile),
    });
    if (refusal) {
      setFormError(refusal.message);
      document.getElementById(refusal.focusId)?.focus();
      return;
    }
    if (!comfort) {
      setFormError("Choose how this illustration would feel before saving it.");
      document.getElementById("scenario-comfort")?.focus();
      return;
    }
    if (signals.length > 0 && firewallChoice !== "continue") {
      setFormError("Use Adjust my choice, or Continue with this simulation, before saving.");
      document.getElementById("firewall-actions")?.focus();
      return;
    }
    if (!acknowledged) {
      setFormError("The acknowledgement is needed before this illustration can be saved.");
      document.getElementById("scenario-acknowledgement")?.focus();
      return;
    }
    const nextSaved = completedSavedSimulation({
      optionId: option.id,
      amount,
      allocationPercent: percent,
      hasGoal: Boolean(goal),
      hasRiskProfile: Boolean(profile),
      comfort,
      acknowledged: true,
      firewallSignalIds: signals.map((signal) => signal.id),
      firewallChoice,
    });
    if (!nextSaved) return;
    setSaved(nextSaved);
    setReviewed(true);
    setFormError(null);
    recordEvent("simulation_saved");
    persist({
      ...snapshotDraft(),
      acknowledged: true,
      saved: nextSaved,
      simulationReviewed: true,
    });
  }

  return (
    <div className="simulate-page stack">
      <p className="eyebrow">Simulate</p>
      <h1>Risk in rupees</h1>
      {!snapshot || surplus === null ? (
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
          <SimulationEvents started={scenarios.length > 0} firewall={signals.length > 0} />
          <p>
            This page turns a drop into rupees. Monthly surplus from the information entered is {formatRupees(surplus)}.
            {surplus === 0 ? " This page does not suggest an amount." : ""}
          </p>

          <section className="stack" aria-labelledby="simulation-option">
            <h2 id="simulation-option" tabIndex={-1}>
              Educational option
            </h2>
            <ChoiceGroup
              id="simulation-option-choices"
              name="simulation-option"
              legend="Which fictional option is this illustration about?"
              hint="These categories are fictional."
              value={optionId}
              options={investmentOptions.map((item) => ({
                id: item.id,
                label: item.name,
                description: `${riskLevelLabel(item.risk)} risk. ${item.diversified ? "Diversified" : "Not diversified"}.`,
              }))}
              onChange={(id) => changeInputs({ optionId: id })}
            />
          </section>

          <section className="stack" aria-labelledby="amount-heading">
            <h2 id="amount-heading">Amount</h2>
            <div className="field">
              <label htmlFor="simulation-amount">Amount to illustrate</label>
              <p className="hint" id="amount-hint">
                Whole rupees. Leave this blank if you do not want to illustrate an amount.
              </p>
              <div className="money-input">
                <span aria-hidden="true">₹</span>
                <input
                  id="simulation-amount"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-describedby={amountError || aboveSurplus ? "amount-context" : "amount-hint"}
                  value={amountRaw}
                  onChange={(event) => changeInputs({ amountRaw: event.target.value })}
                />
              </div>
              {sliderMax > 0 ? (
                <label className="range-field" htmlFor="simulation-amount-range">
                  Slide within the scale
                  <input
                    id="simulation-amount-range"
                    type="range"
                    min={0}
                    max={sliderMax}
                    step={1}
                    value={Math.min(amount ?? 0, sliderMax)}
                    onChange={(event) => changeInputs({ amountRaw: event.target.value })}
                  />
                </label>
              ) : null}
              {amountError ? (
                <p className="field-error" id="amount-context" role="alert">
                  {amountError}
                </p>
              ) : null}
              {!amountError && aboveSurplus ? (
                <p className="field-error" id="amount-context" role="status">
                  {ABOVE_SURPLUS_MESSAGE} You can change the amount.
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="allocation-percent">Share of this amount in the selected option</label>
              <p className="hint">
                {percent === null ? "Not set yet." : `${percent}% of the amount entered.`}
              </p>
              <input
                id="allocation-percent"
                type="range"
                min={0}
                max={100}
                step={1}
                value={percent ?? 0}
                onChange={(event) => changeInputs({ percent: Number(event.target.value) })}
              />
            </div>
          </section>

          <section className="stack" aria-labelledby="scenarios-heading">
            <h2 id="scenarios-heading">Scenarios</h2>
            <p className="callout">{SIMULATION_DISCLAIMER}</p>
            {scenarios.length === 0 ? (
              <p>Enter an amount and a share above 0% to see the rupee illustration for this option.</p>
            ) : (
              <div className="scenario-grid">
                {scenarios.map((scenario) => {
                  const loss = Math.abs(scenario.rupeeChange);
                  const startHeight = scenario.startingAmount === 0 ? 0 : 100;
                  const resultHeight =
                    scenario.startingAmount === 0
                      ? 0
                      : Math.max(0, Math.round((scenario.scenarioValue / scenario.startingAmount) * 100));
                  return (
                    <article className="card stack" key={scenario.id}>
                      <h3>{scenario.label}</h3>
                      <p>
                        If {formatRupees(scenario.startingAmount)} temporarily fell{" "}
                        {Math.abs(scenario.changePercent)}%, the value would be{" "}
                        {formatRupees(scenario.scenarioValue)}.
                      </p>
                      <svg
                        className="scenario-figure"
                        viewBox="0 0 120 88"
                        role="img"
                        aria-label={`Starting ${formatRupees(scenario.startingAmount)}, resulting ${formatRupees(scenario.scenarioValue)}`}
                      >
                        <rect x="18" y={72 - startHeight * 0.64} width="28" height={startHeight * 0.64} fill="#5367f5" />
                        <rect x="74" y={72 - resultHeight * 0.64} width="28" height={resultHeight * 0.64} fill="#7aaace" />
                        <text x="32" y="84" textAnchor="middle" fill="#355872" fontSize="8">
                          Start
                        </text>
                        <text x="88" y="84" textAnchor="middle" fill="#355872" fontSize="8">
                          After
                        </text>
                      </svg>
                      <dl className="summary-list">
                        <div>
                          <dt>Starting amount</dt>
                          <dd>{formatRupees(scenario.startingAmount)}</dd>
                        </div>
                        <div>
                          <dt>Scenario change</dt>
                          <dd>{scenario.label}</dd>
                        </div>
                        <div>
                          <dt>Illustrative resulting amount</dt>
                          <dd>{formatRupees(scenario.scenarioValue)}</dd>
                        </div>
                        <div>
                          <dt>Rupee loss</dt>
                          <dd>{formatRupees(loss)}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="stack" aria-labelledby="comfort-heading">
            <h2 id="comfort-heading">If this happened temporarily</h2>
            <ChoiceGroup
              id="scenario-comfort"
              name="scenario-comfort"
              legend="If this happened temporarily, how would you feel?"
              value={comfort}
              options={COMFORT_OPTIONS}
              onChange={(id) => changeInputs({ comfort: id as ScenarioComfort })}
            />
            {conflict ? <p className="notice">{COMFORT_CONFLICT_MESSAGE}</p> : null}
          </section>

          <section className="stack" aria-labelledby="firewall-heading">
            <h2 id="firewall-heading">FOMO Firewall</h2>
            {!checksReady ? (
              <p className="notice">
                The pause checks run when an option, an amount above ₹0, a share above 0%, a goal
                horizon, and comfort answers are all saved. Nothing here is blocked.
              </p>
            ) : signals.length === 0 ? (
              <p className="notice">{FIREWALL_CLEAR_MESSAGE}</p>
            ) : (
              <div className="pause-panel stack">
                <h3>Pause before you continue</h3>
                {signals.map((signal) => (
                  <article className="stack" key={signal.id}>
                    <p>
                      <strong>{signal.title}</strong>
                    </p>
                    <p>{signal.reason}</p>
                    <ExplainToggle label="Why am I seeing this?">
                      <p>{signal.explanation}</p>
                    </ExplainToggle>
                    <p>{signal.possibleAdjustment}</p>
                  </article>
                ))}
                {option ? (
                  <ExplainToggle label="What could go wrong?">
                    <p>{option.whatCouldGoWrong}</p>
                  </ExplainToggle>
                ) : null}
                {comparison ? (
                  <p>
                    One lower-concentration comparison: at {comparison.percent}% of the amount
                    entered, the same 20% illustration would start from{" "}
                    {formatRupees(comparison.scenario.startingAmount)} and show{" "}
                    {formatRupees(comparison.scenario.scenarioValue)}.
                  </p>
                ) : null}
                <div className="stack">
                  <p>
                    {goal
                      ? `Goal entered: ${goalTitle(goal.type)}. Time horizon: ${horizonLabel(goal.horizon)}.`
                      : "No goal is saved."}{" "}
                    {profile
                      ? `Comfort from the earlier answers: ${riskLevelLabel(profile.level)}.`
                      : "Comfort answers are not saved."}
                  </p>
                </div>
                <div className="inline-actions" id="firewall-actions" tabIndex={-1}>
                  <button className="btn btn-secondary" type="button" onClick={adjustChoice}>
                    Adjust my choice
                  </button>
                  <button className="btn btn-primary" type="button" onClick={continueSimulation}>
                    Continue with this simulation
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="stack" aria-labelledby="save-heading">
            <h2 id="save-heading">Save this illustration</h2>
            {!goal || !profile ? (
              <div className="notice">
                <p>{MISSING_CONTEXT_MESSAGE}</p>
                <div className="inline-actions">
                  <Link id="starter-flow-link" className="btn btn-secondary" href="/starter">
                    Return to the starter flow
                  </Link>
                </div>
              </div>
            ) : null}
            <label className="choice" htmlFor="scenario-acknowledgement">
              <input
                id="scenario-acknowledgement"
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => {
                  const next = { ...snapshotDraft(), acknowledged: event.target.checked };
                  setAcknowledged(event.target.checked);
                  setFormError(null);
                  persist(next);
                }}
              />
              <span>I understand this is an illustrative scenario and not a return forecast.</span>
            </label>
            {formError ? (
              <p className="field-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="inline-actions">
              <button className="btn btn-primary" type="button" onClick={saveDecision}>
                Save this simulated decision
              </button>
              <Link className="btn btn-secondary" href="/plan">
                Back to the plan
              </Link>
            </div>
            {saved ? (
              <p className="notice">
                Saved illustration: {investmentOptions.find((item) => item.id === saved.optionId)?.name},{" "}
                {formatRupees(saved.amount)}, {saved.allocationPercent}% share.
                {saved.firewallSignalIds.length > 0
                  ? ` Pauses recorded: ${saved.firewallSignalIds.length}.`
                  : " No pause was recorded."}
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
