import AxeBuilder from "@axe-core/playwright";
import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const skills = ["TypeScript", "SQL"];

test.describe("looks (signed in)", () => {
  test("a Pro Plus user applies a look and it survives a reload", async ({
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
    const skillBlock = page.getByTestId("resume-preview").locator("[data-skill-style]");

    await page.getByRole("button", { name: "Looks" }).click();
    await expect(page.getByRole("button", { name: /^Professional/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("button", { name: /^Classic/ }).click();
    await expect(content).toHaveAttribute("data-font-pair", "serif");
    await expect(content).toHaveAttribute("data-page-background", "plain");
    await expect(skillBlock).toHaveAttribute("data-skill-style", "list");
    await expect(page.getByRole("button", { name: /^Classic/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("button", { name: /^Bold/ }).click();
    await expect(content).toHaveAttribute("data-font-pair", "display");
    await expect(content).toHaveAttribute("data-page-background", "sidebar");

    // Autosave is debounced; wait for the save request itself, not a timer.
    const saved = await page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/editor"),
      { timeout: 30_000 },
    );
    expect(saved.status()).toBe(200);

    await page.reload();
    await expect(content).toHaveAttribute("data-font-pair", "display");
    await expect(content).toHaveAttribute("data-page-background", "sidebar");
    await page.getByRole("button", { name: "Looks" }).click();
    await expect(page.getByRole("button", { name: /^Bold/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("changing one option by hand clears the active look", async ({
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
    await page.getByRole("button", { name: "Looks" }).click();
    await page.getByRole("button", { name: /^Creative/ }).click();
    await expect(page.getByRole("button", { name: /^Creative/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Page style" }).click();
    await page.getByRole("button", { name: "Serif" }).click();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Looks" }).click();
    await expect(page.getByRole("button", { name: /^Creative/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("a free user gets the upgrade prompt instead of the looks", async ({
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
    await page.getByRole("button", { name: "Looks" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Classic/ })).toHaveCount(0);
  });

  test("the editor with looks open has no WCAG A/AA violations", async ({
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
    await page.getByRole("button", { name: "Looks" }).click();
    await page.getByRole("button", { name: /^Bold/ }).click();
    await expect(page.getByRole("button", { name: /^Bold/ })).toBeVisible();

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
