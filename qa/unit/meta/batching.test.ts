import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

// Every push to a PR branch runs CI and a Vercel preview, so sprints ship in
// small batches: one branch and one PR per batch, one commit per sprint.
describe("sprint batching rule", () => {
  const agents = read("AGENTS.md");
  const skill = read(".agents/skills/sprint-workflow/SKILL.md");

  it("AGENTS.md says a batch of sprints shares one branch and one PR", () => {
    expect(agents).toMatch(/batch/i);
    expect(agents).not.toMatch(/One sprint = one `v0\/<id>-<name>` branch = one PR/);
  });

  it("caps a batch and keeps the per-sprint commits on merge", () => {
    expect(agents).toMatch(/three sprints/i);
    expect(skill).toMatch(/--merge/);
    expect(skill).not.toMatch(/gh pr merge <n> --squash/);
  });

  it("keeps the local gates after every sprint and the push gate for the batch", () => {
    expect(skill).toMatch(/after every sprint/i);
    expect(skill).toMatch(/push once/i);
  });
});
