# Working assumptions

These are prototype assumptions, not claims about real customers or markets.

## Product scope

- The public name is Groww FirstStep. The tagline is “From first paycheck to first confident investment.”
- The prototype is deterministic and rule-based.
- External model services, chat interfaces, embeddings, and recommendation models are out of scope.
- Explanations are predefined product copy produced by the rules.
- The product has three capabilities: First Paycheck Investing OS, Risk Reality Simulator, and FOMO Firewall.
- The Starter Plan is the deterministic result of the paycheck rules, then the journey continues through the Risk Reality Simulator, the FOMO Firewall, a simulated decision, and progress.
- Later phases follow the original build plan and leave out any earlier optional model or chat idea.

## Stated for this case study

- Target users are approximately 20–26.
- Users are first-time or early-stage investors.
- Synthetic data is sufficient for prototype validation.
- The emergency buffer target is represented illustratively.
- Investment categories are educational abstractions.
- There is no real trading or brokerage execution.
- Scenarios are not forecasts.

## Additional prototype assumptions

- Ages outside 20–26 can be entered, within 16–80, so a demo is not blocked by a one-year difference. The product is still aimed at the early-twenties starting point.
- Money inputs are whole rupees. Commas and a rupee sign are accepted and stripped. Decimals and negative amounts are rejected.
- Monthly income, essential expenses, and liquid savings each allow ₹0. Expenses may be higher than income.
- Sensible maximums used by the form: monthly income and essential expenses up to ₹10,00,000; liquid savings and goal target up to ₹5,00,00,000.
- Monthly surplus is `max(income − essential expenses, 0)`. A negative gap is not shown as a negative surplus, and the copy does not treat it as a personal failure.
- The illustrative emergency target is essential expenses × 3. The interface calls this an assumption of this prototype, not a universal rule.
- If essential expenses are ₹0, months of coverage are not calculated. Dividing by zero is avoided. The three-month rupee target is also ₹0.
- Coverage bands, using that ratio only when expenses are above ₹0:
  - under 1 month
  - at least 1 month and under 3 months
  - 3 months or more
- Illustrative surplus split, applied only when surplus is above ₹0:
  - under 1 month of coverage: 90% buffer, 10% optional exploration
  - 1 month up to but not including 3: 60% buffer, 40% exploration
  - 3 months or more, or essential expenses of ₹0: 25% kept flexible, 75% exploration
- If surplus is ₹0, the cash-flow case wins even if savings already cover many months. No investable amount is shown.
- Rupee shares are rounded to the nearest rupee. The two shares always add back to the surplus.
- The plan page shows those same rupees as three lines: Safety / buffer keeps the buffer share. The optional share is then split into Goal reserve and Investment exploration.
- With no goal saved, the goal reserve is ₹0 and the optional share stays in investment exploration.
- If the goal is an emergency buffer, the whole optional share is shown as a goal reserve.
- Otherwise the goal-reserve share of the optional slice, before comfort, is 80% under 1 year, 50% for 1–3 years, 30% for 3–5 years, and 15% for 5+ years.
- Low comfort adds 20 percentage points to that goal-reserve share. High comfort subtracts 10. Moderate comfort does not move it. The share is capped between 0% and 100%.
- Buffer standing labels, under the three-month assumption: under 1 month is Weak, 1 month up to but not including 3 is Developing, 3 months or more is Comparatively healthy. ₹0 essential expenses stay Not calculated.
- A goal has a type, a target amount above ₹0, and one of four horizons: under 1 year, 1–3 years, 3–5 years, 5+ years.
- Comfort score uses four questions, each 0, 1, or 2 points. Maximum is 8.
  - 0–2 Low
  - 3–5 Moderate
  - 6–8 High
- The score is explained from the selected answers. It is not a forecast and not a product recommendation.
- Fictional options are Stability Bucket (low, diversified), Balanced Basket (moderate, diversified), Growth Basket (high, diversified), and Single Stock Demo (high, not diversified). They are not real securities and have no expected-return claim.
- Firewall pauses, which never block continuation:
  - one option above 60% of the chosen amount (caution; strong above 80%)
  - a non-diversified option above 35% (caution; strong above 60%)
  - Low comfort level together with any High-risk option
  - goal horizon under 1 year together with any High-risk option
  - emergency coverage under 1 month while High-risk options together take more than 25%
- “A large share” in the thin-buffer rule means more than 25% of the chosen investment amount.
- Downside scenarios are arithmetic for −10%, −20%, and −30%. Values are rounded to the nearest rupee. `isForecast` is always false.
- Demo personas supply only the financial starting point. Goal and comfort answers are still chosen by the person using the prototype.
- Opening a demo persona replaces the saved prototype draft when that demo is not already the saved persona. If the saved draft is already that persona, refresh keeps the journey, including goal and comfort answers.
- Prototype state is stored only in this browser under `groww-starter-prototype-v1`. Start over removes that key. No account and no server profile exist.
- Investment experience on a persona is descriptive metadata. The wizard does not ask for it separately; the comfort questions carry that role.
- `/simulate` contains the interactive rupee illustration, the pause panel, and the simulated save step.
- A simulation amount starts blank. A monthly surplus of ₹0 does not create a positive slider scale until an amount is typed.
- An amount above the calculated monthly surplus is kept and explained. It is not rewritten down to the surplus.
- A simulated decision is saved only when the amount is above ₹0, the share is above 0%, a valid goal exists, and the earlier comfort answers are complete. ₹0 and a 0% share do not show scenario cards. A missing goal or comfort profile is not filled in; the page points back to `/starter`.
- The scenario uses the share of that amount placed in the selected fictional option. The −10%, −20%, and −30% figures come from the existing scenario function.
- The pause panel calls the existing firewall function. It does not add a block. Adjust returns focus to the related control. Continue leaves the illustration open.
- A later comfort answer is compared with the earlier “temporary drop” answer. Only the two opposite ends are described as different. The earlier comfort level is not rewritten.
- The largest amount the illustration accepts is the same monthly maximum used by the starter form, ₹10,00,000.
- A progress step is marked done only from a saved fact: a valid snapshot, a valid goal, complete comfort answers, a plan page visit, or a saved illustration. Opening `/progress` does not complete those steps.
- The second confidence score is stored with the prototype. A lower score uses one fixed sentence. A higher score is shown without extra praise.
- Local events use `groww-starter-prototype-events-v1` in this browser. Start over removes that key and `groww-starter-prototype-v1` only.
- Weak, Developing, and Comparatively healthy stay the same three labels. Each is shown with the coverage explanation. Comparatively healthy still says it is not a statement that the buffer is enough.
