---
name: verify-tinkers-arcade
description: "Launch, doctor, and Playwright-drive Tinker's Arcade (Vite/React TanStack Start at http://127.0.0.1:8080). Use when proving cabinet floor, play shells (Snake/Tetris/Breakout/Dodge), or the Stack page on this app."
---

# Verify Tinker's Arcade

Tinker's Arcade is a coal-and-steel arcade floor. `/` shows `SiteHeader` (`Coal & steel`, `Tinker's Arcade`, Floor/Stack nav) and four `CabinetCard`s (Snake, Tetris, Breakout, Dodge). Each card links to `/play/<slug>`; `/stack` documents wiring. AuthProvider wraps the app but floor and games are **not** sign-in gated — do not invent login steps.

This skill is the scripted way to drive that UI. Read `features/` before a run. Prove one mapped feature per drive unless a maintenance pass asks for more.

## Surface

- Web UI. Vite + React + TanStack Start/Router, Tailwind.
- Routes: `/`, `/stack`, `/play/snake`, `/play/tetris`, `/play/breakout`, `/play/dodge`.
- APP_URL: `http://127.0.0.1:8080/` (override with `TINKERS_ARCADE_URL`).
- Repo root is the directory that contains `package.json` and `src/routes/index.tsx`. Helpers resolve it as four parents above `scripts/`.
- Existing `scripts/browser-smoke.mjs` is a separate smoke tool — skill helpers are self-contained under `.cursor/skills/verify-tinkers-arcade/scripts/` and do not require calling browser-smoke.

## Launch

One instance. Vite is `strictPort: true` on port `8080` (`npm run dev` → `with-app-env.mjs vite dev --host 0.0.0.0 --port 8080`). A second start fails instead of picking another port. Never double-drive whatever already owns 8080.

From repo root:

```bash
export RUN_ID="${RUN_ID:-$(date -u +%Y%m%dT%H%M%SZ)}"
.cursor/skills/verify-tinkers-arcade/scripts/launch.sh
```

What launch does:

1. Creates `artifacts/verify-tinkers-arcade/$RUN_ID/` (gitignored via `artifacts`).
2. Refuses if `http://127.0.0.1:8080/` already answers **and** the answering process is not the PID recorded for this `RUN_ID`.
3. Runs `npm run dev` from the repo root via `setsid` (owned PID tree), logging to `artifacts/verify-tinkers-arcade/$RUN_ID/dev.log`.
4. Writes `launch.pid`, `launch.json`, and `artifacts/verify-tinkers-arcade/.current-run`.
5. Waits until `curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/` succeeds (up to 120s).

Ready signal: HTTP 200 from `http://127.0.0.1:8080/`. Then run Doctor — HTML-only is not identity.

First-time machine:

```bash
npm install
npx playwright install chromium
```

`playwright` is already a `devDependency` (`^1.62.0`). Chromium args `--no-sandbox --disable-dev-shm-usage` are required in this container-style environment.

## Doctor

Read-only. Run before the first drive, after any failed drive, and whenever the UI looks off.

```bash
export RUN_ID  # same id launch printed
node .cursor/skills/verify-tinkers-arcade/scripts/doctor.mjs
```

Doctor must report all of:

- `http://127.0.0.1:8080/` returns HTTP 200.
- If `artifacts/verify-tinkers-arcade/$RUN_ID/launch.pid` exists, that PID is alive and 8080 is in its process tree. Refuse to drive a stranger on 8080.
- Playwright, desktop viewport `1280x800`, page shows Tinker's Arcade identity:
  - document title matches `/Tinker's Arcade/i`
  - text `Coal & steel`
  - heading `Tinker's Arcade`
  - Floor and Stack links
  - cabinet titles Snake, Tetris, Breakout, Dodge
  - body copy mentioning cabinets/floor (e.g. `Four cabinets`)

Writes `artifacts/verify-tinkers-arcade/$RUN_ID/doctor.json`. Exit `0` only when every check passed.

