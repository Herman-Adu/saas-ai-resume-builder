import { env } from "@/env";
import { buildRobots } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(env.NEXT_PUBLIC_BASE_URL);
}
