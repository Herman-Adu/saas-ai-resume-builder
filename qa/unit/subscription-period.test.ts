import { describe, expect, it } from "vitest";
import { getPeriodEnd } from "@/lib/subscription-period";

describe("getPeriodEnd", () => {
  it("reads the billing period end from the first subscription item", () => {
    const subscription = {
      items: { data: [{ current_period_end: 1_800_000_000 }] },
    };

    expect(getPeriodEnd(subscription)).toEqual(new Date(1_800_000_000 * 1000));
  });

  it("throws when the subscription has no items", () => {
    expect(() => getPeriodEnd({ items: { data: [] } })).toThrow(
      /no subscription items/i,
    );
  });
});
