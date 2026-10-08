import { seedResume } from "../support/db";
import { expect, test } from "../support/fixtures";

test.describe("more sections (signed in)", () => {
  test("entries added in the form appear in the preview and survive a reload", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}&step=more-sections`);
    const preview = page.getByTestId("resume-preview");

    const languages = page.getByRole("region", { name: "Languages" });
    await languages.getByRole("button", { name: "Add language" }).click();
    await languages.getByRole("textbox", { name: "Language", exact: true }).fill("French");
    await languages.getByRole("textbox", { name: "Level", exact: true }).fill("Fluent");

    const links = page.getByRole("region", { name: "Links" });
    await links.getByRole("button", { name: "Add link" }).click();
    await links.getByRole("textbox", { name: "Label", exact: true }).fill("Portfolio");
    await links
      .getByRole("textbox", { name: "Address", exact: true })
      .fill("https://example.com/me");

    await expect(preview.getByText("French")).toBeVisible();
    await expect(preview.getByText("Portfolio")).toBeVisible();

    // Autosave is debounced; wait for the save request itself, not a timer.
    const saved = await page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/editor"),
      { timeout: 30_000 },
    );
    expect(saved.status()).toBe(200);
    await page.reload();

    await expect(
      page
        .getByRole("region", { name: "Languages" })
        .getByRole("textbox", { name: "Language", exact: true }),
    ).toHaveValue("French");
    await expect(page.getByTestId("resume-preview").getByText("Portfolio")).toBeVisible();
  });

  test("hiding an entry and hiding a section remove them from the preview only", async ({
    account,
    isMobile,
  }) => {
    test.skip(isMobile, "The live preview is not shown beside the form on phones");

    const { page, userId } = await account("pro");
    const resumeId = await seedResume(userId, { title: "Base CV" });

    await page.goto(`/editor?resumeId=${resumeId}&step=more-sections`);
    const preview = page.getByTestId("resume-preview");

    const languages = page.getByRole("region", { name: "Languages" });
    await languages.getByRole("button", { name: "Add language" }).click();
    const languageName = languages.getByRole("textbox", {
      name: "Language",
      exact: true,
    });
    await languageName.fill("German");
    await expect(preview.getByText("German")).toBeVisible();

    await languages.getByRole("button", { name: "Hide language 1" }).click();
    await expect(preview.getByText("German")).toHaveCount(0);
    await expect(languageName).toHaveValue("German");

    await languages.getByRole("button", { name: "Show language 1" }).click();
    await expect(preview.getByText("German")).toBeVisible();

    await languages.getByRole("button", { name: "Hide languages" }).click();
    await expect(preview.getByText("German")).toHaveCount(0);
    await expect(
      languages.getByRole("button", { name: "Show languages" }),
    ).toBeVisible();
  });
});
