import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { planFeatures, plans } from "@/lib/plans";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const ledger = read("docs/next-steps.md");

const section = (heading: string) => {
  const start = ledger.indexOf(`\n## ${heading}`);
  if (start === -1) throw new Error(`Ledger has no "## ${heading}" section`);
  const rest = ledger.slice(start + 1);
  const end = rest.indexOf("\n## ", 1);
  return end === -1 ? rest : rest.slice(0, end);
};

const sprintIds = (text: string) => text.match(/\bS\d+[a-z]?\b|\bOS\b/g) ?? [];

const firstCells = (table: string) =>
  table
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.startsWith("| Sprint"))
    .map((line) => line.split("|")[1].trim());

const shipped = new Set(firstCells(section("Shipped")).flatMap(sprintIds));

// A stale header sent the next agent to a sprint that was already merged.
describe("sprint ledger", () => {
  it("records shipped sprints", () => {
    expect(shipped.size).toBeGreaterThan(10);
    expect(shipped.has("S12")).toBe(true);
  });

  it("never names a shipped sprint as the current one", () => {
    const current = ledger.match(/Current sprint:\s*([^\n]*)/);
    expect(current, 'header needs a "Current sprint:" line').not.toBeNull();
    const named = sprintIds(current![1]);
    for (const id of named) {
      expect(shipped.has(id), `${id} is shipped but still marked current`).toBe(false);
    }
  });

  it("does not list shipped sprints under Next", () => {
    const queued = firstCells(section("Next")).flatMap(sprintIds);
    for (const id of queued) {
      expect(shipped.has(id), `${id} is shipped but still listed under Next`).toBe(false);
    }
  });

  it("has a Known gaps section so open problems are written down", () => {
    expect(ledger).toMatch(/^## Known gaps/m);
  });
});

// The Stripe dashboard is edited by hand, so the wording the owner pastes
// must stay in step with what the plan catalogue promises.
describe("Stripe dashboard copy", () => {
  const copy = read("docs/stripe-dashboard-copy.md");

  it.each(plans.filter((plan) => plan.id !== "free"))(
    "lists every $name feature from the plan catalogue",
    (plan) => {
      for (const feature of planFeatures(plan)) {
        expect(copy, `missing "${feature}"`).toContain(feature);
      }
    },
  );
});

// The v0_plans folder is not tracked in git, so the header may only point at
// files that CI can see.
describe("ledger header", () => {
  it("does not point at the untracked v0_plans folder", () => {
    const header = ledger.slice(0, ledger.indexOf("\n## "));
    expect(header).not.toMatch(/v0_plans\//);
  });

  it("points at a plan file that exists when it names one", () => {
    const active = ledger.match(/Active plan:\s*`([^`]+)`/);
    if (active) {
      expect(() => read(active[1])).not.toThrow();
    }
  });
});
