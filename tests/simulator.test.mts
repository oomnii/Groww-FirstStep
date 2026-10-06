import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { illustrateDownsideScenarios, illustrateScenario } from "../src/lib/simulator.ts";

describe("risk scenarios", () => {
  it("turns a 20 percent mathematical drop into rupees", () => {
    const scenario = illustrateScenario(5000, -20);
    assert.equal(scenario.scenarioValue, 4000);
    assert.equal(scenario.rupeeChange, -1000);
    assert.equal(scenario.isForecast, false);
    assert.match(scenario.note, /not a forecast/i);
  });

  it("builds the three downside illustrations", () => {
    const scenarios = illustrateDownsideScenarios(5000);
    assert.deepEqual(
      scenarios.map((scenario) => scenario.scenarioValue),
      [4500, 4000, 3500],
    );
  });

  it("keeps a zero amount at zero", () => {
    assert.equal(illustrateScenario(0, -30).scenarioValue, 0);
  });

  it("rejects a negative starting amount", () => {
    assert.throws(() => illustrateScenario(-1, -10));
  });
});
