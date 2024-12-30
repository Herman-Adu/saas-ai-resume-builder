import PremiumModal from "@/components/premium/PremiumModal";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import Navbar from "./Navbar";
import SubscriptionLevelProvider from "./SubscriptionLevelProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  //get the user
  const { userId } = await auth();

  // check we got a user
  if (!userId) {
    return null;
  }

  // get user subscsription level
  const userSubscriptionLevel = await getUserSubscriptionLevel(userId);

  // wrap main layout in subscription provider to be availaable to all child client component as its where we can access context
  return (
    <SubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {children}
        <PremiumModal />
      </div>
    </SubscriptionLevelProvider>
  );
}
