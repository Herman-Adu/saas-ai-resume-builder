import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest runs the fast, browserless layers: `qa/unit` and `qa/integration`.
 * `@/` mirrors tsconfig `paths` (`./src/*`).
 */
const projectRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(projectRoot, "src"),
    },
  },
  test: {
    root: projectRoot,
    environment: "node",
    include: ["qa/unit/**/*.test.ts", "qa/integration/**/*.test.ts"],
  },
});
