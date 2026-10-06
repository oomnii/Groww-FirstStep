# Prompts used

The prompt below is copied exactly as received. It applies to Phase 0 — Project foundation and product constitution, Phase 1 — Domain model, synthetic data and decision engine, and Phase 2 — Landing, onboarding and financial snapshot.

---

# GLOBAL PRODUCT CONTRACT — APPLY TO EVERY PHASE

We are building a Product Intern case-study prototype called:

**Groww Starter Mode — From first paycheck to first confident investment**

This is a student/product case-study prototype, not an official production Groww application. It should feel polished and trustworthy, but never imply that it is an official released Groww feature.

## Problem we are solving

Target users are GenZ users approximately 20–26 years old who may be students, interns, part-time earners or employees receiving their first few paychecks and making their first investment decisions.

The main problem is not simply lack of access to investment products. The product hypothesis is that first-time investors lack decision confidence:

- How much can I responsibly invest?
- Should I build an emergency buffer first?
- What does investment risk mean in actual rupees?
- Am I choosing something because of FOMO?
- How does my goal and time horizon affect the level of risk I should take?

The application should guide users from their financial starting point to an informed simulated decision.

## Product architecture

The product has four connected capabilities:

1. First Paycheck OS
2. Starter Plan
3. Risk Reality Simulator
4. FOMO Firewall

These are not separate products. They are stages in one coherent journey:

**Understand → Plan → Simulate → Protect → Decide → Progress**

## Technology constraints

Use ONLY technologies aligned with the existing resume:

- Next.js
- React
- TypeScript
- JavaScript where required
- Node.js / Next.js API routes if required
- REST-style interfaces if required
- HTML/CSS
- Playwright for end-to-end testing

Do NOT introduce:

- Tailwind
- Bootstrap
- Material UI
- Chakra
- shadcn
- Firebase
- Supabase
- Prisma
- MongoDB
- external databases
- Python
- external charting libraries
- Redux unless absolutely necessary
- authentication systems

Prefer native React state, Context only if genuinely needed, localStorage for persistence, custom CSS and simple SVG/CSS visualizations.

## Visual system

Primary colors:

- #08F6B6
- #5367F5

Supporting palette only:

- #F9F8F0
- #EFE9E3
- #D9CFC7
- #C9B59C
- #355872
- #7AAACE
- #9CD5FF
- #F7F8F0

Do not add random new theme colors. Alpha/opacity variants of these colors are allowed.

Design characteristics:

- mobile-first
- clean
- calm
- trustworthy
- modern
- GenZ-friendly without becoming childish
- minimal financial jargon
- strong spacing
- obvious hierarchy
- accessible contrast
- keyboard accessible controls
- responsive on mobile, tablet and desktop

Avoid excessive animation, gradients everywhere, confetti, streaks, trading gamification or attention-seeking UI.

## Financial/product safety principles

This is an educational prototype.

Do not provide real buy/sell calls.

Do not promise returns.

Do not use language such as:

- guaranteed return
- safest investment
- best stock
- you should definitely buy
- this will make you money

Prefer:

- illustrative
- explore
- scenario
- may
- based on the information you entered
- educational example
- not a forecast
- not investment advice

The application must clearly display an appropriate educational disclaimer.

## Data

Use only synthetic/mock data.

Never imply access to real Groww customer data.

Use fictional educational investment categories/options rather than claiming to recommend real securities.

Suggested fictional options:

- Stability Bucket — lower volatility, diversified
- Balanced Basket — medium volatility, diversified
- Growth Basket — higher volatility, diversified
- Single Stock Demo — higher volatility, non-diversified

All data and scenarios must be explicitly described as illustrative.

## Submission hygiene

Create a `/submission` directory.

Important: The case-study instructions require that the final 300–700 word one-page thought-process document is not AI-created.

Therefore:

DO NOT write that final page.

You may maintain factual notes, assumptions and technical documentation, but never generate a polished 300–700 word submission essay.

