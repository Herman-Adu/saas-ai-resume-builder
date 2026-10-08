---
name: auth-ops
description: Authentication and plan gating on this repo with Better Auth (email and password) - the public-route allowlist in src/proxy.ts, getAuthUserId() and userId scoping in every server action, plan limits in src/lib/permissions.ts, the subscription level from src/lib/subscription.ts, and the Stripe customer id kept in UserSubscription. Use for sign-in, sign-up, sessions, new public or protected pages, premium gating, "why does this page redirect to sign-in", or auth keys and URLs.
---

# Auth operations (Better Auth)

This app uses **Better Auth** with email and password only. Clerk has been removed; do not reintroduce it.

## Where things are

- `src/lib/auth.ts`: the Better Auth server (Prisma adapter, trusted origins, dev-only `SameSite=None; Secure` cookie override for the v0 iframe, `dash()` plugin).
- `src/app/api/auth/[...all]/route.ts`: the handler. Keep the `/api/auth` path.
- `src/lib/auth-client.ts`: browser client for the sign-in, sign-up and sign-out forms.
- `src/lib/session.ts`: `getSession()` and `getAuthUserId()` (React `cache`d). Server code uses these, never the client.
- `src/proxy.ts`: optimistic cookie check with a public allowlist (`/`, `/tos`, `/sign-in`, `/sign-up`, `/api/auth*`, `/api/stripe-webhook*`). It is defence in depth only.
- `src/app/(auth)/sign-in`, `sign-up`: forms. `src/app/(main)/UserMenu.tsx`: signed-in menu and sign-out.
- `src/lib/subscription.ts`: `getUserSubscriptionLevel(userId)` -> `"free" | "pro" | "pro_plus"`.
- `src/lib/permissions.ts`: pure plan rules (`canCreateResume`, `canUseAITools`, `canUseCustomizations`).
- `src/app/api/stripe-webhook/route.ts`: upserts `UserSubscription`, which also holds `stripeCustomerId`.

## Authorisation (every change)

- Every server action starts with `const userId = await getAuthUserId()` and throws or returns an error result when it is `null`, before parsing input.
- Every Prisma read or write on user data filters by that `userId` (`where: { id, userId }`). Never trust an id or ownership field from the client.
- Premium checks call `getUserSubscriptionLevel(userId)` then a `permissions.ts` rule, on the server. The client `SubscriptionLevelProvider` is for UI hints only.
- Plan limits are decided only in `permissions.ts`, unit-tested in `qa/unit/permissions/`. Never inline a plan check in a component or action.
- A cookie in `proxy.ts` is never authorisation. Pages and actions validate with `auth.api.getSession`.

## Adding a page

- **Public**: add its path to `publicPaths` in `src/proxy.ts` and a smoke test that it loads signed out with no redirect.
- **Protected**: put it under `src/app/(main)/`; no proxy change needed. Add a smoke test that a signed-out visit redirects to `/sign-in`.

## Keys and environments

- `BETTER_AUTH_SECRET` (signs sessions, at least 32 characters) and `BETTER_AUTH_API_KEY` (Better Auth dashboard). The user sets them in Vars for Development, Preview and Production; never print, log or ask for them in chat.
- `baseURL` resolves from `BETTER_AUTH_URL`, then the Vercel URLs, then `V0_RUNTIME_URL`. Never disable the origin or CSRF checks; add exact origins to `trustedOrigins` instead.

## Testing auth in the browser

- Signed-out flows (public pages, forms render, redirects) run headless with no setup.
- Signed-in flows: sign up a throwaway account through the form, check the cookie, reload a protected page, sign out. Delete the test user afterwards.
- Login succeeds but a reload returns to sign-in: check cookie attributes first. `Invalid origin`: check `trustedOrigins`.
