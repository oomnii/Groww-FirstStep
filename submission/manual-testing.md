# Manual testing

Executed in the browser against `npm run dev` on 6 October 2026. Only rows marked PASS were observed.

| Check | Result |
| --- | --- |
| Landing shows Groww FirstStep, the paycheck line, both CTAs, four demo personas, and the educational disclaimer | PASS |
| Student demo prefills age 21, income ₹8,000, expenses ₹5,500, savings ₹3,000 | PASS |
| Intern demo prefills age 22, income ₹20,000, expenses ₹12,000, savings ₹15,000 | PASS |
| First-job demo prefills age 23, income ₹35,000, expenses ₹20,000, savings ₹40,000 | PASS |
| Higher-income demo prefills age 25, income ₹60,000, expenses ₹30,000, savings ₹1,00,000 | PASS |
| Continuing a goal step with nothing chosen shows inline errors and stays on the step | PASS |
| Student review shows surplus ₹2,500, illustrative target ₹16,500, coverage 0.55 months | PASS |
| Comfort explanation for a middle set of answers shows Moderate, 4 out of 8, with each answer | PASS |
| Illustrative plan for that student draft shows ₹2,250 toward the buffer and ₹250 optional exploration | PASS |
| Refresh on `/starter?persona=student` after review stays on Review | PASS |
| Refresh on `/starter` after a custom draft stays on Review | PASS |
| Start over clears the fields and leaves only an empty prototype record in localStorage | PASS |
| Income of −5 is rejected with a neutral inline message | PASS |
| Age 22, income ₹0, expenses ₹4,000, savings ₹0 reaches review with surplus ₹0 and says no amount is available to invest | PASS |
| Progress page shows Understand as saved and Plan as ready after that review | PASS |
| `/simulate` states that a scenario is arithmetic and not a forecast | PASS |
| At a 390px-wide viewport the review page does not scroll sideways | PASS |

## Phase 4 simulator and firewall

Checked in the browser on 6 October 2026.

| Check | Result |
| --- | --- |
| Student draft, surplus ₹2,500, opens `/simulate` with a blank amount and a slider that stops at ₹2,500 | PASS |
| ₹5,000 shows the above-surplus sentence and still illustrates −10% ₹4,500, −20% ₹4,000, −30% ₹3,500 | PASS |
| Single Stock Demo at 100%, low comfort, horizon under 1 year, and thin coverage raises all five pauses and does not block the page | PASS |
| Adjust my choice moves focus to the share control | PASS |
| Continue with this simulation moves focus to the acknowledgement | PASS |
| An opposite comfort answer shows that it differs from the earlier comfort answer | PASS |
| Save this simulated decision keeps the option, ₹5,000, 100% share, and 5 pauses after reload | PASS |
| After Start over, income ₹0 and expenses ₹4,000 open `/simulate` with a blank amount, no amount slider, and no suggested amount | PASS |
| At 390px that zero-surplus simulator page does not scroll sideways | PASS |
| `/plan` for that zero-surplus draft still shows ₹0 lines and the cash-flow explanation | PASS |

## Phase 3 plan page

Checked in the browser on 6 October 2026 after the starter-plan page was built.

| Check | Result |
| --- | --- |
| Student with a laptop goal under 1 year and low comfort shows Weak, buffer-first, Safety / buffer ₹2,250, Goal reserve ₹250, Investment exploration ₹0 | PASS |
| Opening the scenario button with no option selected stays on `/plan` and asks for an option | PASS |
| Stability Bucket plus confidence 2 remains selected after a reload of `/plan` | PASS |
| That choice opens `/simulate` | PASS |
| Intern demo shows Developing and a mix: buffer ₹4,800, exploration ₹3,200, goal reserve ₹0 when no goal is saved | PASS |
| First-job demo shows Developing and a mix: buffer ₹9,000, exploration ₹6,000 | PASS |
| Higher-income demo shows Comparatively healthy, buffer ₹7,500, exploration ₹22,500 | PASS |
| Income ₹0 with expenses ₹30,000 shows surplus lines at ₹0, a cash-flow explanation, and the educational options | PASS |
| At 390px the plan page does not scroll sideways | PASS |

