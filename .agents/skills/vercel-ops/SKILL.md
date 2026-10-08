---
name: vercel-ops
description: Vercel CLI and release operations for this repo - linked project saas-ai-resume-builder, env pull and add, preview deploys, logs, inspecting builds, and the gated production release checklist for saas-ai-resume-builder-seven.vercel.app. Use for "deploy", "go live", "preview", "check logs", "env vars", "why did the build fail on Vercel", domains, or any vercel command.
---

# Vercel operations

The project is linked (`.vercel/project.json`, project `saas-ai-resume-builder`, team `hermanadus-projects`). Pass `--scope team_zCnd7z0i725e3TV7zfUZxlHe` to `vercel api`. Load the generic `vercel-cli` platform skill only for commands not covered here.

Production URL today: `https://saas-ai-resume-builder-seven.vercel.app` (no custom domain yet). Install command on Vercel: `npm install --legacy-peer-deps`; Node 24.

## Everyday (no gate)

```bash
vercel whoami && vercel project ls | head          # confirm account and link
vercel env ls                                       # names only; never print values
vercel env pull .env.local --environment=development
vercel deploy                                       # preview deploy, prints the URL
vercel logs <deployment-url>                        # runtime logs
vercel inspect <deployment-url> --logs              # build logs for a failed deploy
```

- Every PR gets a preview deployment through the Git integration. Use `vercel deploy` only to test a branch that isn't pushed.
- New secrets: the user adds them in v0 Vars or the Vercel dashboard. If you're scripting it, `vercel env add NAME <env>` prompts for the value, so let the user type it. Never put a secret in chat, a commit or a log.
- `src/env.ts` validates every variable at boot. A new variable goes in `src/env.ts` and in Vercel for every environment before the code that reads it merges.

## Gated (explicit approval first)

- `vercel --prod`, `vercel promote`, `vercel alias`, domain changes, and removing env vars.
- Ask with the exact command and target, then wait. "ok" or "yes and..." isn't approval.

## Production release

Follow [the release checklist](references/release-checklist.md) step by step, and report each step as passed, failed or blocked.

## Debugging a failed Vercel build

1. `vercel inspect <url> --logs | tail -50` and find the first error.
2. Reproduce locally with `npm run build`.
3. Fix it on a sprint branch, test first if it's a logic error, then follow the normal PR loop.
