import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json")) as {
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
const major = (range: string) => Number(range.replace(/^[\^~>=\s]+/, "").split(".")[0]);
const installedVersion = (name: string) =>
  (JSON.parse(read(`node_modules/${name}/package.json`)) as { version: string }).version;

describe("tooling versions", () => {
  it("runs TypeScript 6, the newest major typescript-eslint supports", () => {
    expect(major(allDeps.typescript)).toBe(6);
    expect(installedVersion("typescript")).toMatch(/^6\./);
  });

  it("keeps TypeScript below 7 until typescript-eslint supports it", () => {
    // typescript-eslint throws "does not support TS 7.0" at load time, which breaks `npm run lint`.
    expect(major(allDeps.typescript)).toBeLessThan(7);
  });

  it("keeps ESLint on 9 until eslint-plugin-react, -import and -jsx-a11y allow 10", () => {
    // Those plugins (pulled in by eslint-config-next) cap their eslint peer range at ^9.
    expect(major(allDeps.eslint)).toBe(9);
    expect(major(allDeps["@eslint/js"])).toBe(9);
  });

  it("matches @types/node to the Node major we deploy on", () => {
    const nodeMajor = major(pkg.engines?.node ?? "");
    expect(major(allDeps["@types/node"])).toBe(nodeMajor);
  });

  it("does not run Prisma on a pre-release", () => {
    for (const name of ["prisma", "@prisma/client"]) {
      expect(allDeps[name], name).not.toMatch(/-(rc|beta|alpha|canary)/);
      expect(installedVersion(name), name).not.toMatch(/-/);
    }
  });
});
