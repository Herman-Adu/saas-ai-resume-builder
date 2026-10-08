# Next steps (sprint ledger)

Active plan: `v0_plans/landing-page.md` (**awaiting approval**, nothing built yet).

## Shipped

| Sprint | PR | Outcome |
|---|---|---|
| OS | this PR | Agent operating system: `AGENTS.md`, `.agents/skills/` (general skills copied, project ones adapted for Clerk / Prisma 7 / npm), Vitest + `qa/unit/meta/skills.test.ts`, `npm run check`. Fixed the existing Navbar lint error. |

## Next

| Sprint | Outcome | Gate |
|---|---|---|
| S0 | Test harness: Playwright smoke/seo/axe, `permissions.ts` unit tests, GitHub Actions `checks` + `app` jobs | Workflow file needs the v0 GitHub app's `workflows` permission; the CI ruleset on `main` is a repo setting |
| S1-S4 | Landing page, per the plan | Plan approval |

## Known state

- Stripe is in **test mode** (Pro £9.99/mo, Pro Plus £19.99/mo). The webhook targets `saas-ai-resume-builder-seven.vercel.app`.
- No custom domain yet.
- Lint warnings (not errors) remain: React Compiler skips the RHF `form.watch` editor forms.
