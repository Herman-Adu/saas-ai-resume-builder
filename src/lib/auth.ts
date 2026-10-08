import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";

const optional = (value: string | undefined) => (value ? [value] : []);
const https = (host: string | undefined) => (host ? [`https://${host}`] : []);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          ...optional(process.env.V0_RUNTIME_URL),
          ...optional(process.env.V0_DEV_APP_URL),
          ...optional(process.env.V0_BUILD_URL),
          ...optional(process.env.V0_SANDBOX_URL),
        ]
      : []),
    ...(process.env.NODE_ENV === "production"
      ? [
          ...https(process.env.VERCEL_URL),
          ...https(process.env.VERCEL_PROJECT_PRODUCTION_URL),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
  // dash() reads BETTER_AUTH_API_KEY from the environment; nextCookies() must stay last.
  plugins: [dash(), nextCookies()],
});
