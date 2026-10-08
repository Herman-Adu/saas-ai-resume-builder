import {
  buildRobots,
  buildSitemap,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";
import { describe, expect, it } from "vitest";

const baseUrl = "https://example.test";

describe("buildSitemap", () => {
  const urls = buildSitemap(baseUrl).map((entry) => entry.url);

  it("lists the public marketing pages", () => {
    expect(urls).toContain("https://example.test/");
    expect(urls).toContain("https://example.test/tos");
  });

  it("never lists signed-in or API routes", () => {
    for (const url of urls) {
      expect(url).not.toMatch(/\/(resumes|billing|editor|api)(\/|$)/);
    }
  });

  it("tolerates a trailing slash on the base url", () => {
    const withSlash = buildSitemap(`${baseUrl}/`).map((entry) => entry.url);
    expect(withSlash).toEqual(urls);
  });
});

describe("buildRobots", () => {
  const robots = buildRobots(baseUrl);

  it("allows the marketing pages and blocks private areas", () => {
    expect(robots.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
    });
    const disallow = (robots.rules as { disallow: string[] }).disallow;
    expect(disallow).toEqual(
      expect.arrayContaining(["/api/", "/resumes", "/billing", "/editor"]),
    );
  });

  it("points crawlers at the sitemap", () => {
    expect(robots.sitemap).toBe("https://example.test/sitemap.xml");
  });
});

describe("buildSoftwareApplicationJsonLd", () => {
  const prices = {
    pro: { label: "£9.99", amount: 9.99, currency: "GBP" },
    pro_plus: { label: "£19.99", amount: 19.99, currency: "GBP" },
  };
  const jsonLd = buildSoftwareApplicationJsonLd({ baseUrl, prices });

  it("describes the app as schema.org SoftwareApplication", () => {
    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Orbit CV",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://example.test/",
    });
  });

  it("has one offer per plan, priced from the catalogue and Stripe", () => {
    expect(jsonLd.offers).toEqual([
      expect.objectContaining({ name: "Free", price: "0", priceCurrency: "GBP" }),
      expect.objectContaining({ name: "Pro", price: "9.99", priceCurrency: "GBP" }),
      expect.objectContaining({
        name: "Pro Plus",
        price: "19.99",
        priceCurrency: "GBP",
      }),
    ]);
  });

  it("leaves out an offer when Stripe could not give a price", () => {
    const partial = buildSoftwareApplicationJsonLd({
      baseUrl,
      prices: { pro: null, pro_plus: prices.pro_plus },
    });
    expect(partial.offers.map((offer) => offer.name)).toEqual([
      "Free",
      "Pro Plus",
    ]);
  });

  it("never claims ratings or reviews that do not exist", () => {
    expect(jsonLd).not.toHaveProperty("aggregateRating");
    expect(jsonLd).not.toHaveProperty("review");
  });
});