For every phase prompt I give you:

1. execute the requested work;
2. append the exact prompt used for that phase into `/submission/prompts-used.md`;
3. label it with the phase name;
4. never silently rewrite the prompt.

Also maintain:

- `/submission/assumptions.md`
- `/submission/evals-used.md`
- `/submission/manual-testing.md`
- `/submission/deployment-checklist.md`

Do not fabricate test results. Only mark a test PASS after it has actually been executed successfully.

---

# PHASE 0 — PROJECT FOUNDATION AND PRODUCT CONSTITUTION

Start by auditing the current repository.

If there is no Next.js application, initialize a clean Next.js project using TypeScript and the App Router.

Do not enable Tailwind.

Use a structure broadly like:

src/
  app/
  components/
  data/
  lib/
  types/

public/

tests/

submission/

You may adjust this structure if Next.js conventions require it, but keep responsibilities clear.

Create the global visual tokens using CSS custom properties.

Use the defined color palette only.

Set up:

- global typography
- spacing scale
- border radius
- shadows used sparingly
- button styles
- input styles
- cards
- focus states
- responsive breakpoints

Use system fonts or fonts already available through standard web-safe mechanisms. Do not introduce a design-system package.

Create a minimal top navigation:

Groww Starter
Prototype label

Create a global footer/disclaimer making clear:

“This is an educational product case-study prototype using synthetic data. It does not provide investment advice or execute real transactions.”

Create these documentation files:

- submission/prompts-used.md
- submission/assumptions.md
- submission/evals-used.md
- submission/manual-testing.md
- submission/deployment-checklist.md

Populate assumptions.md with clearly labelled working assumptions, including:

- target users are approximately 20–26;
- users are first-time or early-stage investors;
- synthetic data is sufficient for prototype validation;
- emergency buffer target is represented illustratively;
- investment categories are educational abstractions;
- there is no real trading or brokerage execution;
- scenarios are not forecasts.

Do not write the final one-page case-study answer.

Create a short README explaining:

- product name
- problem
- stack
- local development command
- build command
- testing command
- educational-prototype disclaimer

At the end:

- run lint if configured;
- run production build;
- fix all errors;
- report what was created;
- do not start Phase 1 automatically.

---

# PHASE 1 — DOMAIN MODEL, SYNTHETIC DATA AND DECISION ENGINE

Build the product logic before building the full UI.

Create strict TypeScript types/interfaces for:

UserPersona
FinancialSnapshot
Goal
RiskQuestion
RiskProfile
InvestmentOption
StarterPlan
RiskScenario
FirewallSignal
ProgressState

## Synthetic personas

Create at least four built-in demo personas:

### Persona A — Student
Age: 21
Monthly income: ₹8,000
Essential monthly expenses: ₹5,500
Current liquid savings: ₹3,000
Investment experience: none

### Persona B — Intern
Age: 22
Monthly income: ₹20,000
Essential monthly expenses: ₹12,000
Current liquid savings: ₹15,000
Investment experience: beginner

### Persona C — First-job employee
Age: 23
Monthly income: ₹35,000
Essential monthly expenses: ₹20,000
Current liquid savings: ₹40,000
Investment experience: beginner

### Persona D — Higher-income beginner
Age: 25
Monthly income: ₹60,000
Essential monthly expenses: ₹30,000
Current liquid savings: ₹1,00,000
Investment experience: beginner

Users must also be able to enter custom values.

## Financial calculations

Create pure reusable functions.

At minimum calculate:

monthlySurplus =
max(monthlyIncome - essentialExpenses, 0)

illustrativeEmergencyTarget =
essentialExpenses × 3

emergencyCoverageMonths =
liquidSavings / essentialExpenses

Handle zero expenses safely.

The application should never suggest that the three-month buffer is universally correct. UI language must call it an illustrative assumption used by this prototype.

## Starter Plan logic

Create deterministic plan rules.

The plan is an educational illustration, not financial advice.

