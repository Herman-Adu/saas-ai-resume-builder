# Resume editor and templates: proposed plan

Status: **confirmed. S7, S8, S10 (PDF import) and S11 (links, certifications, languages and projects in the editor and preview) are built; S12 (Templates) is next.**
Terms are defined in `GLOSSARY.md`. Decisions are recorded in `docs/adr/`.

## Settled in round 1 (your answers)

| # | Question | Decision |
|---|---|---|
| 1 | How does tailoring work? | Mark one resume as the master. A one-click **Tailor** copies it, and you remove or hide things on the copy. The copy is independent (ADR 0001). |
| 2 | Who gets PDF import? | Pro and Pro Plus. Free sees it locked with an upgrade prompt. |
| 3 | Import sources in v1 | PDF only, which covers LinkedIn's "Save to PDF" (ADR 0003). |
| 4 | Keep the uploaded file? | No. Read in memory, keep only the structured result (ADR 0002). |
| 5 | How small can you remove things? | Down to individual bullets. A job's description becomes a list of bullets. |
| 6 | New sections in v1 | Links, certifications, languages, projects. Volunteering and publications deferred. |
| 7 | Templates | Four: Classic (today's), Modern (two-column), Compact, Minimal (ATS-safe). Free gets Classic only, Pro gets all four. All keep real selectable text. |

## Proposed in round 2 (needs your confirmation)

### R2-1. Sprint order

1. **S7 Content model.** Bullets, links, certifications, languages, projects, the master flag and the hide flag. Additive schema changes, editor forms, and the preview. Everything else depends on this.
2. **S8 Tailor.** Mark master, one-click Tailor, remove or hide at section, entry and bullet level.
3. **S10 PDF import** (shipped; S9 became the authenticated test harness). Upload, extract, then Review in the editor. Paid plans only.
4. **S11 More sections** (added after S10, because the four new sections were stored but never shown). Editor form, preview rendering and hide toggles for links, certifications, languages and projects.
5. **S12 Templates.** A template field on the resume, the four templates, and plan gating.

Why this order: S7 and S8 deliver the tailoring you described first, and S10 needs the full content model to import into. Templates come last because they change how a resume looks, not what it can do.

### R2-2. How the limits count

- **Base resumes** (the master and any standalone resume, including imported ones) keep the current cap: Free 1, Pro 3, Pro Plus unlimited.
- **Tailored resumes** are counted separately, because one per job application would hit a cap of 3 straight away. Proposed: Free cannot tailor (locked, with an upgrade prompt), Pro 10 tailored resumes, Pro Plus unlimited.
- **Imports** create a base resume, so they count against the cap. To control AI cost we also add a fair-use limit of 10 imports per user per day.

These numbers are my suggestion and are a pricing decision, so please change them freely. All limits stay in `src/lib/permissions.ts` and `src/lib/plans.ts`.

### R2-3. Landing page and Stripe copy

- Pricing copy comes from one catalogue, `src/lib/plans.ts`. Each sprint updates the plan lists in the same PR that ships the feature, so the site never advertises something that does not exist yet.
- Stripe product descriptions are edited by you in the Stripe dashboard. I will tell you the exact wording at the end of the sprint that needs it.

## Gates that apply

- Schema changes in S7 and S10 are additive only. Anything destructive needs your approval.
- No production deploy or domain change without your approval.
- Secrets are added by you in Vars. The AI key already exists as `OPENAI_API_KEY`.

## Open risks

- **PDF extraction quality varies.** That is why Review is a required step and why scanned PDFs fail clearly.
- **AI cost and privacy.** Import sends CV text to an AI provider, so S10 shows a privacy note on the upload screen. Checked against OpenAI's policy: API data is not used for training by default, but is retained up to 30 days for abuse monitoring, so the note says that and never claims "not stored". Zero Data Retention needs OpenAI's approval and is not applied for yet.
- **Existing resumes.** S7 must turn each existing description into a single bullet without losing any text, with a test that proves it.
