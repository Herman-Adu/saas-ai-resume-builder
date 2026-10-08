---
name: sprint-retro
description: Close every sprint by turning what went wrong or slow into a rule - three questions, then a small edit to the one skill, troubleshooting entry or AGENTS.md line that would have prevented it, shipped in the same or the next sprint's PR. Use after a merge, at the end of a sprint, after a failure or rework, or when the user says "remember this", "learn from this" or "don't do that again".
---

# Sprint retro

Five minutes, every sprint. The goal: make the same mistake impossible, not just less likely.

## Three questions

1. **What failed, broke or needed rework?** (A red check, a reverted change, lost work, a wrong assumption.)
2. **What took longer than it should?** (Searching, a sandbox setup issue, unclear ownership.)
3. **What did the user correct?** Every correction is a missing rule.

If all three answers are "nothing", write "Retro: nothing to change" in the ledger row and stop.

## Turn each answer into the smallest durable fix

Prefer the strongest fix that's cheap. A test or CI check beats a lint rule, which beats a skill line.

| Kind of lesson              | Where it goes                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| Can be checked by a machine | a test, a lint rule or a CI step (W2 tooling)                                              |
| Process step was missed     | the step in `sprint-workflow`                                                              |
| Coding rule                 | the relevant skill (`react-next-patterns`, `typescript-clean-code`, `feature-slices`, ...) |
| Sandbox or tool quirk       | `.agents/skills/sprint-workflow/references/troubleshooting.md`                             |
| Applies to every task       | one line in `AGENTS.md` (keep it under 80 lines)                                           |

## Rules

- Edit the one place the lesson belongs; don't copy it into several skills.
- Keep skills small. If a skill passes ~100 lines, move detail into `references/`.
- Write the reason next to the rule ("because S1 lost uncommitted work"), so later readers can judge edge cases.
- The skill edit ships in a PR like code, and `qa/unit/meta/skills.test.ts` must stay green.
- In v0, save only personal preferences to memory. Project rules belong in the repo, so every agent gets them.