Suggested structure:

### If monthly surplus <= 0
- do not show an investable amount as available;
- focus on improving monthly buffer;
- explain why.

### If emergency coverage < 1 month
- safety/buffer is the dominant priority;
- investment exploration should be small or optional;
- explain that resilience may matter before taking significant market risk.

### If emergency coverage is between 1 and 3 months
- show a mixed illustrative plan;
- part toward buffer;
- part toward goal/investment exploration.

### If emergency coverage >= 3 months
- allow a larger proportion of the monthly surplus to be explored for investment goals.

Do not present allocations as professional recommendations.

Use wording such as:

“An illustrative way to think about your monthly surplus…”

## Goals

Support:

- Emergency buffer
- Laptop / major purchase
- Travel
- Higher studies
- Long-term wealth

Fields:

goal type
target amount
target horizon

Time horizon groups:

- under 1 year
- 1–3 years
- 3–5 years
- 5+ years

## Risk assessment

Create 3–5 simple questions.

Examples:

If your investment temporarily fell 20%, would you:
- need the money immediately;
- feel uncomfortable but wait;
- continue with the plan.

When might you need this money?

How familiar are you with market fluctuations?

Calculate a transparent risk score.

Map it to:

Low
Moderate
High

The UI must later be able to explain why the score was generated.

## Fictional educational options

Create:

### Stability Bucket
Risk: Low
Diversified: Yes
Purpose: educational lower-volatility example

### Balanced Basket
Risk: Moderate
Diversified: Yes

### Growth Basket
Risk: High
Diversified: Yes

### Single Stock Demo
Risk: High
Diversified: No

Do not attach real expected-return claims.

## FOMO Firewall logic

Create deterministic firewall rules.

At minimum flag when:

1. user allocates more than 60% of their chosen investment amount to one option;
2. a non-diversified option receives more than 35%;
3. user has a Low risk profile but selects a High risk option;
4. goal horizon is under one year and user selects a High risk option;
5. emergency coverage is below one month while a large share is directed toward a High risk option.

Return structured signals:

id
severity
title
reason
plain-language explanation
possible adjustment

Severity:

info
caution
strong

The firewall must NEVER prevent the user from continuing.

It should create a deliberate pause, explain the mismatch and allow:

“Adjust my choice”
or
“Continue with this simulation”

## Risk Simulator

Create pure calculation functions for scenarios:

-10%
-20%
-30%

Example:

₹5,000 at -20% → ₹4,000

Clearly distinguish a mathematical scenario from a forecast.

Include unit tests only if achievable using tooling already compatible with Node/Next.js without adding an unnecessary framework. Otherwise the main automated validation will be Playwright later.

At the end:

- validate TypeScript;
- run build;
- manually inspect rule outputs with representative data;
- document the assumptions;
- do not begin UI implementation beyond what is needed to verify logic.

---

# PHASE 2 — LANDING, ONBOARDING AND FINANCIAL SNAPSHOT

Now build the first half of the real user experience.

## Route structure

Use sensible Next.js routes such as:

/
 /starter
 /plan
 /simulate
 /progress

Exact route names can change if there is a cleaner architecture.

## Landing page

Build a strong product landing screen inside the prototype.

Must communicate:

**Groww Starter Mode**
“From first paycheck to first confident investment.”

Short explanation:

“Understand what you can invest, see risk in real rupees, and pressure-test your decision before you act.”

Primary CTA:

“Build my starter plan”

Secondary CTA:

“Try a demo persona”

Show the four synthetic personas in a compact, optional demo area.

Do not overload landing page with feature marketing.

## Starter wizard

Use a calm multi-step wizard.

Suggested progress:

1. Your starting point
2. Your goal
3. Your comfort with risk
4. Review

### Financial snapshot fields

Age
Monthly income
Essential monthly expenses
Current liquid savings

Validate:

- no negative values
- sensible maximums
- expenses may exceed income
- zero income allowed
- zero savings allowed

