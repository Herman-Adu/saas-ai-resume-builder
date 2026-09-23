import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Direct (non-pooling) URL for migrations
    url: env("POSTGRES_URL_NON_POOLING"),
  },
});