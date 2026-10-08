import { expect, test } from "@playwright/test";

test("home has a title, description and language", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/.{10,}/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /.{50,}/,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
