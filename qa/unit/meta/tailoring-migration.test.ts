import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

function tailoringMigration() {
  const folder = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_tailoring"),
  );
  return folder
    ? readFileSync(path.join(migrationsDir, folder, "migration.sql"), "utf8")
    : "";
}

describe("tailoring migration", () => {
  const sql = tailoringMigration();

  it("exists", () => {
    expect(sql).not.toBe("");
  });

  it("adds isTailored defaulting to false so existing resumes stay base resumes", () => {
    expect(sql).toMatch(/ALTER TABLE "resumes"/);
    expect(sql).toMatch(
      /ADD COLUMN\s+"isTailored" BOOLEAN NOT NULL DEFAULT false/,
    );
  });

  it("adds hiddenSections as a text array that defaults to empty", () => {
    expect(sql).toMatch(
      /ADD COLUMN\s+"hiddenSections" TEXT\[\] DEFAULT ARRAY\[\]::TEXT\[\]/,
    );
  });

  it("only adds: no drops, deletes, truncates or retyping", () => {
    expect(sql).not.toMatch(/\b(DROP|DELETE|TRUNCATE|UPDATE)\b/i);
    expect(sql).not.toMatch(/ALTER COLUMN/i);
  });
});