Show rupee formatting properly.

Do not shame the user for low savings or negative surplus.

Use neutral language.

### Goal step

Let user choose a goal.

Capture:

target amount
time horizon

Use simple cards.

### Risk step

Use the risk questions from Phase 1.

After answering, show:

“Your current comfort level: Low / Moderate / High”

Add:

“Why am I seeing this?”

Clicking this should display the transparent scoring explanation.

### Review step

Show:

income
expenses
monthly surplus
current savings
illustrative emergency target
emergency coverage
goal
time horizon
risk level

Add explicit disclaimer that this is based only on information entered in the prototype.

## State persistence

Persist user state in localStorage.

Refresh should not lose the journey.

Provide:

“Start over”

Clear only prototype data.

Do not require authentication.

## UX requirements

- mobile-first
- visible progress
- proper labels
- keyboard navigation
- Enter/Space controls where appropriate
- inline validation
- helpful empty states
- no toast spam
- no finance jargon without explanation

At the end:

- run build;
- navigate through all personas;
- test custom inputs including zero income and expenses > income;
- fix UI breakage;
- do not proceed automatically.

---

# Scope correction — deterministic product, no AI/ML

The prompt below is copied exactly as received.

Do not redesign or refactor the existing Phase 0–1 implementation unnecessarily.

From this point onward, remove AI/ML from the product scope completely.

The final product must contain only these three capabilities:

1. First Paycheck Investing OS
2. Risk Reality Simulator
3. FOMO Firewall

Rules:

- Do NOT add OpenAI, LLMs, chatbots, AI explainers, ML models, recommendation models, embeddings or any AI API.
- Keep all product decisions deterministic and rule-based.
- Keep all explanations as predefined/product copy generated from deterministic rules.
- Keep all existing Phase 0–1 code that is unrelated to AI/ML.
- If any AI/OpenAI placeholder, comment, config, dependency or documentation was already added in Phase 0–1, remove it cleanly only if safe to do so.
- Do not change working architecture, types, logic, styling or folder structure unnecessarily.
- Do not add any new dependency for this change.
- Update README/submission documentation so the product is clearly described as a deterministic, rule-based prototype.
- Continue future phases using the original build plan, but ignore every previous instruction that suggested optional AI/ML functionality.

Final architecture must remain:

User inputs → deterministic rules → Starter Plan → Risk Reality Simulator → FOMO Firewall → simulated decision → progress

After making only the necessary cleanup:
- run the existing build/type checks;
- confirm nothing broke;
- report exactly what AI/ML-related items, if any, were removed.

---

# Phases 3–8, with a stop after each phase

The prompt below is copied exactly as received. Only Phase 3 was carried out after this prompt. Later phases were not started.

# PHASE 3 — STARTER PLAN AND EXPLAINABILITY

Build `/plan`.

The objective is to transform the user's inputs into a simple educational decision framework.

The user should understand:

- where they currently stand;
- what their monthly surplus is;
- whether their emergency buffer is weak, developing or comparatively healthy under our prototype assumption;
- how their goal and time horizon affect the decision;
- what they should explore next.

Do not frame anything as personalized regulated financial advice.

## Page hierarchy

### Section 1 — Your starting point

Show:

Monthly income
Essential expenses
Monthly surplus
Emergency coverage

Use simple visual bars/cards.

Avoid complex charts.

### Section 2 — Your Starter Plan

Use the deterministic rules from Phase 1.

Display an illustrative monthly split.

Possible categories:

Safety / buffer
Goal reserve
Investment exploration

The exact split must come from the deterministic engine.

Under the result include:

“Why this plan looks like this”

Explain in plain language:

- emergency coverage effect;
- time horizon effect;
- risk comfort effect.

### Section 3 — What could change this plan?

Show educational factors:

income changes
expenses change
goal date changes
savings increase/decrease
risk comfort changes

### Section 4 — Explore educational options

Show the four fictional options:

