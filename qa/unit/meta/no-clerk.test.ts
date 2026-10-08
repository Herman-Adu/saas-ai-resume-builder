import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|mts)$/.test(name) ? [full] : [];
  });
}

describe("Clerk is gone", () => {
  it("no source file mentions Clerk", () => {
    const offenders = sourceFiles(path.join(root, "src")).filter((file) =>
      /clerk/i.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });

  it("package.json has no @clerk dependency", () => {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(names.filter((name) => name.startsWith("@clerk/"))).toEqual([]);
  });

  it("env schema does not require CLERK variables", () => {
    const env = readFileSync(path.join(root, "src/env.ts"), "utf8");
    expect(env).not.toMatch(/CLERK/);
  });
});
