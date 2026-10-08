import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const templates = ["classic", "modern", "compact", "minimal"] as const;

async function chooseTemplate(page: Page, template: string) {
  const option = page.getByTestId(`template-option-${template}`);
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Change template" }).click();
  await expect(option).toBeVisible();
  await option.click();
}

test.describe("templates (signed in)", () => {
  test("a free user can use Classic only; the others open the upgrade prompt", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("free");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}`);
    const preview = page.getByTestId("resume-preview");
    await expect(preview).toHaveAttribute("data-template", "classic");

    await page.getByRole("button", { name: "Change template" }).click();
    await expect(page.getByTestId("template-option-classic")).toHaveAttribute(
      "data-locked",
      "false",
    );
    for (const locked of ["modern", "compact", "minimal"]) {
      await expect(page.getByTestId(`template-option-${locked}`)).toHaveAttribute(
        "data-locked",
        "true",
      );
    }

    await page.getByTestId("template-option-modern").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(preview).toHaveAttribute("data-template", "classic");
  });

  test("a pro user switches template and it survives a reload", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await chooseTemplate(page, "modern");
    await expect(page.getByTestId("resume-preview")).toHaveAttribute(
      "data-template",
      "modern",
    );

    // Autosave is debounced; wait for the save request itself, not a timer.
    const saved = await page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/editor"),
      { timeout: 30_000 },
    );
    expect(saved.status()).toBe(200);

    await page.reload();
    await expect(page.getByTestId("resume-preview")).toHaveAttribute(
      "data-template",
      "modern",
    );
  });

  test("hidden content stays out of every template", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, {
      title: "Base CV",
      workExperiences: [
        {
          position: "Lead Engineer",
          company: "Acme",
          bullets: [
            { text: "Shipped the engine", hidden: false },
            { text: "Secret sauce", hidden: true },
          ],
        },
      ],
    });

    await page.goto(`/editor?resumeId=${resumeId}`);
    const preview = page.getByTestId("resume-preview");

    for (const template of templates) {
      if (template !== "classic") await chooseTemplate(page, template);
      await expect(preview).toHaveAttribute("data-template", template);
      await expect(preview.getByText("Shipped the engine")).toBeVisible();
      await expect(preview.getByText("Secret sauce")).toHaveCount(0);
    }
  });

  test("the editor with the template menu open has no WCAG A/AA violations", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}`);
    await page.getByRole("button", { name: "Change template" }).click();
    await expect(page.getByTestId("template-option-minimal")).toBeVisible();

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
