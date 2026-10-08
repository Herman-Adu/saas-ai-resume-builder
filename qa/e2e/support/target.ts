const PRODUCTION_HOSTS = ["saas-ai-resume-builder-seven.vercel.app"];
const RUN_ID = /^[a-z0-9]{4,32}$/;
const E2E_EMAIL = /^e2e-[a-z0-9]{4,32}-[a-z0-9-]+@e2e\.invalid$/;

export const E2E_EMAIL_DOMAIN = "e2e.invalid";

export function assertSafeTarget(
  baseURL: string,
  extraProductionHosts: readonly (string | undefined)[] = [],
): void {
  const { hostname } = new URL(baseURL);
  const blocked = [...PRODUCTION_HOSTS, ...extraProductionHosts].filter(
    (host): host is string => Boolean(host),
  );

  if (blocked.includes(hostname)) {
    throw new Error(
      `Refusing to create test accounts on the production site (${hostname}).`,
    );
  }
}

function assertRunId(runId: string): void {
  if (!RUN_ID.test(runId)) {
    throw new Error(`Invalid e2e run id: "${runId}"`);
  }
}

export function e2eEmail(runId: string, label: string): string {
  assertRunId(runId);
  return `e2e-${runId}-${label}@${E2E_EMAIL_DOMAIN}`;
}

export function e2eEmailPattern(runId: string): string {
  assertRunId(runId);
  return `e2e-${runId}-%@${E2E_EMAIL_DOMAIN}`;
}

export function isE2eEmail(email: string): boolean {
  return E2E_EMAIL.test(email);
}
