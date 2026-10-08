---
name: typescript-clean-code
description: TypeScript and clean-code rules for this repo - no any (parse with zod at boundaries), discriminated unions, immutable data with no ++ counters or shared mutable state, single responsibility, separation of concerns, and searching for existing code before building new. Use when writing or reviewing any TypeScript, refactoring, naming, fixing lint warnings, or on the refactor step of red-green-refactor.
---

# TypeScript and clean code

## Types

- **No `any`.** At boundaries (request bodies, JSON, CMS, Stripe, env), type data as `unknown` and parse it with a zod schema. The schema is the type: `type X = z.infer<typeof XSchema>`.
- Model states as discriminated unions, not optional-field soup:
  ```ts
  type Result<T> = { ok: true; data: T } | { ok: false; error: string };
  ```
- Prefer `satisfies` to `as`. A cast needs a comment saying why it's safe.
- Use the generated Prisma types for rows; map them to domain types in the slice's `mappers.ts`.
- A pure function that reads environment variables takes `Readonly<Record<string, string | undefined>>`, not an object type of optional keys: `process.env` shares no keys with that type, so TypeScript rejects it (S11c). Passing the env in also makes the function testable.
- Exhaustive `switch` on a union, ending with `const _never: never = value`.

## Immutability

- No `let x = 0; x++` counters and no module-level mutable state. Shared counters make ids depend on call order and leak between requests and tests.
  ```ts
  // bad
  let idc = 0;
  const id = () => `b${++idc}`;
  // good: derive ids from data or position
  blocks.map((b, i) => ({ ...b, id: `${templateKey}-${i}` })); // or crypto.randomUUID() at creation
  ```
- Build values with `map` / `filter` / `reduce` / spread. Don't push into arrays you've returned.
- Use `const` everywhere. `let` only for a local accumulator that a loop really needs.

## Responsibility and separation

- One reason to change per module. A component renders; a hook manages UI state; `lib/` holds pure rules; `actions.ts` orchestrates (auth → validate → call the rule → persist → `updateTag`).
- Files over ~300 lines or functions over ~40 are a smell: split by responsibility, not by line count.
- Keep side effects at the edges. Pure functions in the middle are what make test-first cheap.

## Reuse before rebuild

Before writing a helper, component or hook, search:

```bash
rg -n "<verb or noun>" features lib components/ui hooks
```

If something close exists, extend or compose it. If you copy logic twice, extract it the second time, into the owning slice (see `feature-slices`).

## Naming and hygiene

- Names say intent: `isLocked`, `toOrderSummary`, `requireAdmin`. No `data2` or `temp`.
- No unused imports, variables or params, and no commented-out code (git keeps history).
- Comments explain _why_, never _what_.
