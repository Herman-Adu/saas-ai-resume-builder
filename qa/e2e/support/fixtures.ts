import { randomBytes } from "node:crypto";
import { test as base, type Page } from "@playwright/test";
import {
  deleteRunUsers,
  deleteStaleE2eUsers,
  giveSubscription,
  type Tier,
} from "./db";
import { assertSafeTarget, e2eEmail } from "./target";

export interface Account {
  page: Page;
  userId: string;
  email: string;
}

interface Fixtures {
  account: (tier: Tier) => Promise<Account>;
}

const PASSWORD = "E2e-test-password-1!";
let sweptStaleUsers = false;

export const test = base.extend<Fixtures>({
  account: async ({ context, page, baseURL }, provide) => {
    if (!baseURL) throw new Error("A baseURL is required for signed-in tests.");
    assertSafeTarget(baseURL, [process.env.VERCEL_PROJECT_PRODUCTION_URL]);

    const runId = randomBytes(6).toString("hex");

    await provide(async (tier) => {
      if (!sweptStaleUsers) {
        sweptStaleUsers = true;
        await deleteStaleE2eUsers();
      }

      const email = e2eEmail(runId, tier.toLowerCase());
      const response = await context.request.post("/api/auth/sign-up/email", {
        data: { name: `E2E ${tier}`, email, password: PASSWORD },
        headers: { origin: baseURL },
      });
      if (!response.ok()) {
        throw new Error(`Sign-up failed (${response.status()}): ${await response.text()}`);
      }

      const { user } = (await response.json()) as { user: { id: string } };
      await giveSubscription(user.id, tier);

      return { page, userId: user.id, email };
    });

    await deleteRunUsers(runId);
  },
});

export { expect } from "@playwright/test";
