import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}
