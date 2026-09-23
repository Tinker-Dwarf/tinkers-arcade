#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  APP_URL,
  PORT,
  captureEvidence,
  evidenceDir,
  launchBrowser,
  openFloor,
  requireRunId,
  writeJson,
} from "./lib.mjs";

const runId = requireRunId();
const dir = evidenceDir(runId);
const report = {
  ok: false,
  runId,
  url: APP_URL,
  httpStatus: null,
  pidAlive: null,
  identity: {},
  errors: [],
};

async function httpStatus() {
  try {
    const out = execSync(
      `curl -s -o /dev/null -w "%{http_code}" --max-time 5 ${JSON.stringify(APP_URL)}`,
      { encoding: "utf8" },
    );
    return Number.parseInt(out.trim(), 10);
  } catch {
    return 0;
  }
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function collectTree(pid) {
  const ids = [pid];
  let raw = "";
  try {
    raw = execSync(`ps -o pid= --ppid ${pid}`, { encoding: "utf8" });
  } catch {
    return ids;
  }
  for (const line of raw.trim().split(/\s+/).filter(Boolean)) {
    const child = Number.parseInt(line, 10);
    if (Number.isFinite(child)) ids.push(...collectTree(child));
  }
  return ids;
}

function listenerMentions(pids) {
  let listener = "";
  try {
    listener = execSync(
      `ss -ltnp 2>/dev/null | awk '/:${PORT} / {print}'`,
      { encoding: "utf8" },
    );
  } catch {
    try {
      listener = execSync(
        `lsof -nP -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null`,
        { encoding: "utf8" },
      );
    } catch {
      return { found: false, listener: "" };
    }
  }
  if (!listener.trim()) return { found: false, listener: "" };
  const hit = pids.some(
    (pid) =>
      listener.includes(`pid=${pid}`) ||
      listener.includes(`pid=${pid},`) ||
      listener.includes(` ${pid} `),
  );
  return { found: hit, listener: listener.trim() };
}

try {
  report.httpStatus = await httpStatus();
  if (report.httpStatus !== 200) {
    report.errors.push(`expected HTTP 200 from ${APP_URL}, got ${report.httpStatus}`);
  }

  const pidPath = join(dir, "launch.pid");
  if (existsSync(pidPath)) {
    const pid = Number.parseInt(readFileSync(pidPath, "utf8").trim(), 10);
    report.launchPid = pid;
    report.pidAlive = pidAlive(pid);
    if (!report.pidAlive) {
      report.errors.push(`launch.pid ${pid} is not alive`);
    } else {
      const tree = collectTree(pid);
      report.pidTree = tree;
      const listen = listenerMentions(tree);
      report.listener = listen.listener;
      if (listen.listener && !listen.found) {
        report.errors.push(
          `port ${PORT} is listening but not in this run's PID tree — refuse to drive a stranger`,
        );
      }
      if (!listen.listener) {
        report.errors.push(`port ${PORT} listener not found while HTTP answered`);
      }
    }
  } else {
    report.errors.push(`missing ${pidPath} — launch this RUN_ID before doctor`);
  }

  const { browser, page } = await launchBrowser();
  try {
    const consoleErrors = [];
    page.on("pageerror", (err) => consoleErrors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await openFloor(page);
    const title = await page.title();
    const identity = {
      title,
      coalAndSteel: await page.getByText("Coal & steel", { exact: true }).isVisible(),
      heading: await page.getByRole("heading", { name: "Tinker's Arcade" }).isVisible(),
      floorLink: await page.getByRole("link", { name: "Floor" }).isVisible(),
      stackLink: await page.getByRole("link", { name: "Stack" }).isVisible(),
      snake: await page.getByRole("heading", { name: "Snake" }).isVisible(),
      tetris: await page.getByRole("heading", { name: "Tetris" }).isVisible(),
      breakout: await page.getByRole("heading", { name: "Breakout" }).isVisible(),
      dodge: await page.getByRole("heading", { name: "Dodge" }).isVisible(),
      fourCabinets: await page.getByText(/Four cabinets/i).isVisible(),
    };
    report.identity = identity;
    report.consoleErrors = consoleErrors;
    if (!/Tinker's Arcade/i.test(title)) {
      report.errors.push(`document title is ${JSON.stringify(title)}`);
    }
    for (const [key, ok] of Object.entries(identity)) {
      if (key === "title") continue;
      if (!ok) report.errors.push(`identity missing: ${key}`);
    }
    await captureEvidence(page, dir, "doctor");
  } finally {
    await browser.close();
  }
} catch (err) {
  report.errors.push(String(err?.stack ?? err));
}

report.ok = report.errors.length === 0;
writeJson(join(dir, "doctor.json"), report);
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
