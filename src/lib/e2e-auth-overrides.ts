type E2eEnv = Readonly<Record<string, string | undefined>>;

// Only the CI browser tests set the flag. Vercel always sets VERCEL, so a deployment ignores the
// flag even if someone adds it by mistake: production keeps rate limiting and its own origins.
export function e2eAuthOverrides(env: E2eEnv) {
  const runsE2eTests = env.E2E_DISABLE_RATE_LIMIT === "true" && !env.VERCEL;

  return {
    trustedOrigins:
      runsE2eTests && env.NEXT_PUBLIC_BASE_URL ? [env.NEXT_PUBLIC_BASE_URL] : [],
    rateLimit: runsE2eTests ? { enabled: false as const } : undefined,
  };
}
