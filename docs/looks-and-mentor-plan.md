# Plan: Looks and Company mentor brief (S21, S22)

Confirmed by the owner on 9 Oct 2026. One batch: one branch (`v0/batch-s21-s22`), one PR, one commit per sprint, plus a housekeeping commit first (this plan, the S18 to S20 ledger rows, the retro, the close-out step in the sprint workflow). This plan is in `docs/` because `v0_plans/` is not tracked in git.

Follows the document-look batch (S18 to S20, PR #28): photo options, skill levels and styles, page background and fonts.

## S21: Looks (presets)

Outcome: a "Looks" button in the preview toolbar applies a named preset that sets the photo, skills style, page background and font pair in one click, for example Professional (plain, default fonts, chips) and Artistic (tinted page, display fonts, rings). The user can still change any single option afterwards.

- No schema change and no new column: a preset is a plain constant in `src/lib/looks.ts` that maps to the existing fields.
- Same plan gate as the options it sets (`canUseCustomizations`). The save action already refuses a gated change, so a preset needs no new gate; Free sees the button locked with the upgrade prompt.
- Minimal stays plain and photo-free: a preset never overrides what `effectivePageBackground` and the template rules decide.
- Tests first: unit tests for the preset catalogue (every value is valid, no preset sets a Minimal-breaking value) and for applying a preset to form values; a signed-in browser spec (apply a preset, the preview changes, it survives a reload, Free is locked, axe with the popover open).
- Data impact: none.

## S22: Company mentor brief

Outcome: for a job saved by Tailor to a job, the user can generate a stored brief: what the role tests, where the CV is weak against the post, and what to brush up on before an interview. The brief is saved and shown again without another AI call.

- New table `MentorBrief` keyed to `Job` (additive migration, applied to the shared Neon database before the batch PR, data impact: none to existing rows). It holds the generated text only, no extra copy of the CV.
- Same refusal order as S16 and S17, all before the AI call: signed out, plan, no linked job, daily limit. Limits live in `permissions.ts` next to `jobTailorDailyLimits`. Recommended gate: Pro Plus, because it needs the stored job post and a long AI answer.
- The AI answer is validated with zod. Nothing from the brief is written into the CV.
- Tests first: unit tests for the schema, the limits, the refusal order and user scoping; a signed-in browser spec with a fake model (generate, reload, still there; Free sees the upgrade note).
- Plan copy and `docs/stripe-dashboard-copy.md` gain one line for the brief, so the owner must paste it into the Stripe product.
- Manual check still needed after merge: how good the real AI briefs are, since CI uses a fake model.

## Close-out (end of the batch, part of the sprint workflow)

Ledger rows, retro and the "Next" table ship inside the batch PR. After the merge: confirm `main`, delete the batch branch locally and on the remote, show `git status` and `git branch -a`, then propose the next batch for the owner's "confirmed".
