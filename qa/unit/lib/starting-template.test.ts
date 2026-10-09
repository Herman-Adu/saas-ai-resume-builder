import { describe, expect, it } from "vitest";
import { startingTemplate } from "@/lib/permissions";

describe("startingTemplate", () => {
  it("lets every plan start on Classic", () => {
    expect(startingTemplate("classic", "free")).toBe("classic");
  });

  it("lets paid plans start on any template", () => {
    expect(startingTemplate("modern", "pro")).toBe("modern");
    expect(startingTemplate("minimal", "pro_plus")).toBe("minimal");
  });

  it("ignores a Pro template for a free user so the first save is not refused", () => {
    expect(startingTemplate("modern", "free")).toBeUndefined();
  });

  it("ignores missing or unknown values", () => {
    expect(startingTemplate(undefined, "pro")).toBeUndefined();
    expect(startingTemplate("fancy", "pro")).toBeUndefined();
    expect(startingTemplate("", "pro")).toBeUndefined();
  });
});
