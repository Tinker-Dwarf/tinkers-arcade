# Tinker's Arcade verification map

This directory is the maintained source for verifying the user-facing behavior of Tinker's Arcade. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `.cursor/skills/verify-tinkers-arcade/scripts/launch.sh` so this run owns `http://127.0.0.1:8080`.
- Set `RUN_ID` and write evidence under `artifacts/verify-tinkers-arcade/$RUN_ID/`.
- Run `node .cursor/skills/verify-tinkers-arcade/scripts/doctor.mjs` and require HTTP 200, a live launch PID, and arcade identity (`Coal & steel`, heading `Tinker's Arcade`, Floor/Stack, four cabinets).
- Drive Playwright at viewport `1280x800` in a **new browser context**.
- Never drive an instance that was not started by this verification run.
- Do not open a second Vite on 8080 (`strictPort`).
- Do not invent sign-in steps — floor and games are not gated for play.

## Driving conventions

- Start every recipe from the floor `/` unless its preconditions say otherwise.
- Prefer ARIA roles, accessible names, and stable `href` hooks over brittle DOM position.
- Treat every command as literal. Keep quoted names unchanged.
- Run browser actions through Playwright against `http://127.0.0.1:8080/`.
- Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot (`page.locator('body').ariaSnapshot()`) and a screenshot with arcade identity visible.
- Mutation proof includes a second observation: URL change, shell heading, Score/High chrome.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with Playwright` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Cabinet floor](./cabinet-floor.md) covers SiteHeader + four CabinetCards on `/`.
- [Play Snake](./play-snake.md) covers navigation into the Snake shell (packaged drive: `floor-to-snake`).
- [Play Tetris](./play-tetris.md) covers Tetris shell load from the floor.
- [Play Breakout](./play-breakout.md) covers Breakout shell load from the floor.
- [Play Dodge](./play-dodge.md) covers Dodge shell load from the floor.
- [Stack page](./stack-page.md) covers Floor → Stack wiring page.
