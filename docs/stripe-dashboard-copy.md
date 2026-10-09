# Stripe dashboard wording

Paste these into the product pages in the Stripe dashboard (Product catalogue > the product > Description and Features). The wording is the plan catalogue in `src/lib/plans.ts`, and `qa/unit/meta/ledger.test.ts` fails if this file stops listing a feature the app promises. Prices stay as they are in Stripe (Pro £9.99/month, Pro Plus £19.99/month). No keys are needed to paste text.

## Pro

**Name:** Pro

**Description:** AI writing for the resumes you actually send.

**Features (one per line):**

- Up to 3 resumes
- Live preview and autosave
- Print-ready PDF export
- All 10 templates, including an ATS-safe one
- Tailor to each job, up to 10 tailored resumes
- AI-written summary and work experience
- Import your CV from a PDF
- Tailor to a pasted job post with AI suggestions you approve

## Pro Plus

**Name:** Pro Plus

**Description:** Unlimited resumes, styled your way.

**Features (one per line):**

- Unlimited resumes
- Live preview and autosave
- Print-ready PDF export
- All 10 templates, including an ATS-safe one
- Tailor to each job, unlimited tailored resumes
- AI-written summary and work experience
- Import your CV from a PDF
- Tailor to a pasted job post with AI suggestions you approve
- Colour and border customisation

## Free

Free has no Stripe product. For reference: 1 resume, live preview and autosave, print-ready PDF export, and the Classic template.
