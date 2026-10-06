# Groww FirstStep
Live Link : https://groww-first-step.vercel.app/

From first paycheck to first confident investment.

Educational case-study prototype for a first paycheck. This is not an official Groww product. It does not provide investment advice or execute transactions.

## Problem hypothesis

People around 20–26 who are receiving early paychecks can open an investing app and still not know what to do with the first surplus. The hypothesis is that a calm, rule-based walkthrough — surplus, cash buffer, a drop in rupees, and a pause when a choice does not fit — is more useful than another product list.

## Core flow

User inputs → fixed rules → Starter Plan → Risk Reality Simulator → FOMO Firewall → simulated decision → progress.

Open the site and choose **Build my starter plan**, or open **Try a demo persona**. No account is required. Demo amounts are fictional and can be edited.

## Main features

1. First Paycheck Investing OS — the starter wizard and the Starter Plan.
2. Risk Reality Simulator — arithmetic drops of −10%, −20%, and −30%.
3. FOMO Firewall — pause signals that explain a mismatch and do not block a simulated save.

## Tech stack

- Next.js 16.3.8 (App Router)
- React 19.2.8
- TypeScript 5
- CSS custom properties and system fonts
- Node.js built-in test runner for the decision engine
- Playwright for browser checks
- Browser `localStorage` only

No database, no account, no external data service, and no environment variables.

## Synthetic data

Personas, goals, and the four investment categories are fictional. Nothing on the site is a live quote, a customer record, or a real security.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. That address is only for local development.

## Production build

```bash
npm run build
npm start
```

## Tests

```bash
npm test
npm run lint
npm run test:e2e
```

`npm test` runs the decision-engine checks. `npm run test:e2e` runs Playwright in Chromium against the local dev server.

## Deployment

The app deploys as a normal Next.js project. No environment variables are required. See `submission/deployment-checklist.md`.

## Disclaimer

This is an educational product case-study prototype using synthetic data. It does not provide investment advice or execute real transactions.
