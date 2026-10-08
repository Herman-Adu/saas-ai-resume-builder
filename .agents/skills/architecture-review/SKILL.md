---
name: architecture-review
description: Find code smells, seams and architecture drift in this repo using measurable signals - deep imports, lib to features inversions, large files, useEffect, any, ++ counters, client component count - compared against a committed baseline, then turn findings into R-sprints. Use for "review the architecture", "find smells", "health check", "tech debt", "what should we refactor", before a refactor, or at the end of a large sprint.
---

# Architecture review

Measure first, read second. Counting with a script costs few tokens; reading files one by one costs many.

## 1. Measure

When `scripts/arch-audit.mjs` exists (added in W2):

```bash
node scripts/arch-audit.mjs            # short table vs qa/baselines/arch.json
```

Until then, use these counts:

```bash
rg -l "@/features/[^/'\"]+/" app components features lib hooks | wc -l   # files with deep imports (check by hand)
rg -n "from \"@/features" lib | wc -l                                     # lib → features inversions
rg -c "useEffect\(" -g "*.tsx" -g "*.ts" . | awk -F: '{s+=$2} END {print s}'
rg -n ": any|as any|<any>" -g "*.ts*" app features lib hooks components | wc -l
rg -n "\+\+[a-zA-Z_]|[a-zA-Z_]\+\+" -g "*.ts*" features lib | wc -l
rg -l "^\"use client\"" -g "*.tsx" . | wc -l
find app features lib components -name "*.ts*" | xargs wc -l | sort -rn | head -10
```

## 2. Smells to look for (read only the flagged files)

| Smell               | Signal                             | Usual fix                           |
| ------------------- | ---------------------------------- | ----------------------------------- |
| Leaky slice         | deep imports into `features/x/...` | export from `index.ts`              |
| Inverted dependency | `lib/` imports `features/`         | move domain code into a slice       |
| God file            | >300 lines, many responsibilities  | split by responsibility             |
| Effect-driven data  | `useEffect` + `fetch`/`setState`   | `react-next-patterns` decision tree |
| Untyped boundary    | `any`, unchecked `JSON.parse`      | zod at the edge                     |
| Hidden state        | module-level `let`, `++`           | derived or pure ids                 |
| Client sprawl       | `"use client"` high in the tree    | push it down to leaves              |
| Duplicate logic     | same rule in two slices            | extract to the owner                |

## 3. Seams

A seam is a place you can change behaviour without editing callers: a slice's `index.ts`, a server action signature, a pure `lib/` function, an adapter in `lib/auth/adapters`. Prefer refactors that work at a seam, so tests keep passing unchanged.

## 4. Report

Write or update `docs/architecture-health.md`:

1. A scorecard: metric, baseline, now, target.
2. The top smells, each with its file, why it matters and the fix.
3. A proposed R-sprint list in `spec-to-plan` format.

Don't refactor inside a review. Each refactor is its own approved R-sprint, with tests passing before and after.

## 5. Ratchet

Once CI runs the audit, a metric may stay the same or get better, never worse. Update the baseline in the PR that improves it.
