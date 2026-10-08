# Troubleshooting

Carried over from the apple-style-scroll-animation-3 repo where it still applies; add entries here as sprints find new ones.

## Uncommitted work disappeared
The workspace was switched to a new `v0/...` branch from `main`. Check `git stash list` and the old branch first. In v0, saved tool records under `user_read_only_context/tool_content/tool-history/` hold full Write/Edit contents. Prevention: commit WIP on the sprint branch early.

## `origin/main` is stale or missing
Use `git fetch origin +refs/heads/main:refs/remotes/origin/main`. Fallback: `git fetch origin main && git checkout -B v0/<name> FETCH_HEAD`.

## "Pulling changes from main" happened mid-sprint
Re-run Orient. Confirm the sprint branch still exists and `git diff --stat origin/main` shows only sprint files.

## `npm install` fails with ERESOLVE
Peer ranges in this repo (react-color and others) don't all declare React 19. Use `npm install --legacy-peer-deps`, the same flag Vercel's install command uses. Don't add `--force`.

## Prisma client missing or stale (`Cannot find module '../generated/...'`)
The client is generated into `/generated` (git-ignored) by `postinstall`. Run `npx prisma generate`. Prisma CLI commands read `POSTGRES_URL_NON_POOLING` via `prisma.config.ts`, so load the env first (see `db-schema-change`).

## Playwright: no browser / `libnspr4.so` missing
`npx playwright install chromium`. The sandbox is Amazon Linux 2023 (`dnf`, no `apt-get`), so `playwright install-deps` cannot work. Install the libraries with `sudo -n dnf install -y nspr nss nss-util atk at-spi2-atk cups-libs libdrm libxkbcommon libXcomposite libXdamage libXfixes libXrandr mesa-libgbm alsa-lib pango cairo`, then confirm with a one-line `chromium.launch()`. If that fails, report the check as blocked; don't loop.

## Port 3000 busy when the browser tests start
The v0 preview dev server already owns it. Point Playwright at the running server (`reuseExistingServer`) instead of starting a second one. If it still can't run, stop and report it; never push unchecked.

## Signed-in test: server action returns 500, `Cannot read properties of undefined (reading 'count')`
The long-running dev server loaded the Prisma client before `prisma generate` ran for a new model, so `prisma.<model>` is undefined there. Unit tests mock Prisma and won't show it. After any schema change, run `npx prisma generate`, then restart `next dev` (`pkill -f "next dev"`; Playwright starts a fresh one) before the browser tests. To see why a server action failed, unzip the failing test's `trace.zip` and read the POST response body in `resources/`; the dev log file doesn't capture it.

## Vitest can't resolve `@/...`
`vitest` ran without `--config qa/config/vitest.config.mts`. Use the `npm run test:*` scripts.

## Preview: "Expected export to be in eval context" after pulling main
Turbopack is serving a cached copy of the named file from before the pull; the code is fine. A restart or `touch` does not clear it. Add a harmless line to that file, wait for `/` to load, then remove it. Don't delete `.next` without asking.

## Push rejected: "refusing to allow a GitHub App to create or update workflow"
The v0 GitHub app lacks the `workflows` permission. The user accepts it in GitHub (Settings > Applications > Vercel > Review request). Until then, keep `.github/workflows/*` out of the sprint commit and hand the user the exact YAML.

## Protected routes return 307 to `/sign-in` in headless tests
`src/proxy.ts` redirects every non-public route to `/sign-in` when there is no session cookie. Smoke-test public pages and the redirect; sign up a throwaway account for signed-in checks (see `auth-ops`).
