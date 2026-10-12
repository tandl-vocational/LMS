import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const baseURL = process.env.LMS_BASE_URL || "http://127.0.0.1:3000";
const outputDir = path.resolve(
  process.env.LMS_TEST_OUTPUT_DIR || "test-results",
);
fs.mkdirSync(outputDir, { recursive: true });
const routes = [
  ...new Set(
    [
      ...fs
        .readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8")
        .matchAll(/item\(\s*["']([^"']+)["']/g),
    ].map((m) => m[1]),
  ),
  "/login",
  "/admin/login",
  "/forgot-password",
];
const browser = await chromium.launch({
  executablePath:
    process.env.LMS_BROWSER_PATH ||
    (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(8000);
const errors = [],
  results = [];
page.on("pageerror", (e) =>
  errors.push({ route: page.url(), error: e.message }),
);
try {
  expect(routes).toHaveLength(48);
  for (const route of routes) {
    await page.goto(`${baseURL}` + route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(
      page.getByText("画面が見つかりません", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("画面を読み込めませんでした", { exact: true }),
    ).toHaveCount(0);
    results.push({
      route,
      heading: await page.locator("h1").first().innerText(),
    });
  }
  console.log("Desktop routes passed:", results.length);
  for (const route of [
    "/student/dashboard",
    "/student/attendance",
    "/student/qualifications",
    "/student/career",
    "/student/payments",
    "/student/surveys",
    "/student/questions",
    "/student/schedule",
    "/login",
    "/admin/login",
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}` + route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible();
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    expect(
      widths.scroll,
      `Horizontal overflow at ${route}`,
    ).toBeLessThanOrEqual(widths.viewport + 1);
  }
  console.log("Mobile routes passed: 10");
  expect(errors).toEqual([]);
  console.log("Uncaught browser errors: 0");
} catch (e) {
  console.error(e.stack);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    path.join(outputDir, "routes.json"),
    JSON.stringify(
      { routes: results, errors, passed: !process.exitCode },
      null,
      2,
    ),
  );
  await browser.close();
}
