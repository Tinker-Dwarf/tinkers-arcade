#!/usr/bin/env node
/**
 * Prove floor-to-snake: Floor `/` → click Snake cabinet → Snake game shell.
 * Usage: RUN_ID=… node .cursor/skills/verify-tinkers-arcade/scripts/drive-floor-to-snake.mjs
 */
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import {
  APP_URL,
  captureEvidence,
  evidenceDir,
  launchBrowser,
  openFloor,
  requireRunId,
  writeJson,
} from "./lib.mjs";

const runId = requireRunId();
const dir = evidenceDir(runId);
const steps = [];
const failures = [];

function note(step, data) {
  steps.push({ step, ...data });
}

try {
  const { browser, page } = await launchBrowser();
  try {
    await openFloor(page);
    const floorUrl = page.url();
    const floorPath = new URL(floorUrl).pathname;
    note("floor", { url: floorUrl, path: floorPath });
    if (floorPath !== "/" && floorPath !== "") {
      failures.push(`expected floor path "/", got ${JSON.stringify(floorPath)}`);
    }
    await captureEvidence(page, dir, "01-before-floor");

    const snakeLink = page.locator('a[href="/play/snake"]').first();
    await snakeLink.waitFor({ state: "visible", timeout: 10_000 });
    note("click-snake", { href: "/play/snake" });
    await snakeLink.click();

    await page.waitForURL(/\/play\/snake\/?$/, { timeout: 15_000 });
    await page.getByRole("heading", { name: "Snake" }).waitFor({ timeout: 15_000 });
    await page.getByText("Cabinet 1976", { exact: true }).waitFor();
    await page.getByText(/Score/i).first().waitFor();
    await page.getByText(/High/i).first().waitFor();
    await page.getByRole("link", { name: "Floor" }).first().waitFor();

    const shell = {
      url: page.url(),
      headingSnake: await page.getByRole("heading", { name: "Snake" }).isVisible(),
      cabinet1976: await page.getByText("Cabinet 1976", { exact: true }).isVisible(),
      score: await page.getByText(/Score/i).first().isVisible(),
      high: await page.getByText(/High/i).first().isVisible(),
      floorBack: await page.getByRole("link", { name: "Floor" }).first().isVisible(),
      canvas: (await page.locator("canvas").count()) > 0,
    };
    note("snake-shell", shell);
    if (!/\/play\/snake\/?$/.test(new URL(shell.url).pathname)) {
      failures.push(`expected /play/snake, got ${shell.url}`);
    }
    for (const key of ["headingSnake", "cabinet1976", "score", "high", "floorBack", "canvas"]) {
      if (!shell[key]) failures.push(`snake shell missing: ${key}`);
    }

    await captureEvidence(page, dir, "02-after-snake");
  } finally {
    await browser.close();
  }
} catch (err) {
  failures.push(String(err?.stack ?? err));
}

const ok = failures.length === 0;
const proof = [
  "# floor-to-snake proof",
  "",
  "- Feature: `floor-to-snake`",
  "- Entry point: Floor `/` → Snake cabinet Link → `/play/snake` shell",
  `- RUN_ID: \`${runId}\``,
  `- APP_URL: \`${APP_URL}\``,
  `- Result: ${ok ? "PASS" : "FAIL"}`,
  "",
  "## Steps",
  "",
  "```json",
  JSON.stringify(steps, null, 2),
  "```",
  "",
  "## Failures",
  "",
  failures.length ? failures.map((f) => `- ${f}`).join("\n") : "- none",
  "",
  "## Artifacts",
  "",
  "- `01-before-floor.png` / `.aria.yml`",
  "- `02-after-snake.png` / `.aria.yml`",
  "",
].join("\n");

writeFileSync(join(dir, "proof.md"), proof);
writeJson(join(dir, "drive-floor-to-snake.json"), { ok, runId, steps, failures });
console.log(proof);
process.exit(ok ? 0 : 1);
