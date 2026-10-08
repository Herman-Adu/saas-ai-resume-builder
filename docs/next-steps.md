# Next steps (sprint ledger)

Active plan: `v0_plans/realistic-map.md` (**approved**). Current sprint: S0 test harness.

Browser tests: `npm run test:smoke`, `test:seo`, `test:axe` (or `test:e2e` for all). They reuse the running dev server on port 3000. In the v0 sandbox Chromium needs system libraries once: `sudo dnf install -y nss nspr atk at-spi2-atk cups-libs libdrm libxkbcommon mesa-libgbm alsa-lib pango libXcomposite libXdamage libXrandr libXfixes`.

CI (`.github/workflows/ci.yml`): `checks` runs typecheck, lint and unit tests with no secrets. `app` builds and runs the browser tests, and skips with a notice until `BETTER_AUTH_SECRET`, `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are added as GitHub Actions secrets.

## Shipped

| Sprint | PR | Outcome |
|---|---|---|
| S0 | this PR | Test harness: Playwright smoke/seo/axe on `/` (desktop + mobile, light + dark), `permissions.ts` unit tests, CI `checks` + `app` jobs. Fixed 2 home-page colour-contrast failures axe found. |
| OS | #3 | Agent operating system: `AGENTS.md`, `.agents/skills/` (general skills copied, project ones adapted for Clerk / Prisma 7 / npm), Vitest + `qa/unit/meta/skills.test.ts`, `npm run check`. Fixed the existing Navbar lint error. |
| S1 | #5, #6 | Better Auth server, `/api/auth` route and Better Auth tables (additive). Zod 4 and dev-dependency pins moved so `npm ci` works without `--legacy-peer-deps`. |
| S1b | #7 | Email and password sign-in/sign-up, `getAuthUserId()` session helper, all Clerk code, keys and skill removed. Stripe customer id now read from `UserSubscription`. |
| S3 | #9 | Orbit CV landing page and brand: orange-on-ink tokens, Bricolage Grotesque headings, `src/app/_landing/` sections (hero with a real resume sheet, how it works, features, pricing from `src/lib/plans.ts`, FAQ, final CTA, footer), new logo, icon and share image. Plan catalogue is unit tested; smoke, SEO and axe cover the page in light and dark. |
| S4 | #10 | Launch readiness: `sitemap.xml` and `robots.txt` built from `src/lib/seo.ts` (private areas blocked, sitemap linked), `SoftwareApplication` JSON-LD on the home page with offers taken from the plan catalogue and no invented ratings, `noindex` on sign-in and sign-up, and both crawler files added to the proxy's public allowlist. Unit tests cover the builders; the SEO crawl spec checks the live files, JSON-LD and page robots. |
| S5 | this PR | Tailwind CSS 4 migration so everything built from here on is theme-ready: `@tailwindcss/postcss` replaces the v3 plugin, tokens moved into CSS-first `@theme inline` in `globals.css`, `tailwind.config.ts` removed, `tailwindcss-animate` replaced by `tw-animate-css`, `tailwind-merge` 3, and v3 class names renamed to their v4 equivalents. A meta unit test guards the v4 setup and a theme smoke spec checks light and dark token resolution and that utilities generate real CSS. |
| S2 | merged | Dependency updates: Next.js 16.4.0, Stripe 23, lucide-react 1.x, eslint-config-prettier 10, prettier-plugin-tailwindcss 0.8, plus in-range updates. Stripe moved `current_period_end` onto subscription items, so the webhook now uses `getPeriodEnd()` (unit tested). Deferred majors: Tailwind 4, ESLint 10, TypeScript 7, Prisma, `@types/node` 26. |

## Next

| Sprint | Outcome | Gate |
|---|---|---|
| S0 | Test harness: Playwright smoke/seo/axe, `permissions.ts` unit tests, GitHub Actions `checks` + `app` jobs | Workflow file needs the v0 GitHub app's `workflows` permission; the CI ruleset on `main` is a repo setting |
| S1-S4 | Landing page, per the plan | Plan approval |

## Known state

- Stripe is in **test mode** (Pro £9.99/mo, Pro Plus £19.99/mo). The webhook targets `saas-ai-resume-builder-seven.vercel.app`.
- No custom domain yet.
- Lint warnings (not errors) remain: React Compiler skips the RHF `form.watch` editor forms.
