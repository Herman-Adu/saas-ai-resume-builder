# AGENTS.md

Shared rules for every coding agent on this repo (v0, Claude Code, Codex, Hermes, humans).
Stack: Next.js 16 (App Router, `src/proxy.ts`), React 19, TypeScript, Prisma 7 (`@prisma/adapter-pg`) on Postgres, Better Auth, Stripe, OpenAI, Vercel Blob, Tailwind v3 + shadcn, npm, Vitest (+ Playwright from Sprint 0) in `qa/`.

## Load only what the task needs

Read this file, then open **only** the skill that matches the task. Skills link to `references/` for detail; open those only when a step needs them.

| Task | Skill |
|---|---|
| Start, resume, ship or merge a sprint; "where are we" | `.agents/skills/sprint-workflow/` |
| "Grill me": interview until every decision is settled | `.agents/skills/grill-me/` (uses `.agents/skills/grilling/`) |
| "Grill me with docs": interview + glossary + ADRs (default before planning) | `.agents/skills/grill-with-docs/` (adds `.agents/skills/domain-modeling/`) |
| Turn a settled spec or brain-dump into sprints | `.agents/skills/spec-to-plan/` |
| Write tests, pick a test layer, red/green | `.agents/skills/test-first/` |
| Components, data fetching, caching, forms, `useEffect` | `.agents/skills/react-next-patterns/` |
| Types, naming, mutation, duplication | `.agents/skills/typescript-clean-code/` |
| Where a file goes, imports between features | `.agents/skills/feature-slices/` |
| Smells, seams, health check, refactor planning | `.agents/skills/architecture-review/` |
| Prisma schema, migrations or data changes | `.agents/skills/db-schema-change/` |
| Sign-in, sessions, public routes, plan gating (Better Auth) | `.agents/skills/auth-ops/` |
| Vercel CLI, env, previews, logs, production release | `.agents/skills/vercel-ops/` |
| End of sprint: lessons into rules | `.agents/skills/sprint-retro/` |

## Non-negotiables

1. **Never commit to `main`.** One sprint = one `v0/<id>-<name>` branch = one PR = squash-merge. Branch from the real `main`.
2. **Test first.** Write the failing test, see it fail for the right reason, then implement.
3. **Green before every push:** `npm run check` (typecheck, lint, unit), plus the browser tests (smoke + axe + seo + authed). A failure gets fixed in the same sprint; never push or merge red.
4. **After merge:** refresh `main`, confirm it points at the merge commit, update the ledger in `docs/next-steps.md`.
5. **Every server action** starts with `const { userId } = await auth()` and rejects when it's missing; every Prisma query on user data filters by that `userId`. Plan limits live in `src/lib/permissions.ts`.
6. **Schema changes are additive** unless the user approves otherwise.
7. **Reuse before you build:** search `src/components/`, `src/lib/`, `src/hooks/` and `src/components/ui/` first.

## Gates (stop and get explicit approval)

- Production deploy, promote or alias.
- Deleting or rewriting existing data; non-additive schema changes.
- Repo settings (rulesets, branch protection, secrets).
- Secrets: the user adds them in Vars / GitHub settings. Never ask for a value in chat.

"ok", "yes and..." or silence is not approval for a gate.

## Where things are

- Plans: `v0_plans/*.md`. Ledger: `docs/next-steps.md`. ADRs: `docs/adr/`.
- App code: `src/app` (routes, co-located route components), `src/components`, `src/lib`, `src/hooks`. `@/` maps to `src/`.
- Tests: `qa/unit` (Vitest); Playwright in `qa/e2e/{smoke,seo,axe,authed}`. `authed` signs in real users on a chosen plan via `qa/e2e/support/fixtures.ts` (import `test` from there, call `signedInAs`). Always use the `npm run test:*` scripts.
- Known sandbox problems and fixes: `.agents/skills/sprint-workflow/references/troubleshooting.md`.

## Keep this system honest

Skills are code: change them in a PR. `qa/unit/meta/skills.test.ts` checks every skill is routed here, stays under 120 lines, and only links to files that exist. Keep this file under 80 lines.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
