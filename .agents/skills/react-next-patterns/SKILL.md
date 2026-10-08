---
name: react-next-patterns
description: React 19 and Next.js 16 choices for this repo - server components first, "use cache" with cacheTag and updateTag, server actions with useActionState and useOptimistic, use() for promises, and a decision tree for replacing useEffect. Use when writing or reviewing components, pages, data fetching, forms, caching, loading states, "use client", or any useEffect.
---

# React 19 + Next.js 16 patterns

Default to the modern API. Reach for the older pattern only when the modern one can't express it, and say why in the PR.

## Server first

- A component is a Server Component unless it needs state, effects, refs or browser APIs. Push `"use client"` down to the smallest leaf.
- Fetch data in Server Components or server functions, then pass it down as props, or as a promise read with `use()`.
- `params`, `searchParams`, `cookies()` and `headers()` are async: `await` them.
- Request gating lives in `proxy.ts` (it replaced `middleware.ts`). Proxy is defence in depth; the server action still calls `requireAdmin()`.

## Caching

```ts
async function getProducts() {
  "use cache";
  cacheTag("products");
  return db.product.findMany();
}
// in a server action after a write:
updateTag("products"); // read-your-writes
// elsewhere: revalidateTag("products", "max")
```

## Mutations and forms

- Use server actions, not client `fetch` to route handlers, for app-internal writes.
- `useActionState(action, initial)` gives the form state, the pending flag and errors in one hook.
- `useOptimistic` for instant UI; `useFormStatus` for submit buttons.
- Validate input with zod inside the action. Return a typed result, never throw to the UI.

## Replace useEffect: decision tree

Ask in order; stop at the first yes.

1. **Can it be computed from props or state?** Derive it during render (`useMemo` only if it's expensive).
2. **Is it data fetching?** Do it on the server and pass it down, or pass a promise and `use()` it. Polling or revalidation: SWR.
3. **Does it respond to a user event?** Put it in the event handler.
4. **Is it a form submission or mutation?** Use a server action with `useActionState` / `useOptimistic`.
5. **Does it subscribe to an external store** (media query, storage, socket)? Use `useSyncExternalStore`.
6. **Does it reset state when an id changes?** Use `key={id}` on the component.
7. **Does it sync with a non-React system** (DOM API, third-party widget, timer)? Keep `useEffect`, and use `useEffectEvent` for the non-reactive callbacks. This is the only valid reason.

`setState` inside an effect (lint `react-hooks/set-state-in-effect`) is almost always case 1 or 6.

## Other React 19 defaults

- Pass `ref` as a prop; no `forwardRef`.
- Write `<Context value>` instead of `<Context.Provider>`.
- `<Activity mode>` keeps hidden UI and its state alive (tabs, panels).
- Don't read or write `ref.current` during render (lint `react-hooks/refs`).
- Leave memoisation to the React Compiler; add `memo`/`useCallback` only with a measured reason.
