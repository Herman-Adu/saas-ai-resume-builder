---
name: sprint-workflow
description: Run one sprint end to end on this repo - orient, branch from the real main, hand off to test-first, run every check, open the PR, merge only when green, refresh main and set up the next sprint. Use for "start sprint N", "next sprint", "continue the plan", "where are we", "ship this", "open/merge the PR", "go", after "Pulling changes from main", after a context reset, or when the branch or uncommitted work looks wrong.
---

# Sprint workflow

One sprint = one commit = one ledger row. A batch of up to three sprints shares one branch and one PR, because every push to a PR branch runs CI and a Vercel preview. Scope comes from the active plan in `v0_plans/`. This skill runs the loop; other skills do the work inside it.

## 0. Orient (every start or resume)

```bash
git status --short && git branch --show-current && git log --oneline -5 && git stash list
```

Read the ledger in `docs/next-steps.md` and the sprint's section of the plan. Tell the user in plain words: last merged sprint + PR, what is next, anything blocked.

Why: the workspace can be switched to a fresh branch from `main` between turns, which wipes uncommitted files.

## 1. Branch from the real main

```bash
git fetch origin +refs/heads/main:refs/remotes/origin/main
git checkout -B v0/batch-<first-id>-<last-id> origin/main
```

Later sprints in the batch continue on the same branch; don't branch again.

A plain `git fetch origin main` only moves `FETCH_HEAD`; branching from a stale `origin/main` silently reverts merged work.

## 2. Build, test first

Follow `.agents/skills/test-first/`. While coding, apply only the skills the change touches: `react-next-patterns`, `typescript-clean-code`, `feature-slices`, `db-schema-change`, `auth-ops`.

Commit each finished sprint as its own commit on the batch branch. Don't push mid-batch.

## 3. Checks (run after every sprint; all green before any push)

```bash
npm run check                         # typecheck + lint + unit (Vitest)
npm run test:smoke && npm run test:axe && npm run test:seo && npm run test:authed
```

Add `npm run build` when config, dependencies or deploy are touched. The package manager is **npm** with `--legacy-peer-deps` (it matches the Vercel install command); don't switch to pnpm or commit another lockfile. If anything fails, fix it in this sprint and rerun. Never push or merge red; never skip a check silently. If the sandbox blocks a check (e.g. port busy), see [troubleshooting](references/troubleshooting.md), make one recovery attempt, then stop and report it as blocked.

## 4. Docs and retro (inside the batch, before the push)

Write one ledger row per sprint with the PR number (next number = highest PR number in `gh pr list --state all --limit 1` plus one; check it after opening and fix before merge). Update the ledger header and the "Next" table, run `.agents/skills/sprint-retro/`, update `README.md` when setup or scripts change, and add an ADR in `docs/adr/` for any decision that's hard to reverse. Ledger rows ship in the batch PR, never in the next one, because docs left for the next batch make every start a clean-up (the S18 to S20 hangover).

## 5. Ship

```bash
git diff --stat origin/main    # only this batch's files; anything else = stale base, stop and fix
```

1. Commit per sprint: `<SPRINT>: <outcome> (<key parts>)`. Push once, when the batch is done and the full local gates are green on the final tree.
2. `gh pr create --base main --title "<SPRINTS>: ..." --body` with: what per sprint, why, tests run, data impact.
3. Wait for every check to be green: CI (`checks` + `app` jobs) and the Vercel preview build (`gh pr checks <n> --watch`). Red = fix on the branch, rerun local checks, push again (each push costs a CI run).
4. `gh pr merge <n> --merge --delete-branch` (a merge commit keeps the sprint commits; the ruleset allows it).

Merging to `main` does not mean going live: promoting to production is a separate gated step (`vercel-ops`).

## 6. Batch close-out (last step of every batch)

```bash
git fetch origin +refs/heads/main:refs/remotes/origin/main --prune && git log --oneline -1 origin/main
git branch -D <batch-branch>; git push origin --delete <batch-branch>   # skip what `--delete-branch` already removed
git status --short && git branch -a
```

1. `main` points at the merge commit; the tree is clean; `git branch -a` shows only `main` and the chat's own working branch. Nothing from this batch may be left for the next one. If something is, fix it now or write it in the ledger's "Known gaps" with an owner.
2. Tell the user what shipped, the test counts and the clean-state output.
3. Propose the next batch: up to three sprints from the ledger's "Next" table, each with outcome, data impact, gate and a recommendation on every decision. Stop and wait for "confirmed". The plan file for it is saved in the next batch's first commit.

## Gates: stop and ask

Production deploy, destructive data or schema changes, repo settings, secrets. Ask, then wait. "ok", "yes and..." or silence is not approval.

## Report

End with: what shipped (PR #), test counts, anything that deviated from the plan and why, what is blocked, and the next sprint with its gate if it has one. Plain language, short.
