---
name: clerk-auth-ops
description: Authentication and plan gating on this repo with Clerk - the public-route allowlist in src/proxy.ts, auth() and userId scoping in every server action, plan limits in src/lib/permissions.ts, the subscription level from src/lib/subscription.ts, and the Stripe customer id kept in Clerk private metadata. Use for sign-in, sign-up, sessions, new public or protected pages, premium gating, "why does this page redirect to sign-in", or Clerk keys and URLs.
---

# Clerk auth operations

Replaces `better-auth-ops` from the source repo: this app uses **Clerk** (`@clerk/nextjs`), not Better Auth.

## Where things are

- `src/app/layout.tsx`: `<ClerkProvider>` wraps the app.
- `src/proxy.ts`: `clerkMiddleware` with an `isPublicRoute` allowlist (`/`, `/tos`, `/sign-in`, `/sign-up`, `/api/stripe-webhook`). Everything else calls `auth.protect()`.
- `src/app/(auth)/sign-in`, `sign-up`: Clerk's hosted components.
- `src/lib/subscription.ts`: `getUserSubscriptionLevel(userId)` -> `"free" | "pro" | "pro_plus"` (React `cache`d).
- `src/lib/permissions.ts`: pure plan rules (`canCreateResume`, `canUseAITools`, `canUseCustomizations`).
- `src/app/api/stripe-webhook/route.ts`: writes `stripeCustomerId` to Clerk `privateMetadata` and upserts `UserSubscription`.

Load the `marketplace-clerk-*` platform skills only for Clerk-specific work this file doesn't cover (custom sign-in UI, webhooks from Clerk, organisations).

## Authorisation (every change)

- Every server action starts with `const { userId } = await auth()` and throws or returns an error result when `userId` is missing, before parsing input. `proxy.ts` is defence in depth only.
- Every Prisma read or write on user data filters by that `userId` (`where: { id, userId }`). Never trust an id or ownership field from the client.
- Premium checks call `getUserSubscriptionLevel(userId)` then a `permissions.ts` rule, on the server. The client-side `SubscriptionLevelProvider` is for UI hints only.
- Plan limits are decided only in `permissions.ts`, unit-tested in `qa/unit/permissions/`. Never inline a plan check in a component or action.

## Adding a page

- **Public** (landing sections, pricing, legal): add its path to `isPublicRoute` in `src/proxy.ts` and add a smoke test that it loads signed out with no redirect.
- **Protected**: put it under `src/app/(main)/`; no proxy change needed. Add a smoke test that signed-out visits redirect to `/sign-in`.
- Signed-in vs signed-out UI on public pages: read `auth()` in a Server Component and branch there; avoid flashing client-only `<SignedIn>` swaps above the fold.

## Keys and environments

- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, validated in `src/env.ts`. The user sets them in Vars; never print or log them.
- `afterSignOutUrl` is set on `<ClerkProvider>`. Redirect targets after sign-in/up come from the env URLs, not hard-coded strings.

## Testing auth in the browser

- Signed-out flows (public pages, redirects) run headless with no setup.
- Signed-in flows need a test user. Ask the user to add `QA_CLERK_EMAIL` / `QA_CLERK_PASSWORD` under Vars, then sign in via Clerk's testing helpers (`@clerk/testing`) in Playwright. Until then, report signed-in checks as blocked rather than skipping them silently.
- The v0 preview is an iframe; if Clerk's dev-instance handshake fails there, open the preview URL in a new tab before assuming the code is broken.
