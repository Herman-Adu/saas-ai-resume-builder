import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const job = {
  title: "Product Designer",
  company: "Acme",
  postText: "We are hiring a product designer to own our onboarding. ".repeat(10),
};

test.describe("cover letter (signed in)", () => {
  test("a Free user sees the upgrade note and cannot draft", async ({ account }) => {
    const { page, userId } = await account("free");
    const resumeId = await seedResume(userId, { title: "Acme CV", job });

    await page.goto(`/resumes/${resumeId}/cover-letter`);

    await expect(page.getByRole("heading", { name: "Cover letter" })).toBeVisible();
    await expect(page.getByRole("status")).toBeVisible();
    await expect(page.getByRole("button", { name: "Draft with AI" })).toBeDisabled();
  });

  test("a Pro user sees a saved letter and can print it", async ({ account }) => {
    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, {
      title: "Acme CV",
      job: { ...job, coverLetter: "Dear Acme, I would love to join." },
    });

    await page.goto(`/resumes/${resumeId}/cover-letter`);

    await expect(page.getByLabel("Your letter")).toHaveValue(
      "Dear Acme, I would love to join.",
    );
    await expect(page.getByRole("button", { name: "Redraft with AI" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Save letter" })).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Print or save as PDF" }),
    ).toBeEnabled();

    await page.getByLabel("Your letter").fill("Dear Acme, I am keen to join.");
    await page.getByRole("button", { name: "Save letter" }).click();
    await expect(
      page.getByText("Cover letter saved.", { exact: true }),
    ).toBeVisible();
  });

  test("a resume with no job has no cover letter page", async ({ account }) => {
    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, { title: "Base CV", isMaster: true });

    await page.goto(`/resumes/${resumeId}/cover-letter`);
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
  });
});
