import { expect, test } from "@playwright/test";

const templates = ["classic", "modern", "compact", "minimal"];

test.describe("template gallery (signed out)", () => {
  test("is public and shows all four templates with sample CVs", async ({
    page,
  }) => {
    const response = await page.goto("/templates");
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/templates");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const template of templates) {
      await expect(
        page.locator(`[data-testid="resume-preview"][data-template="${template}"]`),
      ).toBeVisible();
    }
  });

  test("each card links to sign-up carrying the template", async ({ page }) => {
    await page.goto("/templates");
    for (const template of templates) {
      await expect(
        page.getByRole("link", { name: new RegExp(`use the ${template} template`, "i") }),
      ).toHaveAttribute("href", `/sign-up?template=${template}`);
    }
  });

  test("switching the sample person changes the CV on every template", async ({
    page,
  }) => {
    await page.goto("/templates");
    const first = await page.getByTestId("resume-preview").first().innerText();
    await page.getByRole("tab", { name: /nurse/i }).click();
    await expect
      .poll(() => page.getByTestId("resume-preview").first().innerText())
      .not.toBe(first);
  });

  test("the landing page links to the gallery", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /^templates$/i }).first(),
    ).toHaveAttribute("href", "/templates");
  });

  test("sign-up keeps a valid template and drops an unknown one", async ({
    page,
  }) => {
    await page.goto("/sign-up?template=modern");
    await expect(page.getByTestId("signup-template")).toHaveText(/modern/i);
    await page.goto("/sign-up?template=fancy");
    await expect(page.getByTestId("signup-template")).toHaveCount(0);
  });
});
