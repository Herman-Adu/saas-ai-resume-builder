import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

test.describe("tailoring (signed in)", () => {
  test("a Pro user marks a master, tailors it and sees both resumes", async ({
    account,
  }) => {
    const { page, userId } = await account("pro");
    await seedResume(userId, { title: "Base CV" });

    await page.goto("/resumes");
    const base = page.getByTestId("resume-card").filter({ hasText: "Base CV" });
    await base.getByRole("button", { name: "Resume options" }).click();
    await page.getByRole("menuitem", { name: "Mark as master" }).click();
    await expect(base.getByText("Master", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Tailor master resume" }).click();
    await page.getByLabel("Tailored for").fill("Acme, Product Designer");
    await page.getByRole("button", { name: "Create tailored resume" }).click();
    await expect(page).toHaveURL(/\/editor\?resumeId=/, { timeout: 20_000 });

    await page.goto("/resumes");
    const copy = page
      .getByTestId("resume-card")
      .filter({ hasText: "Acme, Product Designer" });
    await expect(copy.getByText("Tailored", { exact: true })).toBeVisible();
    await expect(base.getByText("Master", { exact: true })).toBeVisible();
  });

  test("a Free user is shown the upgrade prompt instead of Tailor", async ({
    account,
  }) => {
    const { page, userId } = await account("free");
    await seedResume(userId, { title: "Base CV" });

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Tailor master resume" }).click();
    await expect(
      page.getByRole("heading", { name: "Upgrade Orbit CV" }),
    ).toBeVisible();
  });

  test("a Pro user at the tailored limit is shown the upgrade prompt", async ({
    account,
  }) => {
    const { page, userId } = await account("pro");
    await seedResume(userId, { title: "Base CV", isMaster: true });
    for (let i = 1; i <= 10; i++) {
      await seedResume(userId, { title: `Tailored ${i}`, isTailored: true });
    }

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Tailor master resume" }).click();
    await expect(
      page.getByRole("heading", { name: "Upgrade Orbit CV" }),
    ).toBeVisible();
  });

  test("a Pro Plus user can keep tailoring past ten copies", async ({
    account,
  }) => {
    const { page, userId } = await account("proPlus");
    await seedResume(userId, { title: "Base CV", isMaster: true });
    for (let i = 1; i <= 10; i++) {
      await seedResume(userId, { title: `Tailored ${i}`, isTailored: true });
    }

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Tailor master resume" }).click();
    await page.getByLabel("Tailored for").fill("Eleventh application");
    await page.getByRole("button", { name: "Create tailored resume" }).click();
    await expect(page).toHaveURL(/\/editor\?resumeId=/, { timeout: 20_000 });
  });

  test("hiding a bullet removes it from the preview but keeps it in the editor", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, {
      title: "Base CV",
      workExperiences: [
        {
          position: "Designer",
          company: "Acme",
          bullets: [
            { text: "Led the rebrand", hidden: false },
            { text: "Ran weekly critiques", hidden: false },
          ],
        },
      ],
    });

    await page.goto(`/editor?resumeId=${resumeId}&step=work-experience`);
    const preview = page.getByTestId("resume-preview");
    await expect(preview.getByText("Led the rebrand")).toBeVisible();

    await page.getByRole("button", { name: "Hide bullet 1" }).click();

    await expect(preview.getByText("Led the rebrand")).toHaveCount(0);
    await expect(preview.getByText("Ran weekly critiques")).toBeVisible();
    await expect(page.getByRole("button", { name: "Show bullet 1" })).toBeVisible();
  });
});
