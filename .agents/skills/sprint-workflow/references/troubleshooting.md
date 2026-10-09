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

## `npm run build` fails with "Invalid environment variables" for `/robots.txt`
`next build` does not read `.env.development.local`, so `src/env.ts` rejects the empty env. Load the project env for that one command and never print it: `set -a && source /vercel/share/.env.project && set +a && npm run build`.

## Reproducing the CI `app` job locally (production build, signed-in tests)
Dev mode hides production-only behaviour (auth rate limits, trusted origins). Port 3000 belongs to the preview, so use 3100. Run the steps one at a time, never build and start in one command (the server starts before `.next/BUILD_ID` exists and never answers, as in S11b): load the env (`set -a && source /vercel/share/.env.project && set +a`), `export NEXT_PUBLIC_BASE_URL=http://localhost:3100 E2E_DISABLE_RATE_LIMIT=true`, `unset VERCEL`, `npm run build`, then `npx next start -p 3100` in the background, then `E2E_BASE_URL=http://localhost:3100 npm run test:authed`. Afterwards stop the server and `pkill -f "next start -p 3100"`.

## `gh pr checks --watch` is cut off after two minutes
The tool timeout ends the call and the CI run is fine. Poll instead: `for i in $(seq 1 20); do gh pr checks <n> | awk '$1=="app"{print $2}'; sleep 10; done`, then read the `app` log (migrations line, build, test counts) before merging.

## `gh` says "To get started with GitHub CLI, please run: gh auth login"
`gh` worked earlier in the same session but a later call has no token (seen in S12 on `gh pr checks`). It is not a real logout: rerun the same command with the Bash tool's `networkProviders: ["github"]` so the sandbox supplies the credentials. Never ask the user to log in.

## CI `app` job fails on a test that passes locally
Seen in S13: a smoke test failed in CI on a docs-only branch and passed on a rerun of the identical tree. Do this in order: read the failing step in the `app` log, reproduce with the production-build steps above, and if it passes locally the sandbox cannot rerun the job (no permission). Push an empty commit (`git commit --allow-empty`, then `SyncGit`) to start a fresh run, and merge only when that run is fully green. If the same test fails twice, it is a real defect: stop, fix it in the sprint, and add a CI artifact upload for the Playwright trace so the next failure can be read.

## `origin/main` looks stale after merging a PR
`git fetch origin` aborts when a remote branch was deleted (`couldn't find remote ref`) and leaves `origin/main` behind, so `main` appears to lack the merge. Ask GitHub (`gh api repos/<org>/<repo>/branches/main --jq .commit.sha`), then `git fetch origin +refs/heads/main:refs/remotes/origin/main` and `git reset --hard origin/main`.

## A reload test loses data that was just typed
Autosave is debounced, and a fixed `page.waitForTimeout` can end before the save lands (a cold dev compile makes it slower). Wait for the save request itself with `page.waitForResponse` (POST to `/editor`), then reload.

## A page 404s right after its save action runs
A server action that calls `revalidatePath` for the page the user is editing can make that page render a 404 in the browser test (the save itself succeeded and the toast appeared). Have the action return the saved data and let the client keep it in state; revalidate only other pages that list the data. Check the failing screenshot for a 404 body before assuming the save broke.
