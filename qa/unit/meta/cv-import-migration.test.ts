import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

function cvImportsMigration() {
  const folder = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_cv_imports"),
  );
  return folder
    ? readFileSync(path.join(migrationsDir, folder, "migration.sql"), "utf8")
    : "";
}

describe("cv imports migration", () => {
  const sql = cvImportsMigration();

  it("exists", () => {
    expect(sql).not.toBe("");
  });

  it("creates a cv_imports table with only an id, a user and a time", () => {
    expect(sql).toMatch(/CREATE TABLE "cv_imports"/);
    expect(sql).toMatch(/"id" TEXT NOT NULL/);
    expect(sql).toMatch(/"userId" TEXT NOT NULL/);
    expect(sql).toMatch(/"createdAt" TIMESTAMP\(3\) NOT NULL DEFAULT CURRENT_TIMESTAMP/);
  });

  it("holds no CV content, so nothing from an upload is kept (ADR 0002)", () => {
    const columns = Array.from(sql.matchAll(/^\s+"(\w+)" [A-Z]/gm)).map(
      (match) => match[1],
    );
    expect(columns).toEqual(["id", "userId", "createdAt"]);
  });

  it("indexes the lookup the daily limit makes", () => {
    expect(sql).toMatch(/CREATE INDEX[^\n]*"cv_imports"\("userId", "createdAt"\)/);
  });

  it("only adds: no drops, deletes, truncates, updates or retyping", () => {
    expect(sql).not.toMatch(/\b(DROP|DELETE|TRUNCATE|UPDATE)\b/i);
    expect(sql).not.toMatch(/ALTER (TABLE|COLUMN)/i);
  });
});
