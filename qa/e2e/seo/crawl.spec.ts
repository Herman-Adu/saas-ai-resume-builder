import { expect, test } from "@playwright/test";

test("sitemap.xml lists the public pages", async ({ request }) => {
  const response = await request.get("/sitemap.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/xml/);
  const body = await response.text();
  expect(body).toMatch(/<loc>[^<]+\/<\/loc>/);
  expect(body).toMatch(/<loc>[^<]+\/tos<\/loc>/);
  expect(body).not.toMatch(/\/(resumes|billing|editor)/);
});

test("robots.txt blocks private areas and links the sitemap", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");

  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/User-Agent: \*/i);
  expect(body).toMatch(/Disallow: \/resumes/);
  expect(body).toMatch(/Disallow: \/billing/);
  expect(body).toMatch(/Disallow: \/api\//);
  expect(body).toMatch(/Sitemap: .+\/sitemap\.xml/);
});

test("home exposes valid SoftwareApplication JSON-LD", async ({ page }) => {
  await page.goto("/");

  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);

  const data = JSON.parse((await scripts.first().textContent()) ?? "");
  expect(data["@context"]).toBe("https://schema.org");
  expect(data["@type"]).toBe("SoftwareApplication");
  expect(data.name).toBe("Orbit CV");
  expect(data.offers.map((offer: { name: string }) => offer.name)).toContain(
    "Free",
  );
  expect(JSON.stringify(data)).not.toMatch(/aggregateRating/);
});

test("public auth and legal pages are indexable or deliberately not", async ({
  page,
}) => {
  await page.goto("/tos");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);

  await page.goto("/sign-in");
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
});
