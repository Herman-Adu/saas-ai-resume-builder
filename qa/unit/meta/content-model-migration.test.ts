import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../../prisma/migrations");

function contentModelSql(): string {
  const folder = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).find((name) => name.endsWith("_content_model"))
    : undefined;

  if (!folder) throw new Error("No *_content_model migration found");

  return readFileSync(path.join(migrationsDir, folder, "migration.sql"), "utf8");
}

describe("content model migration", () => {
  it("is additive: nothing is dropped, renamed, deleted or truncated", () => {
    const sql = contentModelSql();

    expect(sql).not.toMatch(/\bDROP\b/i);
    expect(sql).not.toMatch(/\bRENAME\b/i);
    expect(sql).not.toMatch(/\bDELETE\s+FROM\b/i);
    expect(sql).not.toMatch(/\bTRUNCATE\b/i);
  });

  it("creates the four new section tables", () => {
    const sql = contentModelSql();

    for (const table of ["resume_links", "certifications", "languages", "projects"]) {
      expect(sql).toMatch(new RegExp(`CREATE TABLE "${table}"`));
    }
  });

  it("backfills each existing description into a single bullet", () => {
    const sql = contentModelSql();

    expect(sql).toMatch(/UPDATE "work_experiences"/);
    expect(sql).toMatch(/jsonb_build_array/);
    expect(sql).toMatch(/"description"/);
  });

  it("allows only one master resume per user", () => {
    const sql = contentModelSql();

    expect(sql).toMatch(/CREATE UNIQUE INDEX[^;]*"resumes"\("userId"\)\s+WHERE "isMaster"/);
  });
});
