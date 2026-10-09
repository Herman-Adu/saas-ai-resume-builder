import { describe, expect, it } from "vitest";
import {
  parsePhotoPosition,
  parsePhotoShape,
  parsePhotoSize,
  photoPixels,
  photoPositions,
  photoRadius,
  photoShapes,
  photoSizes,
} from "@/lib/photo-options";

describe("photo options catalogue", () => {
  it("offers three shapes, two sides and three sizes", () => {
    expect(photoShapes).toEqual(["circle", "squircle", "square"]);
    expect(photoPositions).toEqual(["left", "right"]);
    expect(photoSizes).toEqual(["small", "medium", "large"]);
  });
});

describe("parsePhotoShape", () => {
  it("uses the chosen shape when it is valid", () => {
    expect(parsePhotoShape("square", "circle")).toBe("square");
  });

  it("falls back to the old border style so existing CVs look the same", () => {
    expect(parsePhotoShape(null, "circle")).toBe("circle");
    expect(parsePhotoShape(undefined, "square")).toBe("square");
  });

  it("falls back to squircle when neither value is known", () => {
    expect(parsePhotoShape("hexagon", "triangle")).toBe("squircle");
    expect(parsePhotoShape(undefined, undefined)).toBe("squircle");
  });
});

describe("parsePhotoPosition and parsePhotoSize", () => {
  it("accepts known values", () => {
    expect(parsePhotoPosition("right")).toBe("right");
    expect(parsePhotoSize("large")).toBe("large");
  });

  it("defaults to left and medium for anything unknown", () => {
    expect(parsePhotoPosition("centre")).toBe("left");
    expect(parsePhotoPosition(null)).toBe("left");
    expect(parsePhotoSize("huge")).toBe("medium");
    expect(parsePhotoSize(undefined)).toBe("medium");
  });
});

describe("photoRadius and photoPixels", () => {
  it("maps each shape to a corner radius", () => {
    expect(photoRadius("square")).toBe("0px");
    expect(photoRadius("circle")).toBe("9999px");
    expect(photoRadius("squircle")).toBe("10%");
  });

  it("keeps the medium size at the 100px the CVs use today", () => {
    expect(photoPixels("medium")).toBe(100);
    expect(photoPixels("small")).toBeLessThan(100);
    expect(photoPixels("large")).toBeGreaterThan(100);
  });
});
