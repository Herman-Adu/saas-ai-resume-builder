import { Button } from "@/components/ui/button";
import { planFeatures, plans } from "@/lib/plans";
import type { PlanPrices } from "@/lib/plan-prices";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingProps {
  prices: PlanPrices;
  signedIn: boolean;
}

export default function Pricing({ prices, signedIn }: PricingProps) {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="border-y bg-card/50"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2
          id="pricing-title"
          className="max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Start free. Upgrade when you need more.
        </h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Prices are monthly. Cancel any time from your billing page.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const price =
              plan.id === "free"
                ? "£0"
                : (plan.id === "pro" ? prices.pro : prices.pro_plus)?.label;
            const recommended = plan.id === "pro";

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col gap-6 rounded-lg border bg-card p-6",
                  recommended && "border-primary ring-1 ring-primary",
                )}
              >
                {recommended && (
                  <p className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Recommended
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-2xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground">{plan.blurb}</p>
                </div>

                <p className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">
                    {price ?? "See at checkout"}
                  </span>
                  {price && plan.id !== "free" && (
                    <span className="text-muted-foreground">/ month</span>
                  )}
                </p>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {planFeatures(plan).map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={recommended ? "default" : "outline"}
                  size="lg"
                >
                  <Link href={signedIn ? "/billing" : "/sign-up"}>
                    Get {plan.name}
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
