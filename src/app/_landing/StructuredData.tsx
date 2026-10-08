import { env } from "@/env";
import type { PlanPrices } from "@/lib/plan-prices";
import { buildSoftwareApplicationJsonLd } from "@/lib/seo";

export default function StructuredData({ prices }: { prices: PlanPrices }) {
  const jsonLd = buildSoftwareApplicationJsonLd({
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    prices,
  });

  return (
    <script
      type="application/ld+json"
      // "<" is escaped so the JSON can never close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
