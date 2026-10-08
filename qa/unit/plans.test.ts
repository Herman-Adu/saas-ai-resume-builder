import { describe, expect, it } from "vitest";
import {
  canCreateResume,
  canUseAITools,
  canUseCustomizations,
} from "@/lib/permissions";
import { formatPrice, planFeatures, plans } from "@/lib/plans";

describe("formatPrice", () => {
  it("formats minor units as pounds", () => {
    expect(formatPrice(999, "gbp")).toBe("£9.99");
    expect(formatPrice(1999, "GBP")).toBe("£19.99");
  });
});

describe("plan catalogue", () => {
  it("lists free, pro and pro_plus in order", () => {
    expect(plans.map((plan) => plan.id)).toEqual(["free", "pro", "pro_plus"]);
  });

  it.each(plans)("$id limits match what permissions.ts enforces", (plan) => {
    expect(canUseAITools(plan.id)).toBe(plan.aiTools);
    expect(canUseCustomizations(plan.id)).toBe(plan.customizations);

    if (Number.isFinite(plan.resumeLimit)) {
      expect(canCreateResume(plan.id, plan.resumeLimit - 1)).toBe(true);
      expect(canCreateResume(plan.id, plan.resumeLimit)).toBe(false);
    } else {
      expect(canCreateResume(plan.id, 10_000)).toBe(true);
    }
  });
});

describe("planFeatures", () => {
  const byId = (id: string) => {
    const plan = plans.find((candidate) => candidate.id === id);
    if (!plan) throw new Error(`missing plan ${id}`);
    return planFeatures(plan);
  };

  it("states the resume limit for each plan", () => {
    expect(byId("free")).toContain("1 resume");
    expect(byId("pro")).toContain("Up to 3 resumes");
    expect(byId("pro_plus")).toContain("Unlimited resumes");
  });

  it("only promises AI writing from pro up", () => {
    expect(byId("free").join(" ")).not.toMatch(/AI/);
    expect(byId("pro").join(" ")).toMatch(/AI/);
  });

  it("only promises CV import from pro up, because it runs the AI", () => {
    expect(byId("free").join(" ")).not.toMatch(/import/i);
    expect(byId("pro").join(" ")).toMatch(/import your CV/i);
    expect(byId("pro_plus").join(" ")).toMatch(/import your CV/i);
  });

  it("only promises design customisation on pro_plus", () => {
    expect(byId("pro").join(" ")).not.toMatch(/customis/i);
    expect(byId("pro_plus").join(" ")).toMatch(/customis/i);
  });
});
