"use server";

import { env } from "@/env";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import stripe from "@/lib/stripe";

export async function createCheckoutSession(priceId: string) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { id: userId, email } = session.user;

  const existingSubscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });
  const stripeCustomerId = existingSubscription?.stripeCustomerId;

  const checkout = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${env.NEXT_PUBLIC_BASE_URL}/billing/success`,
    cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : email,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: `I have read Orbit CV's [terms of service](${env.NEXT_PUBLIC_BASE_URL}/tos) and agree to them.`,
      },
    },
    consent_collection: {
      terms_of_service: "required",
    },
  });

  if (!checkout.url) {
    throw new Error("Failed to create checkout session");
  }

  return checkout.url;
}
