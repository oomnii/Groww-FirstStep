# Deployment checklist

Public name: Groww FirstStep. Tagline: From first paycheck to first confident investment.

This prototype has no database, no accounts, and no secrets. Vercel’s Next.js preset is enough. No environment variables are required.

## Commands

Record a box only after that command finishes in this workspace.

- [x] `npm test` passes
- [x] `npm run lint` passes
- [x] `npm run test:e2e` passes
- [x] `npm run build` passes
- [x] `npm start` serves `/`, `/starter`, `/plan`, `/simulate`, and `/progress`

## Release checks

- [x] No `.env`, `.env.local`, token, or key file is in the project
- [x] `.gitignore` ignores `.env*`
- [x] The running app does not read environment variables
- [x] No authentication
- [x] Demo personas and investment categories are labeled fictional or synthetic
- [x] README states this is not an official Groww product
- [x] Landing page offers **Build my starter plan** and **Try a demo persona** without extra instructions
- [x] Footer disclaimer is on every page
- [x] No localhost link in the product UI
- [x] App icon is `src/app/icon.svg`. The default Create Next App images were removed
- [x] Direct visits to `/plan`, `/simulate`, and `/progress` with nothing saved ask for a starting point or show every step as not done
- [x] Browser storage keys are `groww-starter-prototype-v1` and `groww-starter-prototype-events-v1`

## Not done

- GitHub push
- Vercel deployment
- A custom domain
