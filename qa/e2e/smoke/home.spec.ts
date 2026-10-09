import { expect, test } from "@playwright/test";

test.describe("home (signed out)", () => {
  test("loads with one h1 and a sign-up call to action", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const cta = page.getByRole("link", { name: /start free/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/sign-up");
  });

  test("renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("shows the brand and never the old copy", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByText("Orbit CV").first(),
    ).toBeVisible();
    await expect(page.getByText(/not very smart/i)).toHaveCount(0);
  });

  test("has every section and an anchor link to each", async ({ page }) => {
    await page.goto("/");

    for (const id of ["how-it-works", "features", "pricing", "faq"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
      await expect(
        page.getByRole("banner").locator(`a[href="/#${id}"]`),
      ).toHaveCount(1);
    }
  });

  test("shows the three plans with the right calls to action", async ({
    page,
  }) => {
    await page.goto("/");
    const pricing = page.locator("#pricing");

    for (const name of ["Free", "Pro", "Pro Plus"]) {
      await expect(
        pricing.getByRole("heading", { name, exact: true }),
      ).toBeVisible();
    }

    // Role queries skip the hidden copy Next streams in before the page swaps it, so these retry
    // instead of failing a strict-mode check on a slow CI run.
    await expect(
      pricing.getByRole("listitem").filter({ hasText: "Up to 3 resumes" }),
    ).toBeVisible();
    await expect(
      pricing.getByRole("listitem").filter({ hasText: /^Unlimited resumes$/ }),
    ).toBeVisible();
    await expect(pricing.getByRole("link", { name: /^get /i })).toHaveCount(3);
    for (const link of await pricing
      .getByRole("link", { name: /^get /i })
      .all()) {
      await expect(link).toHaveAttribute("href", "/sign-up");
    }
  });

  test("FAQ answers open and close", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("#faq details").first();
    await expect(first).not.toHaveAttribute("open", "");
    await first.getByRole("group").or(first.locator("summary")).first().click();
    await expect(first).toHaveAttribute("open", "");
  });

  test("footer links to terms and sign in", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(
      footer.getByRole("link", { name: "Terms of service" }),
    ).toHaveAttribute("href", "/tos");
    await expect(footer.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  test("does not scroll sideways on a 360px phone", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
