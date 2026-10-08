import { expect, test } from "../support/fixtures";

const notAPdf = {
  name: "cv.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("this is not a pdf"),
};

const fakePdfWithNoText = {
  name: "scan.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4 this is not a real file"),
};

const fiveMegabytes = {
  name: "huge.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(5 * 1024 * 1024)]),
};

test.describe("importing a CV (signed in)", () => {
  test("a Free user sees the upgrade prompt instead of the upload dialog", async ({
    account,
  }) => {
    const { page } = await account("free");

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Import CV from PDF" }).click();

    await expect(page.getByRole("dialog")).toContainText(/upgrade/i);
    await expect(page.getByLabel(/CV file/)).toHaveCount(0);
  });

  test("a Pro user gets the upload dialog with the privacy note", async ({
    account,
  }) => {
    const { page } = await account("pro");

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Import CV from PDF" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(/CV file/)).toBeVisible();
    await expect(dialog).toContainText("never saved");
    await expect(dialog).toContainText("30 days");
    await expect(dialog.getByRole("button", { name: "Import CV" })).toBeDisabled();
  });

  test("a file over 4 MB is refused in the browser", async ({ account }) => {
    const { page } = await account("pro");

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Import CV from PDF" }).click();
    await page.getByLabel(/CV file/).setInputFiles(fiveMegabytes);

    await expect(
      page.getByText("That file is over 4 MB. Choose a smaller PDF.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Import CV" })).toBeDisabled();
  });

  test("a file that is not a PDF is refused by the server", async ({ account }) => {
    const { page } = await account("pro");

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Import CV from PDF" }).click();
    await page.getByLabel(/CV file/).setInputFiles(notAPdf);
    await page.getByRole("button", { name: "Import CV" }).click();

    await expect(
      page.getByText("That file is not a PDF. Export your CV as a PDF and try again.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/resumes$/);
  });

  test("a PDF that cannot be read is refused without creating a resume", async ({
    account,
  }) => {
    const { page } = await account("pro");

    await page.goto("/resumes");
    await page.getByRole("button", { name: "Import CV from PDF" }).click();
    await page.getByLabel(/CV file/).setInputFiles(fakePdfWithNoText);
    await page.getByRole("button", { name: "Import CV" }).click();

    await expect(
      page.getByText("We could not read that PDF. Try exporting it again.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("resume-card")).toHaveCount(0);
  });
});
