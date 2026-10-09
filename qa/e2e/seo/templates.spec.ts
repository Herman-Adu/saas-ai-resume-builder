import { expect, test } from "@playwright/test";

test("templates page has a title, description and canonical and is indexable", async ({
  page,
}) => {
  await page.goto("/templates");

  await expect(page).toHaveTitle(/templates/i);
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  expect(description?.length ?? 0).toBeGreaterThan(50);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]'),
  ).toHaveCount(0);
});
