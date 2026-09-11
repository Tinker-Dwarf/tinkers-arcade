import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const APP_URL = process.env.TINKERS_ARCADE_URL ?? "http://127.0.0.1:8080/";
export const VIEWPORT = { width: 1280, height: 800 };
export const PORT = Number.parseInt(new URL(APP_URL).port || "8080", 10);

export function repoRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), "../../../..");
}

export function requireRunId() {
  const runId = process.env.RUN_ID?.trim();
  if (!runId) {
    throw new Error("RUN_ID is required (export RUN_ID=… from launch.sh)");
  }
  if (runId.includes("/") || runId.includes("..")) {
    throw new Error("RUN_ID must be a single path segment");
  }
  return runId;
}

export function evidenceDir(runId = requireRunId()) {
  const dir = join(repoRoot(), "artifacts/verify-tinkers-arcade", runId);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  return { browser, context, page };
}

export async function openFloor(page) {
  await page.goto(APP_URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByText("Coal & steel", { exact: true }).waitFor({ timeout: 30_000 });
  await page.getByRole("heading", { name: "Tinker's Arcade" }).waitFor();
  await page.getByRole("link", { name: "Floor" }).waitFor();
  await page.getByRole("link", { name: "Stack" }).waitFor();
  await page.getByRole("heading", { name: "Snake" }).waitFor();
  await page.getByText(/Four cabinets/i).waitFor();
}

export async function captureEvidence(page, dir, stem) {
  const png = join(dir, `${stem}.png`);
  const ariaPath = join(dir, `${stem}.aria.yml`);
  await page.screenshot({ path: png, fullPage: true });
  let snapshot = "";
  try {
    snapshot = await page.locator("body").ariaSnapshot();
  } catch {
    snapshot = await page.locator("body").innerText();
  }
  writeFileSync(ariaPath, snapshot.endsWith("\n") ? snapshot : `${snapshot}\n`);
  return { png, aria: ariaPath };
}

export function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
