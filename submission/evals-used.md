# Evals used

These checks were executed in this workspace. A result is recorded only after the command finished.

## Decision-engine unit tests

Command: `npm test`

Runner: Node.js built-in test runner (`node:test`), 10 files under `tests/`.

Last result: **PASS** — 58 tests, 0 failed, 0 skipped. Phase 3 had 45. Phase 4 added simulation-session cases and a saved-illustration storage case. Phase 5 added `tests/journey.test.mts` without replacing those files. The earlier firewall and scenario tests are still in the same run.

Covered:

- monthly surplus, illustrative three-month target, zero-expense coverage
- starter-plan splits for Personas A–D and for a zero surplus
- risk score bands and the written explanation
- firewall signals, including a case that raises several pauses and does not block
- mathematical scenarios, including ₹5,000 at −20% → ₹4,000
- form validation bounds
- saved-state sanitising
- absence of prohibited promise phrases in `src/`
- journey steps marked only from saved facts, unique firewall summaries, the confidence-drop sentence, and a local-only event log

## Lint

Command: `npm run lint`

Last result: **PASS** — ESLint finished with no errors.

## Production build

Command: `npm run build`

Last result: **PASS** — Next.js 16.3.8 compiled, TypeScript finished, and the static pages were generated for `/`, `/starter`, `/plan`, `/simulate`, and `/progress`. Re-run after Phase 7 polish on 6 October 2026.

Playwright was re-run after that polish: **PASS** — 21 tests, 0 failed. Unit tests remained **PASS** — 58 tests, 0 failed.

## Final verification

Command, in order: `npm test`, `npm run lint`, `npm run test:e2e`, `npm run build`. Each later command ran only because the earlier one exited 0. Date: 6 October 2026.

- `npm test`: **PASS** — 58 tests, 0 failed
- `npm run lint`: **PASS**
- `npm run test:e2e`: **PASS** — 21 tests, 0 failed
- `npm run build`: **PASS** — Next.js 16.3.8, static routes `/`, `/starter`, `/plan`, `/simulate`, `/progress`

`npm start` on port 3001 then returned 200 for those routes and `/icon.svg`. With nothing saved, `/plan` and `/simulate` ask for a starting point, and `/progress` marks every step Not yet. `/plan` linked through to `/starter`. This was a local production process, not a Vercel deployment.

## Playwright

Command: `npm run test:e2e`

Runner: Playwright, Chromium, against `http://localhost:3000`.

Last result: **PASS** — 21 tests, 0 failed, on 6 October 2026.

One product defect was fixed before that passing run: the skip link did not move keyboard focus, because `main` could not be focused. `main` now has `tabIndex={-1}`. This run does not claim perfect accessibility.

### Eval 1 — Student with low buffer

- User scenario: a small income and low savings.
- Input: Student demo, income ₹8,000, expenses ₹5,500, savings ₹3,000, laptop goal, 1–3 year horizon, moderate comfort.
- Expected behaviour: buffer-first messaging, and no option selected as a default.
- Why this matters: a thin buffer should not be presented as an invitation to invest.
- Test mechanism: Playwright, `e2e/plan.spec.ts`.
- Actual outcome: the plan says “buffer first”, shows Safety / buffer ₹2,250, says none of the options is a default, and no educational option is selected.
- Result: **PASS**

### Eval 2 — Zero income

- User scenario: no income this month.
- Input: age 22, income ₹0, expenses ₹4,000, savings ₹0, then a goal and comfort answers.
- Expected behaviour: no crash, monthly surplus ₹0, and a clear explanation.
- Why this matters: an empty paycheck must stay usable and must not invent an amount.
- Test mechanism: Playwright, `e2e/plan.spec.ts`.
- Actual outcome: review shows ₹0 and says no amount is shown as available to invest. The plan repeats that and says this is not a judgment.
- Result: **PASS**

### Eval 3 — Expenses exceed income

