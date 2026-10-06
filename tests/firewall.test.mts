import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFirewall } from "../src/lib/firewall.ts";
import type { FirewallInput } from "../src/lib/firewall.ts";

function input(overrides: Partial<FirewallInput> = {}): FirewallInput {
  return {
    allocations: [{ optionId: "balanced-basket", percent: 100 }],
    riskLevel: "moderate",
    horizon: "3-5-years",
    emergencyCoverageMonths: 4,
    essentialExpenses: 20000,
    ...overrides,
  };
}

describe("FOMO firewall", () => {
  it("stays quiet for a diversified moderate illustration", () => {
    const signals = evaluateFirewall(
      input({
        allocations: [
          { optionId: "stability-bucket", percent: 50 },
          { optionId: "balanced-basket", percent: 50 },
        ],
      }),
    );
    assert.deepEqual(signals, []);
  });

  it("flags concentration above 60 percent and strengthens it above 80", () => {
    const caution = evaluateFirewall(
      input({ allocations: [{ optionId: "stability-bucket", percent: 70 }] }),
    );
    assert.equal(caution.find((signal) => signal.id === "concentration-stability-bucket")?.severity, "caution");

    const strong = evaluateFirewall(
      input({ allocations: [{ optionId: "stability-bucket", percent: 90 }] }),
    );
    assert.equal(strong.find((signal) => signal.id === "concentration-stability-bucket")?.severity, "strong");
  });

  it("flags a non-diversified option above 35 percent", () => {
    const signals = evaluateFirewall(
      input({
        allocations: [
          { optionId: "single-stock-demo", percent: 40 },
          { optionId: "balanced-basket", percent: 60 },
        ],
      }),
    );
    assert.equal(signals.find((signal) => signal.id === "non-diversified-single-stock-demo")?.severity, "caution");
    assert.equal(signals.some((signal) => signal.id.startsWith("concentration-")), false);
  });

  it("flags a low comfort level paired with a high-risk option", () => {
    const signals = evaluateFirewall(
      input({
        riskLevel: "low",
        allocations: [
          { optionId: "growth-basket", percent: 20 },
          { optionId: "stability-bucket", percent: 80 },
        ],
      }),
    );
    assert.equal(signals.find((signal) => signal.id === "risk-mismatch")?.severity, "strong");
  });

  it("flags a short horizon paired with a high-risk option", () => {
    const signals = evaluateFirewall(
      input({
        horizon: "under-1-year",
        allocations: [{ optionId: "growth-basket", percent: 20 }, { optionId: "balanced-basket", percent: 80 }],
      }),
    );
    assert.ok(signals.some((signal) => signal.id === "horizon-mismatch"));
  });

  it("flags a thin buffer when high-risk options take more than 25 percent", () => {
    const quiet = evaluateFirewall(
      input({
        emergencyCoverageMonths: 0.4,
        allocations: [
          { optionId: "growth-basket", percent: 25 },
          { optionId: "stability-bucket", percent: 75 },
        ],
      }),
    );
    assert.equal(quiet.some((signal) => signal.id === "buffer-mismatch"), false);

    const flagged = evaluateFirewall(
      input({
        emergencyCoverageMonths: 0.4,
        allocations: [
          { optionId: "growth-basket", percent: 26 },
          { optionId: "stability-bucket", percent: 74 },
        ],
      }),
    );
    assert.equal(flagged.find((signal) => signal.id === "buffer-mismatch")?.severity, "strong");
  });

  it("does not apply the buffer rule when expenses are zero", () => {
    const signals = evaluateFirewall(
      input({
        essentialExpenses: 0,
        emergencyCoverageMonths: null,
        allocations: [{ optionId: "growth-basket", percent: 50 }, { optionId: "balanced-basket", percent: 50 }],
      }),
    );
    assert.equal(signals.some((signal) => signal.id === "buffer-mismatch"), false);
  });

  it("can raise several pauses at once without a blocking flag", () => {
    const signals = evaluateFirewall(
      input({
        riskLevel: "low",
        horizon: "under-1-year",
        emergencyCoverageMonths: 0.2,
        allocations: [{ optionId: "single-stock-demo", percent: 100 }],
      }),
    );
    const ids = signals.map((signal) => signal.id).sort();
    assert.deepEqual(ids, [
      "buffer-mismatch",
      "concentration-single-stock-demo",
      "horizon-mismatch",
      "non-diversified-single-stock-demo",
      "risk-mismatch",
    ]);
    assert.equal(signals.every((signal) => !("blocks" in signal)), true);
    assert.equal(signals.every((signal) => ["info", "caution", "strong"].includes(signal.severity)), true);
  });
});
