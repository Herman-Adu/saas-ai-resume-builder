import { getPlanPrices } from "@/lib/plan-prices";
import { getSession } from "@/lib/session";
import Faq from "./_landing/Faq";
import Features from "./_landing/Features";
import FinalCta from "./_landing/FinalCta";
import Hero from "./_landing/Hero";
import HowItWorks from "./_landing/HowItWorks";
import LandingFooter from "./_landing/LandingFooter";
import LandingHeader from "./_landing/LandingHeader";
import Pricing from "./_landing/Pricing";

export default async function Home() {
  const [session, prices] = await Promise.all([getSession(), getPlanPrices()]);
  const signedIn = Boolean(session);

  return (
    <>
      <LandingHeader signedIn={signedIn} />
      <main>
        <Hero signedIn={signedIn} />
        <HowItWorks />
        <Features />
        <Pricing prices={prices} signedIn={signedIn} />
        <Faq />
        <FinalCta signedIn={signedIn} />
      </main>
      <LandingFooter />
    </>
  );
}
