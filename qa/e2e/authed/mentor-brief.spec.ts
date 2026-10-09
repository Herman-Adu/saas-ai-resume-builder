import AxeBuilder from "@axe-core/playwright";
import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

const mentorBrief = {
  roleTests: ["Ownership of an onboarding flow from research to launch."],
  cvGaps: [],
  brushUp: ["Prepare one example of a design decision backed by data."],
};

const job = {
  title: "Product Designer",
  company: "Acme",
  postText: "We are hiring a product designer to own our onboarding. ".repeat(10),
  mentorBrief,
};

test.describe("company mentor brief (signed in)", () => {
  test("a Pro user sees the upgrade note and cannot write a brief", async ({
    account,
  }) => {
    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, { title: "Acme CV", job });

    await page.goto(`/resumes/${resumeId}/mentor-brief`);

    await expect(
      page.getByRole("heading", { name: "Company mentor brief" }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Refresh brief" }),
    ).toBeDisabled();
  });

  test("a Pro Plus user sees the saved brief and can refresh it", async ({
    account,
  }) => {
    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, { title: "Acme CV", job });

    await page.goto(`/resumes/${resumeId}/mentor-brief`);

    await expect(
      page.getByText("Ownership of an onboarding flow from research to launch."),
    ).toBeVisible();
    await expect(
      page.getByText("Your CV already covers what the post asks for."),
    ).toBeVisible();
    await expect(
      page.getByText("Prepare one example of a design decision backed by data."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Refresh brief" }),
    ).toBeEnabled();

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      ),
    ).toEqual([]);
  });

  test("a Pro Plus user with no brief yet is offered to write one", async ({
    account,
  }) => {
    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, {
      title: "Acme CV",
      job: { ...job, mentorBrief: undefined },
    });

    await page.goto(`/resumes/${resumeId}/mentor-brief`);

    await expect(page.getByText("No brief yet.", { exact: false })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Write mentor brief" }),
    ).toBeEnabled();
  });

  test("a resume with no job has no mentor brief page", async ({ account }) => {
    const { page, userId } = await account("proPlus");
    const resumeId = await seedResume(userId, { title: "Base CV", isMaster: true });

    await page.goto(`/resumes/${resumeId}/mentor-brief`);
    await expect(
      page.getByRole("heading", { name: "This page could not be found." }),
    ).toBeVisible();
  });
});
