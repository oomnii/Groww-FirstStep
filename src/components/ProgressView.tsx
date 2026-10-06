"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { learningCards } from "@/data/learningCards";
import { goalTitle, horizonLabel } from "@/data/goals";
import { getInvestmentOption } from "@/data/investmentOptions";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { usePrototypeState } from "@/components/usePrototypeState";
import { loadPrototypeEvents, recordEvent } from "@/lib/events";
import { monthlySurplus } from "@/lib/finance";
import {
  confidenceNote,
  journeyChecklist,
  summarizeFirewallSignals,
  whatYouLearned,
  whyLearningMattered,
} from "@/lib/journey";
import { formatRupees } from "@/lib/money";
import { riskLevelLabel, scoreRisk } from "@/lib/risk";
import { FIREWALL_CLEAR_MESSAGE } from "@/lib/simulationSession";
import { resetPrototypeStore, savePrototypeState } from "@/lib/storage";
import { goalFromDraft, snapshotFromDraft } from "@/lib/validation";

function scoreText(value: number | null): string {
  return value === null ? "Not saved" : `${value}/5`;
}

export function ProgressView() {
  const router = useRouter();
  const store = usePrototypeState();
  const [confidenceNow, setConfidenceNow] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [sawQuery, setSawQuery] = useState(false);

  if (store.loaded && !ready) {
    setReady(true);
    setConfidenceNow(store.state.confidenceNow);
  }

  const checks = journeyChecklist(store.state);
  const journeyDone = checks.every((item) => item.done);

  if (!sawQuery && typeof window !== "undefined") {
    setSawQuery(true);
    if (new URLSearchParams(window.location.search).get("events") === "1") setShowLog(true);
  }

  if (store.loaded && journeyDone && typeof window !== "undefined") {
    recordEvent("journey_completed");
  }

  const events = showLog && typeof window !== "undefined" ? loadPrototypeEvents() : [];

  if (!store.loaded) return <p className="loading">Loading your saved answers…</p>;

  const snapshot = snapshotFromDraft(store.state.snapshot, null);
  const goal = goalFromDraft(store.state.goal);
  const profile = scoreRisk(store.state.riskAnswers);
  const saved = store.state.savedSimulation;
  const option = saved ? getInvestmentOption(saved.optionId) : undefined;
  const surplus = snapshot ? monthlySurplus(snapshot.monthlyIncome, snapshot.essentialExpenses) : null;
  const firewallLines = saved ? summarizeFirewallSignals(saved.firewallSignalIds) : [];
  const before = store.state.confidenceBaseline;
  const note = confidenceNote(before, confidenceNow);

  function chooseConfidence(id: string) {
    const value = Number(id);
    setConfidenceNow(value);
    savePrototypeState({ ...store.state, confidenceNow: value });
  }

  function startOver() {
    resetPrototypeStore();
    setConfidenceNow(null);
    setConfirmReset(false);
    router.replace("/progress");
  }

  return (
    <div className="plan-page stack">
      <p className="eyebrow">Progress</p>
      <h1>Where this journey stands</h1>
      <p>Saved on this device only. A step stays open until you have actually finished it.</p>

      <section className="stack" aria-labelledby="journey-heading">
        <h2 id="journey-heading">Journey progress</h2>
        <ol className="check-list">
          {checks.map((item) => (
            <li key={item.id}>
              <span className={item.done ? "check-mark done" : "check-mark"} aria-hidden="true" />
              <p>
                <strong>{item.label}</strong> · {item.done ? "Done" : "Not yet"}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="stack" aria-labelledby="confidence-now-heading">
        <h2 id="confidence-now-heading">Confidence</h2>
        <dl className="summary-list">
          <div>
            <dt>Before</dt>
            <dd>{scoreText(before)}</dd>
          </div>
          <div>
            <dt>Now</dt>
            <dd>{scoreText(confidenceNow)}</dd>
          </div>
        </dl>
        {note ? <p>{note}</p> : null}
        <ChoiceGroup
          id="confidence-now"
          name="confidence-now"
          layout="scale"
          legend="How confident do you now feel about understanding your first investment decision?"
          hint="1 is less confident right now. 5 is more confident right now. Any answer is fine."
          value={confidenceNow === null ? null : String(confidenceNow)}
          options={[1, 2, 3, 4, 5].map((score) => ({ id: String(score), label: String(score) }))}
          onChange={chooseConfidence}
        />
      </section>

      <section className="stack" aria-labelledby="summary-heading">
        <h2 id="summary-heading">Decision summary</h2>
        <dl className="summary-list">
          <div>
            <dt>Goal</dt>
            <dd>{goal ? goalTitle(goal.type) : "Not saved yet"}</dd>
          </div>
          <div>
            <dt>Time horizon</dt>
            <dd>{goal ? horizonLabel(goal.horizon) : "Not saved yet"}</dd>
          </div>
          <div>
            <dt>Risk comfort</dt>
            <dd>{profile ? riskLevelLabel(profile.level) : "Not saved yet"}</dd>
          </div>
          <div>
            <dt>Monthly surplus</dt>
            <dd>{surplus === null ? "Not saved yet" : formatRupees(surplus)}</dd>
          </div>
          <div>
            <dt>Selected educational option</dt>
            <dd>{option ? option.name : "Not saved yet"}</dd>
          </div>
          <div>
            <dt>Simulated amount</dt>
            <dd>{saved ? formatRupees(saved.amount) : "Not saved yet"}</dd>
          </div>
          <div>
            <dt>Scenario explored</dt>
            <dd>{saved ? "−10%, −20%, and −30%" : "Not saved yet"}</dd>
          </div>
          <div>
            <dt>Final user choice</dt>
            <dd>
              {!saved
                ? "Not saved yet"
                : saved.firewallChoice === "continue"
                  ? "Continued with this simulation"
                  : "Saved the illustration"}
            </dd>
          </div>
        </dl>
        <div className="stack">
          <h3>Firewall signals encountered</h3>
          {!saved ? <p>Not saved yet.</p> : null}
          {saved && firewallLines.length === 0 ? <p>{FIREWALL_CLEAR_MESSAGE}</p> : null}
          {firewallLines.length > 0 ? (
            <ul className="factor-list">
              {firewallLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="stack">
          <h3>What you learned</h3>
          <p>{whatYouLearned(store.state)}</p>
        </div>
      </section>

      <section className="stack" aria-labelledby="learning-heading">
        <h2 id="learning-heading">A few ideas from your plan</h2>
        <div className="stack">
          {learningCards.map((card) => (
            <article className="card stack" key={card.id}>
              <h3>{card.title}</h3>
              <p>{card.definition}</p>
              <p>
                <strong>Why it mattered in your plan. </strong>
                {whyLearningMattered(card.id, store.state)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="next-heading">
        <h2 id="next-heading">Next steps</h2>
        <div className="inline-actions">
          <Link className="btn btn-secondary" href="/plan">
            Adjust my plan
          </Link>
          <Link className="btn btn-secondary" href="/simulate">
            Try another scenario
          </Link>
        </div>
        <div className="reset-box">
          {confirmReset ? (
            <div className="stack">
              <p>This clears the answers and the local event log saved in this browser for this prototype.</p>
              <div className="inline-actions">
                <button className="btn btn-primary" type="button" onClick={startOver}>
                  Clear saved answers
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setConfirmReset(false)}>
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
      </section>

      <section className="stack" aria-labelledby="events-heading">
        <h2 id="events-heading" className="hint">
          Demo only
        </h2>
        <button className="btn btn-ghost" type="button" aria-expanded={showLog} onClick={() => setShowLog((open) => !open)}>
          {showLog ? "Hide local event log" : "Show local event log"}
        </button>
        {showLog ? (
          events.length === 0 ? (
            <p>No local events yet. They stay in this browser.</p>
          ) : (
            <ul className="factor-list">
              {events.map((event, index) => (
                <li key={`${event.name}-${event.at}-${index}`}>
                  {event.name} · {event.at}
                </li>
              ))}
            </ul>
          )
        ) : null}
      </section>
    </div>
  );
}
