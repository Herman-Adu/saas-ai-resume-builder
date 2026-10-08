import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const pkg = JSON.parse(read("package.json")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

describe("Tailwind v4 setup", () => {
  it("runs Tailwind 4 with the dedicated PostCSS plugin", () => {
    expect(allDeps.tailwindcss).toMatch(/^[\^~]?4\./);
    expect(allDeps["@tailwindcss/postcss"]).toBeDefined();
    expect(read("postcss.config.mjs")).toContain("@tailwindcss/postcss");
  });

  it("is configured in CSS, not in a JavaScript config", () => {
    expect(existsSync(path.join(root, "tailwind.config.ts"))).toBe(false);
    expect(existsSync(path.join(root, "tailwind.config.js"))).toBe(false);
    const css = read("src/app/globals.css");
    expect(css).toMatch(/@import\s+["']tailwindcss["']/);
    expect(css).toContain("@theme");
    expect(css).not.toContain("@tailwind ");
  });

  it("uses the v4 animation package instead of the v3 plugin", () => {
    expect(allDeps["tw-animate-css"]).toBeDefined();
    expect(allDeps["tailwindcss-animate"]).toBeUndefined();
  });

  it("maps every theme token to a utility colour in @theme", () => {
    const css = read("src/app/globals.css");
    for (const token of [
      "background",
      "foreground",
      "primary",
      "secondary",
      "muted",
      "accent",
      "destructive",
      "border",
      "ring",
      "brand",
      "paper",
    ]) {
      expect(css, `missing --color-${token}`).toContain(`--color-${token}:`);
    }
  });

  it("defines a class-based dark variant so the theme toggle keeps working", () => {
    expect(read("src/app/globals.css")).toMatch(/@custom-variant\s+dark/);
  });

  it("tells shadcn there is no JavaScript Tailwind config", () => {
    const components = JSON.parse(read("components.json")) as {
      tailwind: { config: string };
    };
    expect(components.tailwind.config).toBe("");
  });
});
