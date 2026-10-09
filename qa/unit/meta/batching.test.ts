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

// Ledger rows used to ride with the next sprint's PR, so every new batch
// started with unwritten docs and an unrun retro (the S18 to S20 hangover).
describe("batch close-out rule", () => {
  const skill = read(".agents/skills/sprint-workflow/SKILL.md");

  it("writes the ledger rows and the retro inside the batch PR", () => {
    expect(skill).toMatch(/ledger rows? .*(before|in) the (push|batch PR)/i);
    expect(skill).not.toMatch(/rides with the next sprint/i);
  });

  it("ends every batch with a clean-state check and a next-batch proposal", () => {
    expect(skill).toMatch(/Batch close-out/);
    expect(skill).toMatch(/git branch -a/);
    expect(skill).toMatch(/next batch/i);
    expect(skill).toMatch(/confirmed/i);
  });
});