Stability Bucket
Balanced Basket
Growth Basket
Single Stock Demo

Each card shows only:

risk level
diversification
what type of situation it illustrates
what could go wrong

Do not show fake historical returns.

Do not use stars or “best choice”.

Allow user to select an option for simulation.

CTA:

“See what risk feels like”

This takes the user to `/simulate`.

## Confidence baseline

Before leaving the plan page, ask:

“How confident do you currently feel about making your first investment decision?”

1–5 scale.

Persist it.

Do not manipulate the user toward a higher answer.

## Explainability components

Build reusable components for:

“Why am I seeing this?”
“What does this mean?”
“What could go wrong?”

These should be deterministic/static.

Do not call an LLM yet.

At the end:

- test all four personas;
- verify plan logic changes appropriately;
- verify the page remains useful when monthlySurplus = 0;
- run build;
- fix errors.

---

# PHASE 4 — RISK REALITY SIMULATOR + FOMO FIREWALL

This is the signature interactive part of the prototype.

Build `/simulate`.

## Simulator objective

Convert abstract investment risk into understandable rupee outcomes.

The user chooses:

- an educational option;
- an amount;
- an allocation percentage if relevant.

Display scenarios:

-10%
-20%
-30%

Example:

“If ₹5,000 temporarily fell 20%, the value would be ₹4,000.”

Always show:

“Illustrative mathematical scenario — not a market forecast.”

## Interaction

Use a range slider and numeric field for amount.

Amount must respect sensible limits based on the user's entered information.

If the user chooses an amount above monthly surplus, do not silently accept it.

Explain:

“This is above the monthly surplus calculated from the information you entered.”

Allow correction.

Create a simple custom visual using CSS or inline SVG.

Do not install a chart library.

Show:

Starting amount
Scenario change
Illustrative resulting amount
Rupee loss

Use proper formatting.

## Comfort check

Ask:

“If this happened temporarily, how would you feel?”

Options:

I would need to exit
I would be uncomfortable but wait
I could stay with my plan

This does not need to rewrite the user's original risk profile automatically.

If it conflicts strongly with their earlier risk answers, surface:

“Your response here differs from your earlier risk comfort.”

This is an insight, not an accusation.

## FOMO Firewall

Whenever relevant, evaluate all firewall rules.

If no signal:

Show a small calm status:

“No major mismatch detected from the information entered.”

Do not say “safe”.

If triggered, display a clear panel.

Example:

“Pause before you continue”

Reason:

“You selected a high-volatility, non-diversified option for most of your available amount.”

Then show:

Why this was flagged
What could go wrong
One lower-concentration comparison
The user's original goal/risk context

Actions:

“Adjust my choice”
“Continue with this simulation”

Never lock the user out.

Never use fear-heavy red warning design.

Use the existing palette and hierarchy.

## Decision acknowledgement

Before continuing, require a lightweight acknowledgement:

“I understand this is an illustrative scenario and not a return forecast.”

Then:

“Save this simulated decision”

No real transaction language.

Do not use:

Buy
Place order
Execute
Confirm investment

unless clearly prefixed with “simulated”.

Persist decision information.

At the end:

- test every firewall rule individually;
- test combinations of multiple rules;
- verify Continue Anyway works;
- verify Adjust returns user to the relevant control;
- run build.

---

# PHASE 5 — PROGRESS, LEARNING AND COMPLETION EXPERIENCE

Build `/progress`.

This page should make the prototype feel like a complete product journey.

Do NOT turn it into a gamified trading dashboard.

## Journey progress

Show completion of:

Financial snapshot
Goal defined
Risk profile understood
Starter Plan reviewed
Risk scenario simulated
Decision pressure-tested

Use calm progress indicators.

## Before/after confidence

Recall the user's earlier confidence score.

Ask again:

“How confident do you now feel about understanding your first investment decision?”

1–5 scale.

Show both values neutrally.

Example:

Before: 2/5
Now: 4/5

