---
name: db-schema-change
description: Safe Prisma 7 schema and data changes on this repo's Postgres - additive by default, migrations created with --create-only and reviewed before they are applied, integration tests first, a data-impact line in the PR, and an approval gate for anything destructive. Use when editing prisma/schema.prisma, adding a table, column, index or relation, backfilling data, seeding, or seeing Prisma client or type errors after a schema change.
---

# DB schema change (Prisma 7 + Postgres)

## Setup in this repo

- Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/` (history is committed; keep using migrations, not `db push`).
- CLI config: `prisma.config.ts` reads `POSTGRES_URL_NON_POOLING` (direct URL) for migrations.
- Runtime: `src/lib/prisma.ts` uses `@prisma/adapter-pg`. The client is generated into `/generated` (git-ignored) by `postinstall`.
- Models: `Resume`, `WorkExperience`, `Education` (cascade on resume delete), `UserSubscription` (written only by the Stripe webhook). `userId` is the Better Auth `User.id`; the Better Auth tables (`User`, `Session`, `Account`, `Verification`) are owned by Better Auth.

## Rules

- **Additive by default:** new tables, new nullable columns, columns with defaults, new indexes. Existing data stays untouched.
- **Destructive = gate:** dropping or renaming a column or table, changing a type, adding `NOT NULL` without a default, or deleting or rewriting rows. Stop and get explicit approval first, and say exactly which rows or columns are affected.
- Rename in two sprints: add the new column and dual-write, backfill, switch reads, then (gated) drop the old one.
- **Never run `prisma migrate dev` without `--create-only`** or `prisma migrate reset`: on drift they offer to reset the database, and preview, dev and production may share one database.

## Steps

1. **Test first:** write the integration test in `qa/integration/<area>/` for the new behaviour. It fails because the column or table doesn't exist yet.
2. Edit `prisma/schema.prisma`.
3. Create the migration, read the SQL, then apply and regenerate with the project env:
   ```bash
   set -a && source /vercel/share/.env.project && set +a
   npx prisma migrate dev --create-only --name <change>   # writes SQL only
   # review prisma/migrations/<timestamp>_<change>/migration.sql: no DROP, no data rewrite
   npx prisma migrate deploy && npx prisma generate
   ```
   Outside v0, use `vercel env pull .env.local` (see `vercel-ops`) and the same commands.
4. Update `src/lib/validation.ts` (zod) and `src/lib/types.ts` so the new field is typed end to end.
5. `npm run check && npm run test:integration`.

## PR body must include

```
Data impact: additive (new nullable column Resume.templateId). Existing data untouched.
Migration: 20261008120000_resume_template (applied to <db>).
```

## Gotchas

- The Vercel build does not run migrations. Apply them before merging code that reads the new column, and list them in the release checklist.
- `UserSubscription` mirrors Stripe. Change it through the webhook handler (`src/app/api/stripe-webhook/route.ts`), never by hand.
- Seeds and backfills must be idempotent (`upsert`) and scoped to rows they own.
