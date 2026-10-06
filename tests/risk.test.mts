import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreRisk, riskLevelForScore } from "../src/lib/risk.ts";

const lowAnswers = {
  "temporary-drop": "need-now",
  "need-money": "within-year",
  familiarity: "not-familiar",
  "longer-goal": "keep-savings",
};

describe("risk score", () => {
  it("maps the published bands", () => {
    assert.equal(riskLevelForScore(0), "low");
    assert.equal(riskLevelForScore(2), "low");
    assert.equal(riskLevelForScore(3), "moderate");
    assert.equal(riskLevelForScore(5), "moderate");
    assert.equal(riskLevelForScore(6), "high");
    assert.equal(riskLevelForScore(8), "high");
  });

  it("returns null until every question has a known answer", () => {
    assert.equal(scoreRisk({}), null);
    assert.equal(scoreRisk({ ...lowAnswers, familiarity: "missing" }), null);
  });

  it("explains a low score from the selected answers", () => {
    const profile = scoreRisk(lowAnswers);
    assert.ok(profile);
    assert.equal(profile.score, 0);
    assert.equal(profile.maxScore, 8);
    assert.equal(profile.level, "low");
    assert.equal(profile.factors.length, 4);
    assert.equal(profile.factors[0]?.answerLabel, "I would need that money immediately");
    assert.match(profile.summary, /0 out of 8/);
    assert.match(profile.bandRule, /0–2 is Low/);
  });

  it("scores the top of each answer as high", () => {
    const profile = scoreRisk({
      "temporary-drop": "continue-plan",
      "need-money": "later",
      familiarity: "familiar",
      "longer-goal": "stay-plan",
    });
    assert.ok(profile);
    assert.equal(profile.score, 8);
    assert.equal(profile.level, "high");
  });

  it("scores a middle combination as moderate", () => {
    const profile = scoreRisk({
      "temporary-drop": "uncomfortable-wait",
      "need-money": "one-to-three",
      familiarity: "somewhat",
      "longer-goal": "keep-savings",
    });
    assert.ok(profile);
    assert.equal(profile.score, 3);
    assert.equal(profile.level, "moderate");
  });
});
