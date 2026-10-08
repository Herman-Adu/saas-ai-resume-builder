import { env } from "@/env";
import { buildSitemap } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(env.NEXT_PUBLIC_BASE_URL);
}
