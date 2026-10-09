import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

async function uploadPhoto(page: Page) {
  await page.getByRole("button", { name: "Personal info" }).click();
  await page.getByLabel("Your photo").setInputFiles({
    name: "me.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });
  await expect(page.getByAltText("Author photo")).toBeVisible();
}

test.describe("photo options (signed in)", () => {
  test("a Pro Plus user changes the photo shape, side and size in the preview", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await uploadPhoto(page);
    const photo = page.getByTestId("resume-preview").getByAltText("Author photo");
    await expect(photo).toHaveAttribute("data-photo-position", "left");

    await page.getByRole("button", { name: "Photo options" }).click();
    await page.getByRole("button", { name: "Circle" }).click();
    await page.getByRole("button", { name: "Right" }).click();
    await page.getByRole("button", { name: "Large" }).click();

    await expect(photo).toHaveAttribute("data-photo-shape", "circle");
    await expect(photo).toHaveAttribute("data-photo-position", "right");
    await expect(photo).toHaveAttribute("width", "132");
  });

  test("a free user gets the upgrade prompt instead of the photo options", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("free");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await page.getByRole("button", { name: "Photo options" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Circle" })).toHaveCount(0);
  });

  test("the editor with the photo options open has no WCAG A/AA violations", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await page.getByRole("button", { name: "Photo options" }).click();
    await expect(page.getByRole("button", { name: "Circle" })).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });
});
