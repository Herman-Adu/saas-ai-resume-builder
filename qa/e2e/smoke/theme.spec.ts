import { expect, test, type Page } from "@playwright/test";

const channels = (rgb: string) => (rgb.match(/[\d.]+/g) ?? []).map(Number);
const luminance = (rgb: string) => {
  const [r = 0, g = 0, b = 0] = channels(rgb);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const bodyStyle = (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { background: style.backgroundColor, color: style.color };
  });

test("light theme resolves a light surface with dark ink", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    window.localStorage.setItem("theme", "light");
  });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  const { background, color } = await bodyStyle(page);
  expect(luminance(background)).toBeGreaterThan(0.85);
  expect(luminance(color)).toBeLessThan(0.2);
});

test("dark class flips the surface and ink through the tokens", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
  });
  const { background, color } = await bodyStyle(page);
  expect(luminance(background)).toBeLessThan(0.15);
  expect(luminance(color)).toBeGreaterThan(0.8);
});

test("brand and utility classes generate real CSS", async ({ page }) => {
  await page.goto("/");
  const probe = await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "bg-primary text-primary-foreground rounded-lg p-4 font-display";
    document.body.appendChild(el);
    const style = getComputedStyle(el);
    const result = {
      background: style.backgroundColor,
      padding: style.paddingTop,
      radius: style.borderTopLeftRadius,
    };
    el.remove();
    return result;
  });
  expect(probe.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(probe.padding).toBe("16px");
  expect(probe.radius).not.toBe("0px");
});
