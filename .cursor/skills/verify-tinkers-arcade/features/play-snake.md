# Play Snake

From the floor, the Snake cabinet Link opens `/play/snake` with GameShell chrome (Cabinet 1976, Score/High, Floor back) and a canvas play area. Proving navigation + shell load is enough — no need to score.

## Sub-features

- `floor-to-snake` clicks the Snake cabinet and lands on `/play/snake`.
- `snake-shell` shows heading Snake, `Cabinet 1976`, Score/High, Floor link, and a canvas.

## How to get to it (user POV)

- On the floor, choose the Snake cabinet card.
- Or open `/play/snake` directly.

## Driving it with Playwright

Preconditions:

- Tinker's Arcade is healthy at `http://127.0.0.1:8080/` and doctor passed.
- Viewport is `1280x800`.
- Start on the floor `/`.

- **Before.** Capture floor evidence with Snake heading visible.
- **Click Snake.** Run `page.locator('a[href="/play/snake"]').first().click()` (or `getByRole('link', { name: /Snake/ })` filtered to the cabinet).
- **Shell.** Wait for URL `/play/snake`. Expect heading `Snake`, text `Cabinet 1976`, Score/High labels, Floor link, and `canvas`.
- **Proof.** Capture after evidence. Do not call internal setters. Do not play a full game.

A packaged run:

```bash
RUN_ID=… node .cursor/skills/verify-tinkers-arcade/scripts/drive-floor-to-snake.mjs
```

## Gotchas

- Idle overlay may show Insert coin — that is fine; shell chrome is still present.
- Multiple Floor links exist (header + shell); assert at least one is visible.
