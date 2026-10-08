---
name: spec-to-plan
description: Turn a spec, feature request or brain-dump into a sequenced sprint plan in v0_plans/*.md with outcomes, acceptance criteria, test lists, gates and touched files, ready for the user to confirm. Use for "plan this", "break this into sprints", "write a spec", "what's the roadmap", a long unstructured request, or before any work that spans more than one PR.
---

# Spec to plan

Produce a plan the user can approve line by line. Don't write code here; `sprint-workflow` runs it after approval.

## 0. Settle the design first

If the request still has open decisions (a brain-dump, a new feature, "what do you think"), run `grill-with-docs` first (`.agents/skills/grilling/` + `.agents/skills/domain-modeling/`). Plan only from answers the user has confirmed; reuse the glossary terms in sprint titles.

## 1. Gather (cheaply)

- Read the ledger (`docs/next-steps.md`) and the current plan in `v0_plans/`, so new sprints continue the numbering and don't redo shipped work.
- Search the code only to answer a question that changes the plan: does it exist already, which slice owns it, is there a schema impact.
- If a blocker can't be resolved from the repo, ask one batched question with a recommended default.

## 2. Slice into sprints

Each sprint is one mergeable outcome that leaves `main` green. Prefer more small sprints to one big one.

For every sprint, write:

```md
### <ID>: <outcome in plain words>

- **Why:** the user-visible or engineering reason.
- **Acceptance:** 2–5 checkable statements ("Admin sees X when Y").
- **Tests first:** the failing tests to write, with their layer (unit / integration / smoke / axe).
- **Files:** the slices and files expected to change.
- **Data impact:** none / additive / destructive (gate).
- **Gate:** none, or which approval is needed.
```

IDs: `S<n>` for product sprints, `W<n>` for workflow/tooling, `R<n>` for refactors.

## 3. Order

1. Enablers first (tests, schema, shared pieces).
2. Group anything needing approval so the user can approve it in one go.
3. Put each risky or destructive step in its own sprint.

## 4. Write and confirm

- Write the plan to `v0_plans/<name>.md`, with the short "why" findings at the top.
- Present it for approval. Once it's approved, add the sprints to the ledger as "planned".
- Changing scope later? Edit the plan file in the sprint's PR, so the plan and the code never disagree.