If doctor fails because the process wedged, run Cleanup, Launch, Doctor again. Do not keep driving. Never edit product code to make doctor pass.

## Drive

Harness: Playwright (`chromium` from this repo's `playwright` package). Isolated browser **context** per drive.

Default context:

```js
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
```

Stable handles:

| What | Handle |
| --- | --- |
| Identity | text `Coal & steel`; heading `Tinker's Arcade` |
| Nav | `getByRole('link', { name: 'Floor' })`, `getByRole('link', { name: 'Stack' })` |
| Cabinets | links whose accessible name matches `/Snake|Tetris|Breakout|Dodge/`, or `a[href="/play/snake"]` etc. |
| Snake shell | heading `Snake`, text `Cabinet 1976`, `Score` / `High`, Floor link back, `canvas` |

Mapped features live in `features/`. The helper that has been executed end-to-end is floor-to-snake:

```bash
export RUN_ID
node .cursor/skills/verify-tinkers-arcade/scripts/drive-floor-to-snake.mjs
```

Drive other features with the same Playwright context recipe in the matching `features/*.md` file. Do not call internal game setters. Do not play a full game unless the feature recipe requires scoring.

## Evidence

Root: `artifacts/verify-tinkers-arcade/<run-id>/` (directory pattern is gitignored). Proof that belongs in git is the short note at `.cursor/skills/verify-tinkers-arcade/PROOF.md`, which **points at** that path.

Every drive writes at least:

- `*-before.png` and `*-after.png` (or numbered steps) — app identity visible
- `*-before.aria.yml` and `*-after.aria.yml` from `page.locator('body').ariaSnapshot()`
- `proof.md` — feature id, entry point, what changed, pass/fail
- machine-readable `drive-*.json`

Standards:

- Exercise the real user path (click cabinet Link, not router internals).
- Capture the action **and** the resulting state, not only the final screen.
- Mocks: none for floor navigation.

## Cleanup

```bash
export RUN_ID  # or omit to use artifacts/verify-tinkers-arcade/.current-run
.cursor/skills/verify-tinkers-arcade/scripts/cleanup.sh
```

Cleanup kills **only** the process tree of `launch.pid` for that run (TERM, then KILL). It does not `pkill node`, does not `pkill vite`, and does **not** delete `artifacts/`. After cleanup, `ls artifacts/verify-tinkers-arcade/$RUN_ID` must still list screenshots and `proof.md`.

If 8080 still answers after cleanup, the listener is not ours — stop and report the PID; do not kill it.

## Helpers

All under `.cursor/skills/verify-tinkers-arcade/scripts/`. They are executable. Invoke from repo root.

| Script | Invocation | Purpose |
| --- | --- | --- |
| `launch.sh` | `RUN_ID=… .cursor/skills/verify-tinkers-arcade/scripts/launch.sh` | Start `npm run dev` if 8080 is free; record PID; wait until the port answers |
| `doctor.mjs` | `RUN_ID=… node .cursor/skills/verify-tinkers-arcade/scripts/doctor.mjs` | HTTP + PID + Playwright identity |
| `drive-floor-to-snake.mjs` | `RUN_ID=… node .cursor/skills/verify-tinkers-arcade/scripts/drive-floor-to-snake.mjs` | Prove `floor-to-snake` |
| `cleanup.sh` | `RUN_ID=… .cursor/skills/verify-tinkers-arcade/scripts/cleanup.sh` | Kill the recorded PID tree; leave evidence |
| `lib.mjs` | imported by the Node helpers | Paths, identity wait, screenshots |

## Isolate

- One Vite on 8080. `strictPort` via vite config / package script.
- One `RUN_ID` per verification run. Evidence is namespaced by that id.
- Playwright uses a fresh context. Do not attach to the user's Chrome profile.
- If 8080 is owned by a stranger → **INCONCLUSIVE**. Do not kill strangers.

## Maintenance

When the arcade chrome changes, keep `features/` honest. Recommended first feature for Verify bot after this land: **`floor-to-snake`**.
