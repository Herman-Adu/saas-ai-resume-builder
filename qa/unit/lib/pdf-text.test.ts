import { describe, expect, it } from "vitest";
import { looksScanned } from "@/lib/cv-import";
import { extractPdfText } from "@/lib/pdf-text";
import { makeBlankPdf, makeTextPdf, sampleCvLines } from "../support/make-pdf";

describe("extractPdfText", () => {
  it("reads the text out of a real text PDF", async () => {
    const text = await extractPdfText(makeTextPdf(sampleCvLines));

    expect(text).toContain("Jane Doe");
    expect(text).toContain("Senior Software Engineer");
    expect(text).toContain("University of Leeds");
    expect(looksScanned(text)).toBe(false);
  });

  it("finds no usable text in a PDF that has none, so it reads as scanned", async () => {
    const text = await extractPdfText(makeBlankPdf());

    expect(looksScanned(text)).toBe(true);
  });

  it("rejects bytes that are not a readable PDF", async () => {
    await expect(
      extractPdfText(new TextEncoder().encode("%PDF-1.4 this is not a real file")),
    ).rejects.toThrow();
  });
});
