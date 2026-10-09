import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { E2E_EMAIL_DOMAIN, e2eEmailPattern } from "./target";

export type Tier = "free" | "pro" | "proPlus";

let pool: Pool | undefined;

function getPool(): Pool {
  pool ??= new Pool({
    connectionString:
      process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_PRISMA_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  return pool;
}

export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
}

const priceIds: Record<Exclude<Tier, "free">, string | undefined> = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
  proPlus: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY,
};

export async function giveSubscription(userId: string, tier: Tier): Promise<void> {
  if (tier === "free") return;

  const priceId = priceIds[tier];
  if (!priceId) {
    throw new Error(`No Stripe price id in the environment for the ${tier} tier.`);
  }

  await getPool().query(
    `INSERT INTO user_subscriptions
       (id, "userId", "stripeCustomerId", "stripeSubscriptionId", "stripePriceId",
        "stripeCurrentPeriodEnd", "stripeCancelAtPeriodEnd", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, now() + interval '30 days', false, now())`,
    [randomUUID(), userId, `cus_e2e_${userId}`, `sub_e2e_${userId}`, priceId],
  );
}

interface SeedWorkExperience {
  position: string;
  company: string;
  bullets: { text: string; hidden: boolean }[];
}

interface SeedJob {
  title: string;
  company: string;
  postText: string;
  coverLetter?: string;
}

interface SeedResume {
  title: string;
  isMaster?: boolean;
  isTailored?: boolean;
  job?: SeedJob;
  workExperiences?: SeedWorkExperience[];
}

async function seedJob(userId: string, job: SeedJob): Promise<string> {
  const jobId = randomUUID();
  const db = getPool();

  await db.query(
    `INSERT INTO jobs (id, "userId", title, company, "postText")
     VALUES ($1, $2, $3, $4, $5)`,
    [jobId, userId, job.title, job.company, job.postText],
  );

  if (job.coverLetter) {
    await db.query(
      `INSERT INTO cover_letters (id, "userId", "jobId", body, "updatedAt")
       VALUES ($1, $2, $3, $4, now())`,
      [randomUUID(), userId, jobId, job.coverLetter],
    );
  }

  return jobId;
}

export async function seedResume(userId: string, resume: SeedResume): Promise<string> {
  const id = randomUUID();
  const db = getPool();
  const jobId = resume.job ? await seedJob(userId, resume.job) : null;

  await db.query(
    `INSERT INTO resumes
       (id, "userId", title, "isMaster", "isTailored", "jobId", skills, "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, ARRAY[]::text[], now())`,
    [
      id,
      userId,
      resume.title,
      resume.isMaster ?? false,
      resume.isTailored ?? Boolean(resume.job),
      jobId,
    ],
  );

  for (const [index, work] of (resume.workExperiences ?? []).entries()) {
    await db.query(
      `INSERT INTO work_experiences
         (id, "resumeId", position, company, bullets, "sortOrder", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, now())`,
      [randomUUID(), id, work.position, work.company, JSON.stringify(work.bullets), index],
    );
  }

  return id;
}

async function deleteUsersWhere(condition: string, params: unknown[]): Promise<void> {
  const db = getPool();
  const ids = `SELECT id FROM "user" WHERE ${condition}`;

  await db.query(`DELETE FROM resumes WHERE "userId" IN (${ids})`, params);
  await db.query(`DELETE FROM cover_letter_runs WHERE "userId" IN (${ids})`, params);
  await db.query(`DELETE FROM jobs WHERE "userId" IN (${ids})`, params);
  await db.query(`DELETE FROM cv_imports WHERE "userId" IN (${ids})`, params);
  await db.query(`DELETE FROM user_subscriptions WHERE "userId" IN (${ids})`, params);
  await db.query(`DELETE FROM "user" WHERE ${condition}`, params);
}

export async function deleteRunUsers(runId: string): Promise<void> {
  await deleteUsersWhere("email LIKE $1", [e2eEmailPattern(runId)]);
}

// Catches accounts left behind by a run that was killed before its cleanup.
export async function deleteStaleE2eUsers(): Promise<void> {
  await deleteUsersWhere(
    `email LIKE $1 AND "createdAt" < now() - interval '2 hours'`,
    [`e2e-%@${E2E_EMAIL_DOMAIN}`],
  );
}