Do not celebrate a higher value as proof that the user should invest.

If confidence falls, treat that as a valid outcome:

“Understanding more risk can sometimes reduce confidence. That can still be useful.”

This is important.

## Decision summary

Display:

Goal
Time horizon
Risk comfort
Monthly surplus
Selected educational option
Simulated amount
Scenario explored
Firewall signals encountered
Final user choice

Add:

“What you learned”

Summarize using deterministic text.

No LLM required.

## Next steps

Offer:

“Adjust my plan”
“Try another scenario”
“Start over”

No real trading CTA.

## Tiny learning cards

Include only 3 concise educational concepts:

Diversification
Time horizon
Emergency buffer

Each should have:

one-sentence definition
“Why it mattered in your plan”

No long finance course.

## Event logging

Create lightweight local prototype analytics stored only in localStorage.

Track events such as:

starter_started
snapshot_completed
goal_completed
risk_completed
plan_viewed
simulation_started
firewall_triggered
simulation_saved
journey_completed

This is only for demonstrating product measurement thinking.

Create a small developer/demo-only panel accessible through a clearly labelled toggle or URL query to inspect these local events.

Do not send data anywhere.

At the end:

- test full end-to-end user journey;
- verify browser refresh persistence;
- verify Start Over works;
- run build.

---

# PHASE 6 — PLAYWRIGHT EVALS AND PRODUCT VALIDATION

Now create rigorous evaluation coverage.

Use Playwright, which is allowed for this project.

Do not change the product to make tests easier unless there is an actual bug.

## Required automated scenarios

Create tests for at least these cases:

### Eval 1 — Student with low buffer
₹5k–₹8k style income
low savings
Expected:
buffer-first messaging
no aggressive default suggestion

### Eval 2 — Zero income
Expected:
no crash
zero monthly surplus
clear explanation

### Eval 3 — Expenses exceed income
Expected:
monthly surplus = 0
neutral tone
no investment pressure

### Eval 4 — Intern with modest surplus
Expected:
mixed illustrative plan

### Eval 5 — First-job employee with healthier buffer
Expected:
different plan from low-buffer user

### Eval 6 — Short-term goal + high-risk option
Expected:
FOMO/Risk mismatch signal

### Eval 7 — Low-risk profile + Growth Basket
Expected:
risk mismatch signal

### Eval 8 — Single Stock Demo concentration
Allocate >35%
Expected:
non-diversification firewall signal

### Eval 9 — Extreme single-option concentration
>60%
Expected:
concentration signal

### Eval 10 — No emergency buffer + high-risk allocation
Expected:
strong contextual signal

### Eval 11 — Risk simulator math
₹5,000
-20%
Expected result:
₹4,000

### Eval 12 — Refresh persistence
Expected:
entered user state remains after reload

### Eval 13 — Start Over
Expected:
local user state clears correctly

### Eval 14 — Continue despite firewall
Expected:
user is allowed to continue after acknowledgement

### Eval 15 — Keyboard journey
Core flow should work without mouse-only controls.

### Eval 16 — Mobile viewport
No clipped critical controls.

## Safety/content evals

Verify the rendered product never displays:

“guaranteed return”
“best stock”
“safe investment”
“you will earn”
or equivalent misleading claims.

Search rendered content and source where practical.

## Evals documentation

Update:

`submission/evals-used.md`

For every eval document:

ID
user scenario
input
expected behaviour
why this matters
test mechanism
actual outcome
PASS/FAIL

Only write actual outcome after execution.

Include the Playwright test path.

## Manual testing document

Create:

`submission/manual-testing.md`

Include a concise checklist covering:

Desktop
Mobile
Refresh
Back navigation
Invalid numbers
Zero values
Very large values
FOMO triggers
Scenario calculations
Accessibility basics
Start Over
No-login access

## Execute

Run:

lint
Playwright
production build

Fix real defects.

Re-run until clean.

Do not claim perfect accessibility or financial correctness unless actually tested.

