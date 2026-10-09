import AxeBuilder from "@axe-core/playwright";
import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const skills = ["TypeScript", "SQL"];

test.describe("page background and fonts (signed in)", () => {
  test("a Pro Plus user picks a background and a font pairing", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, {
      title: "Base CV",
      template: "modern",
      skills,
    });

    await page.goto(`/editor?resumeId=${resumeId}`);
    const content = page.getByTestId("resume-preview").locator("#resumePreviewContent");
    await expect(content).toHaveAttribute("data-page-background", "plain");
    await expect(content).toHaveAttribute("data-font-pair", "default");

    await page.getByRole("button", { name: "Page style" }).click();
    await page.getByRole("button", { name: "Tint" }).click();
    await page.getByRole("button", { name: "Serif" }).click();

    await expect(content).toHaveAttribute("data-page-background", "tint");
    await expect(content).toHaveAttribute("data-font-pair", "serif");
  });

  test("a free user gets the upgrade prompt instead of the options", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("free");
    const resumeId = await seedResume(userId, {
      title: "Base CV",
      template: "modern",
      skills,
    });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await page.getByRole("button", { name: "Page style" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tint" })).toHaveCount(0);
  });

  test("the editor with page style open has no WCAG A/AA violations", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, {
      title: "Base CV",
      template: "modern",
      skills,
    });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await page.getByRole("button", { name: "Page style" }).click();
    await page.getByRole("button", { name: "Tint" }).click();
    await expect(page.getByRole("button", { name: "Tint" })).toBeVisible();

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
