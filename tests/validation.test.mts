import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatRupees } from "../src/lib/money.ts";
import {
  goalFromDraft,
  snapshotFromDraft,
  validateGoalFields,
  validateRiskAnswers,
  validateSnapshotFields,
} from "../src/lib/validation.ts";

const validSnapshot = {
  age: "21",
  monthlyIncome: "8,000",
  essentialExpenses: "12000",
  liquidSavings: "0",
};

describe("input validation", () => {
  it("allows zero income, zero savings, and expenses above income", () => {
    const errors = validateSnapshotFields({
      ...validSnapshot,
      monthlyIncome: "0",
      essentialExpenses: "500",
      liquidSavings: "0",
    });
    assert.deepEqual(errors, {});
    const parsed = snapshotFromDraft(
      { ...validSnapshot, monthlyIncome: "0", essentialExpenses: "500", liquidSavings: "0" },
      null,
    );
    assert.equal(parsed?.monthlyIncome, 0);
    assert.equal(parsed?.essentialExpenses, 500);
  });

  it("rejects negatives, blanks, decimals, and values above the prototype maximums", () => {
    const errors = validateSnapshotFields({
      age: "-1",
      monthlyIncome: "",
      essentialExpenses: "10.5",
      liquidSavings: "50000001",
    });
    assert.ok(errors.age);
    assert.ok(errors.monthlyIncome);
    assert.ok(errors.essentialExpenses);
    assert.ok(errors.liquidSavings);
    assert.equal(snapshotFromDraft({ age: "15", monthlyIncome: "1", essentialExpenses: "1", liquidSavings: "1" }, null), null);
  });

  it("accepts ages at the documented bounds", () => {
    assert.equal(validateSnapshotFields({ ...validSnapshot, age: "16" }).age, undefined);
    assert.equal(validateSnapshotFields({ ...validSnapshot, age: "80" }).age, undefined);
    assert.ok(validateSnapshotFields({ ...validSnapshot, age: "81" }).age);
  });

  it("requires a goal, a whole-rupee target, and a horizon", () => {
    const errors = validateGoalFields({ type: null, targetAmount: "0", horizon: null });
    assert.ok(errors.type);
    assert.ok(errors.targetAmount);
    assert.ok(errors.horizon);
    const goal = goalFromDraft({ type: "travel", targetAmount: "45000", horizon: "1-3-years" });
    assert.equal(goal?.targetAmount, 45000);
  });

  it("requires an answer for every comfort question", () => {
    const errors = validateRiskAnswers({ "temporary-drop": "need-now" });
    assert.equal(Object.keys(errors).length, 3);
  });

  it("formats rupees for India", () => {
    const formatted = formatRupees(100000);
    assert.match(formatted, /1,00,000/);
    assert.match(formatted, /₹/);
  });
});
