import { expect, test } from "@playwright/test";

test("home has a title, description and language", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Orbit CV/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /.{50,}/,
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("home has share-card metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Orbit CV/,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /.{50,}/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("home sets a theme colour", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveCount(1);
});
