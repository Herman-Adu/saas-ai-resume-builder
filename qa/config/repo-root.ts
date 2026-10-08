import { fileURLToPath } from "node:url";

/**
 * Absolute path of the repository root, derived from this file's location.
 *
 * Tests must use this instead of `process.cwd()`: editor runners (VS Code Vitest
 * extension, WebStorm) start from the config or package folder, not the repo root.
 */
export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
