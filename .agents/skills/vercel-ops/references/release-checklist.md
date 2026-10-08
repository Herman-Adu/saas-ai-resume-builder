# Production release checklist

Target: `saas-ai-resume-builder-seven.vercel.app` (update here when a custom domain is added). Each step is reported as passed / failed / blocked.

## Before (no gate)

1. `main` is green in CI and the ledger is up to date.
2. `npm run build` passes locally from a clean `origin/main` checkout.
3. `vercel env ls production` lists every variable in `src/env.ts`. Compare with `rg -o "process\.env\.[A-Z_]+" -h src | sort -u`.
4. Pending Prisma migrations are applied to the production database (`npx prisma migrate status`, see `db-schema-change`). The build does not run them.
5. Stripe stays on **test** keys (demo build) until the owner chooses to switch; it is not part of any sprint.
6. The latest preview deployment of `main` passes `QA_BASE_URL=<preview> npm run test:smoke && npm run test:axe`.

## Gate

7. Ask the user to approve `vercel --prod` (or promoting the preview) with the exact target. Wait.

## After

8. Deploy, and record the deployment URL.
9. `QA_BASE_URL=https://saas-ai-resume-builder-seven.vercel.app npm run test:smoke && npm run test:seo && npm run test:axe`.
10. Check the Stripe webhook endpoint (`/api/stripe-webhook`) points at production and a test event returns 200 (`vercel logs`).
11. Rollback plan: `vercel rollback` (gated) if smoke fails in production.