- User scenario: essential costs are higher than income.
- Input: income ₹5,000, expenses ₹8,000, savings ₹1,000.
- Expected behaviour: monthly surplus ₹0, neutral tone, no investment pressure.
- Why this matters: a negative gap must not be turned into a suggested investment.
- Test mechanism: Playwright, `e2e/plan.spec.ts`.
- Actual outcome: review says essential expenses are at least as high as income. The plan says it does not show an amount available to invest, and says this is not a judgment.
- Result: **PASS**

### Eval 4 — Intern with modest surplus

- User scenario: a first stipend with some savings.
- Input: Intern demo, surplus ₹8,000, coverage 1.25 months.
- Expected behaviour: a mixed illustrative plan.
- Why this matters: a developing buffer should not use the same split as a thin buffer.
- Test mechanism: Playwright, `e2e/plan.spec.ts`.
- Actual outcome: the headline says “a mix”, the buffer line is ₹4,800, and the standing is Developing.
- Result: **PASS**

### Eval 5 — First-job employee with a healthier buffer

- User scenario: a new salary and a larger savings balance than the student.
- Input: First-job demo, surplus ₹15,000, coverage 2 months.
- Expected behaviour: a different plan from the low-buffer user.
- Why this matters: the same rules should change the illustration when the buffer is healthier.
- Test mechanism: Playwright, `e2e/plan.spec.ts`.
- Actual outcome: the plan is a mix with a ₹9,000 buffer line, and the buffer-first headline is absent.
- Result: **PASS**

### Eval 6 — Short-term goal and a higher-volatility option

- User scenario: money needed within a year, illustrated with Growth Basket.
- Input: Intern demo, horizon under 1 year, high comfort, Growth Basket, ₹2,000 at 40%.
- Expected behaviour: a horizon mismatch signal.
- Why this matters: a short horizon with a bumpier example should be visible before anyone continues.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: “Higher-volatility option with a short goal horizon” is shown.
- Result: **PASS**

### Eval 7 — Low comfort and Growth Basket

- User scenario: low comfort answers paired with the higher-volatility basket.
- Input: Intern demo, all-low comfort answers, 1–3 year horizon, Growth Basket, ₹2,000 at 40%.
- Expected behaviour: a risk mismatch signal.
- Why this matters: a low comfort level and a high-volatility example should be called out.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: “Higher-volatility option with a Low comfort level” is shown.
- Result: **PASS**

### Eval 8 — Single Stock Demo above 35%

- User scenario: a non-diversified example with a large share.
- Input: Intern demo, moderate comfort, Single Stock Demo, ₹2,000 at 40%.
- Expected behaviour: a non-diversification signal.
- Why this matters: one fictional example above 35% should raise a pause without being blocked.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: “A non-diversified example has a large share” is shown. The concentration title is absent at 40%.
- Result: **PASS**

### Eval 9 — One option above 60%

- User scenario: most of an illustration sits in one option.
- Input: Intern demo, Balanced Basket, ₹2,000 at 70%.
- Expected behaviour: a concentration signal.
- Why this matters: a share above 60% makes the illustration depend on one example.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: “A large share is in one option” is shown.
- Result: **PASS**

### Eval 10 — Thin buffer and a higher-volatility share

- User scenario: savings cover less than one month, with a larger higher-volatility share.
- Input: Student demo, moderate comfort, 1–3 year horizon, Growth Basket, ₹2,000 at 40%.
- Expected behaviour: a thin-buffer signal.
- Why this matters: a weak cash buffer plus a higher-volatility share should be visible.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: “Thin cash buffer with a higher-volatility share” is shown.
- Result: **PASS**

### Eval 11 — Risk simulator math

- User scenario: a ₹5,000 illustration and a 20% mathematical drop.
- Input: Intern demo, Stability Bucket, ₹5,000 at 100%.
- Expected behaviour: the 20% line shows ₹4,000.
- Why this matters: the rupee scenario must stay arithmetic.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: the page shows “If ₹5,000 temporarily fell 20%, the value would be ₹4,000.”
- Result: **PASS**

### Eval 12 — Refresh persistence

