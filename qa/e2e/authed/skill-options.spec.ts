import AxeBuilder from "@axe-core/playwright";
import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const skills = ["TypeScript", "SQL"];

test.describe("skill levels and styles (signed in)", () => {
  test("a Pro Plus user adds a level and switches the skills to bars", async ({
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
    const preview = page.getByTestId("resume-preview");
    await expect(preview.locator("[data-skill-style]")).toHaveAttribute(
      "data-skill-style",
      "chips",
    );

    await page.getByRole("button", { name: "Skills", exact: true }).click();
    await page.getByLabel("TypeScript").fill("90");
    await page.getByRole("button", { name: "Skills style" }).click();
    await page.getByRole("button", { name: "Bars" }).click();

    await expect(preview.locator("[data-skill-style]")).toHaveAttribute(
      "data-skill-style",
      "bars",
    );
    await expect(preview.locator("[data-skill-level='90']")).toBeVisible();
    await expect(preview.getByText("SQL")).toBeVisible();
  });

  test("a free user sees disabled levels and the upgrade prompt on the style button", async ({
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
    await page.getByRole("button", { name: "Skills", exact: true }).click();
    await expect(page.getByLabel("TypeScript")).toBeDisabled();

    await page.getByRole("button", { name: "Skills style" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Bars" })).toHaveCount(0);
  });

  test("the editor with the skill style open has no WCAG A/AA violations", async ({
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
    await page.getByRole("button", { name: "Skills style" }).click();
    await expect(page.getByRole("button", { name: "Bars" })).toBeVisible();

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
