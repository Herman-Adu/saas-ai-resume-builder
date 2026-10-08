import { env } from "@/env";
import { formatPrice } from "@/lib/plans";
import stripe from "@/lib/stripe";
import { unstable_cache } from "next/cache";

export interface PlanPrice {
  label: string;
  amount: number;
  currency: string;
}

export interface PlanPrices {
  pro: PlanPrice | null;
  pro_plus: PlanPrice | null;
}

// Errors are thrown out of the cache wrapper so a Stripe outage is never cached.
const fetchMonthlyPrice = unstable_cache(
  async (priceId: string): Promise<PlanPrice> => {
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount === null) {
      throw new Error(`Stripe price ${priceId} has no fixed amount`);
    }
    return {
      label: formatPrice(price.unit_amount, price.currency),
      amount: price.unit_amount / 100,
      currency: price.currency.toUpperCase(),
    };
  },
  ["stripe-monthly-price-v2"],
  { revalidate: 3600 },
);

async function safePrice(priceId: string) {
  try {
    return await fetchMonthlyPrice(priceId);
  } catch (error) {
    console.error("Could not load plan price from Stripe", error);
    return null;
  }
}

export async function getPlanPrices(): Promise<PlanPrices> {
  const [pro, pro_plus] = await Promise.all([
    safePrice(env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY),
    safePrice(env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY),
  ]);
  return { pro, pro_plus };
}

export function isStripeTestMode() {
  return env.STRIPE_SECRET_KEY.startsWith("sk_test_");
}
