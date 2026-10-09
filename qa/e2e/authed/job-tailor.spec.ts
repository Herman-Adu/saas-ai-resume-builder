import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

test.describe("tailor to a job (signed in)", () => {
  test("a Free user is shown the upgrade prompt", async ({ account }) => {
    const { page, userId } = await account("free");
    await seedResume(userId, { title: "Base CV", isMaster: true });

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Tailor to a job" }).click();
    await expect(
      page.getByRole("heading", { name: "Upgrade Orbit CV" }),
    ).toBeVisible();
  });

  test("a Pro user cannot analyse until the job post is long enough", async ({
    account,
  }) => {
    const { page, userId } = await account("pro");
    await seedResume(userId, { title: "Base CV", isMaster: true });

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Tailor to a job" }).click();

    const analyse = page.getByRole("button", { name: "Analyse job" });
    await expect(analyse).toBeDisabled();

    await page.getByLabel("Job post").fill("Too short");
    await expect(analyse).toBeDisabled();

    await page
      .getByLabel("Job post")
      .fill("We are hiring a product designer to own our onboarding. ".repeat(10));
    await expect(analyse).toBeEnabled();
  });
});
