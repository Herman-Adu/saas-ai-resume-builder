// v0 sandbox only. A sandbox reset wipes Playwright's Chromium download and the
// system libraries it needs. Local machines and CI keep both, so outside the
// sandbox this script exits immediately and changes nothing.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const isV0Sandbox = existsSync("/vercel/share/.env.project");
if (!isV0Sandbox) process.exit(0);

const run = (command, args) =>
  spawnSync(command, args, { stdio: "inherit" }).status === 0;

const chromiumLaunches = () =>
  spawnSync(
    "node",
    [
      "-e",
      "const {chromium}=require('@playwright/test');(async()=>{const b=await chromium.launch();await b.close()})().catch(()=>process.exit(1))",
    ],
    { stdio: "ignore" },
  ).status === 0;

if (chromiumLaunches()) process.exit(0);

console.log("browser: Chromium does not launch, repairing the v0 sandbox");
if (!run("npx", ["playwright", "install", "chromium"])) process.exit(1);

if (!chromiumLaunches()) {
  // The sandbox is Amazon Linux 2023 (dnf, no apt-get), so `playwright install-deps` cannot work.
  const libraries = [
    "nspr", "nss", "nss-util", "atk", "at-spi2-atk", "cups-libs", "libdrm",
    "libxkbcommon", "libXcomposite", "libXdamage", "libXfixes", "libXrandr",
    "mesa-libgbm", "alsa-lib", "pango", "cairo",
  ];
  if (!run("sudo", ["-n", "dnf", "install", "-y", ...libraries])) process.exit(1);
}

if (chromiumLaunches()) {
  console.log("browser: repaired");
} else {
  console.error("browser: still blocked, report the browser checks as blocked");
  process.exit(1);
}
