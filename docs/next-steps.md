# Next steps (sprint ledger)

Active plan: `v0_plans/realistic-map.md` (**approved**). Current sprint: S0 test harness.

Browser tests: `npm run test:smoke`, `test:seo`, `test:axe` (or `test:e2e` for all). They reuse the running dev server on port 3000. In the v0 sandbox Chromium needs system libraries once: `sudo dnf install -y nss nspr atk at-spi2-atk cups-libs libdrm libxkbcommon mesa-libgbm alsa-lib pango libXcomposite libXdamage libXrandr libXfixes`.

CI (`.github/workflows/ci.yml`): `checks` runs typecheck, lint and unit tests with no secrets. `app` builds and runs the browser tests, and skips with a notice until `BETTER_AUTH_SECRET`, `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are added as GitHub Actions secrets.

## Shipped

| Sprint | PR | Outcome |
|---|---|---|
| S0 | this PR | Test harness: Playwright smoke/seo/axe on `/` (desktop + mobile, light + dark), `permissions.ts` unit tests, CI `checks` + `app` jobs. Fixed 2 home-page colour-contrast failures axe found. |
| OS | #3 | Agent operating system: `AGENTS.md`, `.agents/skills/` (general skills copied, project ones adapted for Clerk / Prisma 7 / npm), Vitest + `qa/unit/meta/skills.test.ts`, `npm run check`. Fixed the existing Navbar lint error. |

## Next

| Sprint | Outcome | Gate |
|---|---|---|
| S0 | Test harness: Playwright smoke/seo/axe, `permissions.ts` unit tests, GitHub Actions `checks` + `app` jobs | Workflow file needs the v0 GitHub app's `workflows` permission; the CI ruleset on `main` is a repo setting |
| S1-S4 | Landing page, per the plan | Plan approval |

## Known state

- Stripe is in **test mode** (Pro £9.99/mo, Pro Plus £19.99/mo). The webhook targets `saas-ai-resume-builder-seven.vercel.app`.
- No custom domain yet.
- Lint warnings (not errors) remain: React Compiler skips the RHF `form.watch` editor forms.