Representative rule outputs checked by the passing unit tests, and matched in the browser for the student and zero-surplus cases:

- Persona A: surplus ₹2,500, target ₹16,500, coverage under 1 month, buffer ₹2,250, exploration ₹250
- Persona B: surplus ₹8,000, target ₹36,000, coverage 1.25 months, buffer ₹4,800, exploration ₹3,200
- Persona C: surplus ₹15,000, target ₹60,000, coverage 2 months, buffer ₹9,000, exploration ₹6,000
- Persona D: surplus ₹30,000, target ₹90,000, coverage about 3.33 months, buffer ₹7,500, exploration ₹22,500
- ₹5,000 at −20% is ₹4,000, marked as not a forecast

Not claimed at the time of the Phase 3 pass: a Playwright end-to-end run. The interactive scenario screen was added in Phase 4.

## Phase 5 progress

Checked in the browser on 6 October 2026.

| Check | Result |
| --- | --- |
| A completed saved journey with no firewall signals marks all six steps done and says “No major mismatch detected from the information entered.” The page does not call that outcome safe | PASS |
| Six stored signal ids, including one duplicate, appear as five unique pause lines, once each | PASS |
| Moving confidence from 2/5 to 4/5 shows the new score and does not add praise or a suggestion to invest | PASS |
| Moving confidence from 2/5 to 1/5 shows “Understanding more risk can sometimes reduce confidence. That can still be useful.” | PASS |
| That 1/5 score and the drop sentence are still there after a reload | PASS |
| A partial draft marks only Financial snapshot done and leaves the other five steps as Not yet | PASS |
| Opening `/progress` after Start over, including after a reload, marks nothing done and says nothing has been saved yet | PASS |
| Adjust my plan opens `/plan` | PASS |
| Try another scenario opens `/simulate` | PASS |
| Start over removes only `groww-starter-prototype-v1` and `groww-starter-prototype-events-v1` | PASS |
| The demo event log stays in this browser. No resource request left localhost | PASS |
| At 390px the empty progress page does not scroll sideways, and the confidence scale and next-step controls stay inside the viewport | PASS |

Phase 5 did not include a Playwright run. The Phase 6 checklist below records the Playwright result.

## Checklist

Checked on 6 October 2026. Playwright covered the desktop Chromium run. The mobile row uses a 390px viewport. Accessibility here means the core keyboard path and the skip link, not a full audit.

| Check | Result |
| --- | --- |
| Desktop | PASS |
| Mobile, 390px, no sideways scroll, critical controls inside the width | PASS |
| Refresh keeps the entered draft | PASS |
| Back navigation keeps the entered income | PASS |
| Invalid numbers: −5 stays on the step | PASS |
| Zero income shows surplus ₹0 and does not suggest an amount | PASS |
| Very large values: income ₹10,00,001 is rejected | PASS |
| FOMO triggers for horizon, comfort, non-diversification, concentration, and a thin buffer | PASS |
| Scenario calculation: ₹5,000 at −20% shows ₹4,000 | PASS |
| Accessibility basics: skip link focuses the main content, and the core journey works from the keyboard | PASS |
| Start over clears this prototype’s answers and leaves an unrelated localStorage key | PASS |
| No-login access to `/`, `/plan`, `/simulate`, and `/progress` | PASS |

## Phase 7 polish check

Checked in the browser on 6 October 2026. Amounts were unchanged.

| Check | Result |
| --- | --- |
| Student plan still shows buffer first, Safety / buffer ₹2,250, and the label Weak with the coverage explanation | PASS |
| Intern plan still shows a mix, buffer ₹4,800, and the label Developing | PASS |
| Higher-income plan still shows buffer ₹7,500, exploration ₹22,500, and Comparatively healthy with the sentence that this is not a statement the buffer is enough | PASS |
| At 390px the plan page does not scroll sideways | PASS |
| The scenario disclaimer appears once, beside the rupee scenarios | PASS |
