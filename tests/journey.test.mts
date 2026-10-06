import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { personas } from "../src/data/personas.ts";
import { appendEvent, sanitizeEvents } from "../src/lib/events.ts";
import {
  CONFIDENCE_DROP_MESSAGE,
  confidenceNote,
  journeyChecklist,
  summarizeFirewallSignals,
  whatYouLearned,
} from "../src/lib/journey.ts";
import { emptyPrototypeState, stateFromPersona } from "../src/lib/storage.ts";

const manySignals = [
  "concentration-single-stock-demo",
  "non-diversified-single-stock-demo",
  "risk-mismatch",
  "horizon-mismatch",
  "buffer-mismatch",
];

describe("journey progress", () => {
  it("does not mark steps done on an empty visit", () => {
    const checks = journeyChecklist(emptyPrototypeState());
    assert.equal(checks.every((item) => item.done === false), true);
    assert.match(whatYouLearned(emptyPrototypeState()), /nothing has been saved/i);
  });

  it("does not treat a reviewed wizard as a reviewed plan or a saved scenario", () => {
    const checks = journeyChecklist({
      ...stateFromPersona(personas[0]),
      goal: { type: "laptop", targetAmount: "40000", horizon: "under-1-year" },
      riskAnswers: {
        "temporary-drop": "need-now",
        "need-money": "within-year",
        familiarity: "not-familiar",
        "longer-goal": "keep-savings",
      },
      wizardStep: 3,
      furthestStep: 3,
    });
    assert.equal(checks.find((item) => item.id === "snapshot")?.done, true);
    assert.equal(checks.find((item) => item.id === "goal")?.done, true);
    assert.equal(checks.find((item) => item.id === "risk")?.done, true);
    assert.equal(checks.find((item) => item.id === "plan")?.done, false);
    assert.equal(checks.find((item) => item.id === "scenario")?.done, false);
    assert.equal(checks.find((item) => item.id === "pressure")?.done, false);
  });

  it("marks the plan and the saved decision only after those actions", () => {
    const quiet = journeyChecklist({
      ...stateFromPersona(personas[1]),
      planViewed: true,
      goal: { type: "travel", targetAmount: "20000", horizon: "1-3-years" },
      riskAnswers: {
        "temporary-drop": "uncomfortable-wait",
        "need-money": "one-to-three",
        familiarity: "somewhat",
        "longer-goal": "smaller-amount",
      },
      savedSimulation: {
        optionId: "balanced-basket",
        amount: 2000,
        allocationPercent: 40,
        comfort: "wait",
        firewallSignalIds: [],
        firewallChoice: null,
      },
    });
    assert.equal(quiet.every((item) => item.done), true);
    const quietState = {
      ...stateFromPersona(personas[1]),
      planViewed: true,
      goal: { type: "travel" as const, targetAmount: "20000", horizon: "1-3-years" as const },
      riskAnswers: {
        "temporary-drop": "uncomfortable-wait",
        "need-money": "one-to-three",
        familiarity: "somewhat",
        "longer-goal": "smaller-amount",
      },
      savedSimulation: {
        optionId: "balanced-basket",
        amount: 2000,
        allocationPercent: 40,
        comfort: "wait" as const,
        firewallSignalIds: [],
        firewallChoice: null,
      },
    };
    assert.match(whatYouLearned(quietState), /no major mismatch/i);
  });

  it("summarizes several pauses once each and does not call them safe", () => {
    const lines = summarizeFirewallSignals(manySignals);
    assert.equal(lines.length, 5);
    assert.equal(lines.join(" ").toLowerCase().includes("safe"), false);
    const learned = whatYouLearned({
      ...stateFromPersona(personas[0]),
      savedSimulation: {
        optionId: "single-stock-demo",
        amount: 5000,
        allocationPercent: 100,
        comfort: "stay",
        firewallSignalIds: manySignals,
        firewallChoice: "continue",
      },
    });
    assert.match(learned, /5 pauses were recorded/i);
    assert.equal(learned.toLowerCase().includes("safe"), false);
  });

  it("treats a lower confidence score as a valid outcome", () => {
    assert.equal(confidenceNote(4, 2), CONFIDENCE_DROP_MESSAGE);
    assert.equal(confidenceNote(2, 4), null);
    assert.equal(confidenceNote(null, 4), null);
    assert.equal(CONFIDENCE_DROP_MESSAGE.toLowerCase().includes("invest"), false);
  });

  it("keeps the local event log bounded and drops unknown names", () => {
    const once = appendEvent([], "journey_completed", "2026-10-06T00:00:00.000Z");
    const again = appendEvent(once, "journey_completed", "2026-10-06T00:00:05.000Z");
    assert.equal(again.length, 1);
    const doubled = appendEvent(once, "journey_completed", "2026-10-06T00:00:00.100Z");
    assert.equal(doubled.length, 1);
    assert.deepEqual(
      sanitizeEvents([{ name: "plan_viewed", at: "2026-10-06T00:00:00.000Z" }, { name: "sent_home", at: "x" }]),
      [{ name: "plan_viewed", at: "2026-10-06T00:00:00.000Z" }],
    );
    const source = readFileSync(new URL("../src/lib/events.ts", import.meta.url), "utf8");
    assert.equal(source.includes("fetch("), false);
  });
});
