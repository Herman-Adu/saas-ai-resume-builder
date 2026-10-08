import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const files = [
  "src/app/(main)/editor/actions.ts",
  "src/app/(main)/editor/forms/actions.ts",
  "src/app/(main)/resumes/importCvAction.ts",
  "src/lib/cv-import.ts",
  "src/lib/pdf-text.ts",
];

function source(file: string) {
  const full = path.join(process.cwd(), file);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

describe("CV privacy (ADR 0002)", () => {
  it.each(files)("%s exists", (file) => {
    expect(source(file)).not.toBeNull();
  });

  it.each(files)("%s never prints to the server logs", (file) => {
    // CV text and AI responses are personal data and must not reach the logs.
    expect(source(file) ?? "").not.toMatch(/console\.(log|info|debug|warn|error)\(/);
  });

  it("the import action never stores the uploaded file", () => {
    const action = source("src/app/(main)/resumes/importCvAction.ts") ?? "";

    expect(action).toMatch(/"use server"/);
    expect(action).not.toMatch(/@vercel\/blob/);
    expect(action).not.toMatch(/writeFile|createWriteStream/);
  });
});