- User scenario: someone reloads in the middle of the wizard.
- Input: age 24, income ₹18,000, expenses ₹9,000, savings ₹12,000, Travel goal, target ₹15,000, horizon 1–3 years.
- Expected behaviour: the entered state remains after reload.
- Why this matters: a refresh must not wipe the draft.
- Test mechanism: Playwright, `e2e/persistence.spec.ts`.
- Actual outcome: after reload the goal step still shows Travel and ₹15,000, and the starting point still shows income ₹18,000.
- Result: **PASS**

### Eval 13 — Start over

- User scenario: the person clears this prototype’s saved answers.
- Input: income ₹18,000 and an unrelated localStorage key, then Start over and Clear saved answers.
- Expected behaviour: the entered prototype answers clear, and the unrelated key remains.
- Why this matters: reset must remove this prototype’s draft without touching other browser data.
- Test mechanism: Playwright, `e2e/persistence.spec.ts`.
- Actual outcome: income and age are blank after reload, the saved draft no longer contains 18000, and `unrelated-app-key` is still `keep-me`.
- Result: **PASS**

### Eval 14 — Continue despite a firewall signal

- User scenario: a concentration pause is acknowledged and saved.
- Input: Intern demo, Balanced Basket, ₹2,000 at 70%, comfort “I would be uncomfortable but wait”, then Continue, the acknowledgement, and Save.
- Expected behaviour: the person can continue after acknowledgement. The page does not block the save.
- Why this matters: firewall signals are pauses, not a lock.
- Test mechanism: Playwright, `e2e/firewall.spec.ts`.
- Actual outcome: Continue is enabled, focus moves to the acknowledgement, and the save notice records the pauses. The URL stays on `/simulate`.
- Result: **PASS**

### Eval 15 — Keyboard journey

- User scenario: the core path without a mouse click.
- Input: Tab from the landing page, then keyboard entry through starting point, Travel goal, moderate comfort, the plan, Stability Bucket, confidence 3, amount ₹2,000, and one step of the share slider.
- Expected behaviour: the core flow operates from the keyboard.
- Why this matters: the journey cannot depend on mouse-only controls.
- Test mechanism: Playwright keyboard, `e2e/access.spec.ts`.
- Actual outcome: the skip link focuses `main`, the wizard reaches review with surplus ₹2,500, and the simulator shows “If ₹20 temporarily fell 20%” after one keyboard step of the share control.
- Result: **PASS**. This is a core-flow check, not a claim of perfect accessibility.

### Eval 16 — Mobile viewport

- User scenario: a 390px-wide screen.
- Input: landing, a blank starter form, the student plan, the simulator, and progress.
- Expected behaviour: no sideways scrolling, and critical controls stay inside the width.
- Why this matters: the primary controls have to remain reachable on a phone.
- Test mechanism: Playwright viewport 390×844, `e2e/access.spec.ts`.
- Actual outcome: those pages do not scroll sideways. The primary button, amount field, share slider, and Start over control stay inside the width.
- Result: **PASS**

### Safety content

- User scenario: rendered pages and `src/` are searched for misleading claims.
- Input: landing, starter, a completed student review, the plan, a Single Stock Demo illustration at 100%, and progress. Source search covers `src/`.
- Expected behaviour: the pages and source do not contain “guaranteed return”, “best stock”, “safe investment”, “you will earn”, or the other banned promise phrases.
- Why this matters: the prototype must not sound like a promise or a recommendation.
- Test mechanism: Playwright `e2e/access.spec.ts`, and the existing source check in `tests/copy.test.mts`.
- Actual outcome: none of those phrases appeared in the rendered text or in `src/`.
- Result: **PASS**

Additional Playwright checks in `e2e/persistence.spec.ts`, all **PASS**: Back keeps the entered income, a negative amount stays on the step, ₹10,00,001 is rejected, and `/`, `/plan`, `/simulate`, and `/progress` open without a login.

## Scope cleanup re-check

After the documentation update that limits the product to a deterministic, rule-based prototype, the same commands were run again.

- `npm test`: **PASS** — 41 tests, 0 failed.
- `npm run build`: **PASS** — TypeScript finished and the same static routes were generated.

No application source, dependency, or type was changed in that pass.

## Browser pass

A manual pass in the browser is recorded in `submission/manual-testing.md`. The Playwright result is recorded above.
