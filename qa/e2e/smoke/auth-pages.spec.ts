import { expect, test } from "@playwright/test";

test.describe("email and password pages (signed out)", () => {
  test("sign-in shows an email and password form", async ({ page }) => {
    const response = await page.goto("/sign-in");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: /create an account|sign up/i })).toBeVisible();
  });

  test("sign-up shows a name, email and password form", async ({ page }) => {
    const response = await page.goto("/sign-up");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("a protected page sends signed-out visitors to sign-in", async ({ page }) => {
    await page.goto("/resumes");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("sign-in with wrong details shows a generic error", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("not-a-real-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText(/invalid email or password/i);
  });
});
