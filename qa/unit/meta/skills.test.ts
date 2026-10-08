import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "../../config/repo-root";

const root = REPO_ROOT;
const skillsDir = join(root, ".agents/skills");
const agentsPath = join(root, "AGENTS.md");

const MAX_SKILL_LINES = 120;
const MAX_AGENTS_LINES = 80;
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function readFrontmatter(source: string): Record<string, string> {
  // Normalise CRLF: Windows checkouts (core.autocrlf=true) rewrite line endings.
  const match = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([a-z-]+):\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2].trim()]),
  );
}

function localLinks(source: string): string[] {
  const targets = [...source.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  return targets.filter(
    (t) => !/^[a-z]+:/i.test(t) && !t.startsWith("#") && !t.startsWith("/"),
  );
}

const skillNames = existsSync(skillsDir)
  ? readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

describe("AGENTS.md", () => {
  it("exists, stays a short router, and is imported by CLAUDE.md", () => {
    expect(existsSync(agentsPath)).toBe(true);
    expect(
      readFileSync(agentsPath, "utf8").split("\n").length,
    ).toBeLessThanOrEqual(MAX_AGENTS_LINES);
    expect(readFileSync(join(root, "CLAUDE.md"), "utf8")).toContain(
      "@AGENTS.md",
    );
  });
});

describe("agent skills", () => {
  it("ships the catalogue from the operating-system plan", () => {
    expect(skillNames.sort()).toEqual(
      [
        "architecture-review",
        "auth-ops",
        "db-schema-change",
        "domain-modeling",
        "feature-slices",
        "grill-me",
        "grill-with-docs",
        "grilling",
        "react-next-patterns",
        "spec-to-plan",
        "sprint-retro",
        "sprint-workflow",
        "test-first",
        "typescript-clean-code",
        "vercel-ops",
      ].sort(),
    );
  });

  describe.each(skillNames)("%s", (name) => {
    const skillPath = join(skillsDir, name, "SKILL.md");
    const source = existsSync(skillPath) ? readFileSync(skillPath, "utf8") : "";
    const frontmatter = readFrontmatter(source);

    it("has valid frontmatter whose name matches the folder", () => {
      expect(frontmatter.name).toBe(name);
      expect(name).toMatch(NAME_PATTERN);
      expect(frontmatter.description?.length ?? 0).toBeGreaterThan(20);
      expect(frontmatter.description?.length ?? 0).toBeLessThanOrEqual(1024);
    });

    it(`stays under ${MAX_SKILL_LINES} lines`, () => {
      expect(source.split("\n").length).toBeLessThanOrEqual(MAX_SKILL_LINES);
    });

    it("is routed from AGENTS.md", () => {
      expect(readFileSync(agentsPath, "utf8")).toContain(
        `.agents/skills/${name}/`,
      );
    });

    it("links only to files that exist", () => {
      const missing = localLinks(source).filter(
        (link) => !existsSync(join(dirname(skillPath), link)),
      );
      expect(missing).toEqual([]);
    });
  });
});
