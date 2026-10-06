import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  coverageBand,
  emergencyCoverageMonths,
  illustrativeEmergencyTarget,
  monthlySurplus,
} from "../src/lib/finance.ts";

describe("financial calculations", () => {
  it("calculates monthly surplus and floors it at zero", () => {
    assert.equal(monthlySurplus(8000, 5500), 2500);
    assert.equal(monthlySurplus(10000, 12000), 0);
    assert.equal(monthlySurplus(0, 0), 0);
  });

  it("uses three months of essential expenses as the illustrative target", () => {
    assert.equal(illustrativeEmergencyTarget(5500), 16500);
    assert.equal(illustrativeEmergencyTarget(0), 0);
  });

  it("returns null coverage when essential expenses are zero", () => {
    assert.equal(emergencyCoverageMonths(3000, 0), null);
    assert.equal(emergencyCoverageMonths(0, 0), null);
  });

  it("divides savings by essential expenses", () => {
    assert.ok(Math.abs((emergencyCoverageMonths(3000, 5500) ?? 0) - 3000 / 5500) < 1e-10);
    assert.equal(emergencyCoverageMonths(40000, 20000), 2);
  });

  it("groups coverage into the prototype bands", () => {
    assert.equal(coverageBand({ liquidSavings: 3000, essentialExpenses: 5500 }), "under-1");
    assert.equal(coverageBand({ liquidSavings: 12000, essentialExpenses: 12000 }), "one-to-three");
    assert.equal(coverageBand({ liquidSavings: 35999, essentialExpenses: 12000 }), "one-to-three");
    assert.equal(coverageBand({ liquidSavings: 36000, essentialExpenses: 12000 }), "three-plus");
    assert.equal(coverageBand({ liquidSavings: 0, essentialExpenses: 0 }), "not-computable");
  });

  it("rejects non-finite inputs", () => {
    assert.throws(() => monthlySurplus(Number.NaN, 1));
    assert.throws(() => illustrativeEmergencyTarget(Number.POSITIVE_INFINITY));
    assert.throws(() => emergencyCoverageMonths(1, Number.NaN));
  });
});