Stop after reporting test results.

---

# PHASE 7 — STRICT PRODUCT POLISH

Do a final product-quality audit.

Do not add new major features.

The goal is refinement, not scope expansion.

Audit every page for:

- hierarchy
- spacing
- typography
- consistency
- mobile responsiveness
- empty states
- loading states if any
- validation copy
- confusing jargon
- duplicate content
- excessive text
- accessibility labels
- keyboard focus
- button wording
- rupee formatting
- disclaimer visibility

## Product-copy audit

Replace technical/system language with beginner-friendly wording.

Examples:

Bad:
“Risk score: 3”

Better:
“Your answers suggest lower comfort with short-term market swings.”

Bad:
“Allocation conflict detected”

Better:
“This choice does not fully match the risk comfort you selected earlier.”

Keep copy concise.

## GenZ design audit

Do not equate GenZ with childish UI.

No unnecessary emoji.
No streaks.
No fake social proof.
No aggressive push notifications.
No trading rewards.
No dopamine mechanics.

The experience should feel:

simple
visual
transparent
calm
fast

## Brand/color audit

Verify only the approved palette is intentionally used.

Primary:

#08F6B6
#5367F5

Support:

#F9F8F0
#EFE9E3
#D9CFC7
#C9B59C
#355872
#7AAACE
#9CD5FF
#F7F8F0

Opacity variants allowed.

## Performance

Avoid huge assets.

Avoid unnecessary JavaScript.

Avoid dependency bloat.

Run production build.

Fix warnings that indicate actual problems.

Do not refactor stable code without a reason.

---

# PHASE 8 — SUBMISSION AND DEPLOYMENT READINESS

Prepare the repository for GitHub + Vercel deployment.

Do not actually expose secrets.

## README finalization

README should contain:

Product name
Problem hypothesis
Core flow
Main features
Tech stack
Synthetic data statement
Local development
Production build
Playwright tests
Deployment instructions
Prototype disclaimer

Keep it concise.

## Submission folder

Finalize:

submission/prompts-used.md
submission/assumptions.md
submission/evals-used.md
submission/manual-testing.md
submission/deployment-checklist.md

Do NOT generate the final 300–700 word thought-process page.

Instead create:

`submission/facts-for-my-writeup.md`

This file may contain ONLY factual bullet-point reminders such as:

user targeted
hypothesis tested
scope
out-of-scope
feature names
assumptions
metrics considered
eval coverage

Do not turn these bullets into submission prose.

The candidate will personally write the final page.

## Deployment checklist

Verify:

- `npm run build` passes
- Playwright tests pass
- no secret keys committed
- no `.env.local` committed
- no authentication requirement
- app works with synthetic data
- app does not depend on an external API
- no localhost links in production UI
- no broken images
- no missing routes
- mobile works
- evaluator can start from landing page without instructions
- educational disclaimer visible
- README accurate

Create appropriate `.gitignore`.

## Vercel readiness

Ensure the project can be deployed directly from GitHub to Vercel without extra infrastructure.

If no environment variables are required, document that clearly.

Do not add an API key just to make the project appear more technical.

## Final report

At the end give me:

1. current directory tree;
2. exact stack used;
3. build result;
4. Playwright result;
5. number of evals passing/failing;
6. any remaining known issue;
7. files I need to manually review;
8. exact commands for GitHub push;
9. exact steps for Vercel deployment.

Do not claim that deployment has occurred unless it actually has.

-> hr phase ke baad ruko , summary do phle wle phase ki then aange wle phase procced krenge .

---

# Follow-up before Phase 5

The prompt below is copied exactly as received.

proceed 
Before implementing Phase 5, preserve all working Phase 0–4 behavior, tests, persistence, decision rules, simulator math, and FOMO Firewall logic.

Do not redesign or duplicate previous pages.

Build only the missing completion/progress experience.

Additional requirements:

