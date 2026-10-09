import type { MetadataRoute } from "next";
import type { PlanPrices } from "./plan-prices";
import { plans } from "./plans";

const publicPaths = ["/", "/templates", "/tos"] as const;
const privatePaths = ["/api/", "/resumes", "/billing", "/editor"];

function origin(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export function buildSitemap(baseUrl: string): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${origin(baseUrl)}${path}`,
    changeFrequency: path === "/" ? "weekly" : "yearly",
    priority: path === "/" ? 1 : 0.3,
  }));
}

export function buildRobots(baseUrl: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: privatePaths },
    sitemap: `${origin(baseUrl)}/sitemap.xml`,
  };
}

interface Offer {
  "@type": "Offer";
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
}

export function buildSoftwareApplicationJsonLd({
  baseUrl,
  prices,
}: {
  baseUrl: string;
  prices: PlanPrices;
}) {
  const offers = plans.flatMap((plan): Offer[] => {
    const base = {
      "@type": "Offer" as const,
      name: plan.name,
      description: plan.blurb,
    };
    if (plan.id === "free") {
      return [{ ...base, price: "0", priceCurrency: "GBP" }];
    }
    const price = plan.id === "pro" ? prices.pro : prices.pro_plus;
    return price
      ? [
          {
            ...base,
            price: String(price.amount),
            priceCurrency: price.currency,
          },
        ]
      : [];
  });

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Orbit CV",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${origin(baseUrl)}/`,
    description:
      "AI resume builder with a live preview, autosave and print-ready PDF export.",
    offers,
  };
}
