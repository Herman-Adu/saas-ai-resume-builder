import { z } from "zod";

export const bulletSchema = z.object({
  text: z.string().trim().max(1000),
  hidden: z.boolean(),
});

export type Bullet = z.infer<typeof bulletSchema>;

const storedBulletsSchema = z.array(
  z.object({
    text: z.string(),
    hidden: z.boolean().default(false),
  }),
);

const LIST_MARKER = /^(?:[-\u2022*\u2013]|\d+[.)])\s+/;

export function descriptionToBullets(
  description: string | null | undefined,
): Bullet[] {
  if (!description || !description.trim()) return [];
  return [{ text: description, hidden: false }];
}

export function splitBulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim().replace(LIST_MARKER, "").trim())
    .filter(Boolean);
}

export function visibleBullets(bullets: readonly Bullet[] | undefined): Bullet[] {
  return (bullets ?? []).filter((bullet) => !bullet.hidden && bullet.text.trim());
}

export function bulletsToText(bullets: readonly Bullet[] | undefined): string {
  return visibleBullets(bullets)
    .map((bullet) => `- ${bullet.text}`)
    .join("\n");
}

export function parseStoredBullets(value: unknown): Bullet[] {
  const parsed = storedBulletsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}
