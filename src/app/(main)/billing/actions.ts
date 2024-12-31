"use server";

import { env } from "@/env";
import stripe from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

export async function createCustomerPortalSession() {
  // get the current user object
  const user = await currentUser();

  // check the user is defined
  if (!user) {
    throw new Error("Unauthorized");
  }

  // get the users customerId stored in the private metadata in clerk
  const stripeCustomerId = user.privateMetadata.stripeCustomerId as
    | string
    | undefined;

  // check we got the stripe customerId from clerk metadata for the user
  if (!stripeCustomerId) {
    throw new Error("Stripe customer ID not found");
  }

  // create a CustomerPortalSession and set the redirect url back to the billing page
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  });

  // check we got a session url, otherwise throw error
  if (!session.url) {
    throw new Error("Failed to create customer portal session");
  }

  // return session url
  return session.url;
}
