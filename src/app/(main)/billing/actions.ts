"use server";

import { env } from "@/env";
import prisma from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";
import stripe from "@/lib/stripe";

export async function createCustomerPortalSession() {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (!subscription) {
    throw new Error("Stripe customer ID not found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  });

  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  return session.url;
}
