import PremiumModal from "@/components/premium/PremiumModal";
import { getSession } from "@/lib/session";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { redirect } from "next/navigation";
import Navbar from "./Navbar";
import SubscriptionLevelProvider from "./SubscriptionLevelProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const userSubscriptionLevel = await getUserSubscriptionLevel(
    session.user.id,
  );

  // wrap main layout in subscription provider to be availaable to all child client component as its where we can access context
  return (
    <SubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
      <div className="flex min-h-screen flex-col">
        <Navbar
          user={{ name: session.user.name, email: session.user.email }}
        />
        {children}
        <PremiumModal />
      </div>
    </SubscriptionLevelProvider>
  );
}