- Treat lower post-journey confidence as a valid outcome; never imply that higher confidence means the user should invest.
- If no firewall signal was triggered, show that neutrally and never describe the decision as “safe”.
- If multiple firewall signals were triggered, summarize them clearly without creating repetitive interruptions.
- `/progress` must handle missing or partial saved state gracefully, including a user opening the route directly.
- Never fabricate a completed step if the user has not actually completed it.
- “Start over” must clear only this prototype’s stored data.
- Local analytics/events must remain localStorage-only and must never be transmitted.
- Do not introduce AI/ML, external APIs, databases, chart libraries, gamification, or unnecessary dependencies.
- Preserve the approved color system and educational/non-advisory language.

After implementation, test:
1. a completed journey with no firewall signals;
2. a completed journey with multiple firewall signals;
3. confidence increasing;
4. confidence decreasing;
5. direct `/progress` visit with no saved journey;
6. Adjust plan / Try another scenario / Start over;
7. refresh persistence;
8. mobile layout.

Then run all existing tests, lint, and production build. Add coverage without replacing existing tests.

---

# Follow-up to start Phase 6

proceed

---

# Follow-up to start Phase 7

Phase 6 is complete and all current automated validation is green.

Treat the current product behavior as frozen unless you find a genuine defect.

Do NOT add new product features, new flows, AI/ML, external APIs, databases, chart libraries, packages, or speculative functionality.

Phase 7 is only for strict product polish.

Preserve:
- all current decision rules;
- all Starter Plan outputs;
- all simulator calculations;
- all five FOMO Firewall rules;
- persistence behavior;
- existing accessibility fixes;
- all passing tests.

Audit the product as if it were being reviewed by a Product Manager and a first-time investor.

Pay particular attention to:

1. whether any screen feels too dense or explanation-heavy;
2. whether financial copy accidentally sounds like advice;
3. whether the user always understands why a result was shown;
4. whether “Weak / Developing / Comparatively healthy” is visually and verbally

-> then proceed phase 7

---

# Follow-up to start Phase 8

Phase 7 is complete and all current validation is green.

Treat the product behavior and UI as frozen unless you find a genuine deployment or submission blocker.

Do NOT add new features, redesign screens, change product logic, change financial rules, add AI/ML, add APIs, add databases, or introduce new dependencies.

Phase 8 is only for:
- repository cleanup;
- submission documentation;
- GitHub readiness;
- Vercel deployment readiness;
- final verification.

Preserve all current:
- decision-engine behavior;
- Starter Plan amounts;
- scenario math;
- FOMO Firewall rules;
- persistence;
- accessibility fixes;
- visual polish;
- passing tests.

Additional final checks:

1. Ensure no API key, token, secret, personal credential, localhost-only assumption, or machine-specific path is committed.
2. Ensure `.gitignore` covers `.env*` appropriately while allowing safe example files if needed.
3. Ensure the production app requires no environment variables.
4. Ensure there is no AI/ML/OpenAI wording left anywhere in the active product or submission docs.
5. Ensure all demo data is clearly synthetic.
6. Ensure the README does not claim this is an official Groww product.
7. Ensure the evaluator can understand how to start the journey immediately after opening the deployed URL.
8. Ensure all internal navigation works after a production build.
9. Ensure direct navigation to `/starter`, `/plan`, `/simulate`, and `/progress` fails gracefully when state is missing.
10. Ensure no test result is documented as PASS unless it actually passed.

Do not generate the final 300–700 word case-study submission page.

`submission/facts-for-my-writeup.md` may contain factual bullet points only.

At the end, run fail-fast validation:

npm test &&
npm run lint &&
npm run test:e2e &&
npm run build

Then report:
- exact final directory tree;
- dependencies;
- test results;
- any remaining known issue;
- exact files for manual review;
- GitHub commands;
- Vercel deployment steps;
- whether any environment variable is required.

Do not claim GitHub push or Vercel deployment has happened unless it actually has.

-> then proceed phase 8
