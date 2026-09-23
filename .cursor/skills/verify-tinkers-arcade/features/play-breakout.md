# Play Breakout

From the floor, the Breakout cabinet Link opens `/play/breakout` with GameShell chrome (Cabinet 1976, Score/High, Floor back) and the Breakout play surface.

## Sub-features

- `floor-to-breakout` clicks the Breakout cabinet and lands on `/play/breakout`.
- `breakout-shell` shows heading Breakout, `Cabinet 1976`, Score/High, Floor link.

## How to get to it (user POV)

- On the floor, choose the Breakout cabinet card.
- Or open `/play/breakout` directly.

## Driving it with Playwright

Preconditions:

- Doctor passed; viewport `1280x800`; start on `/`.

- **Click Breakout.** Run `page.locator('a[href="/play/breakout"]').first().click()`.
- **Shell.** Wait for URL `/play/breakout`. Expect heading `Breakout`, text `Cabinet 1976`, Score/High, Floor link.
- **Proof.** Before/after screenshots + ARIA. Navigation + shell load is enough.

No packaged drive helper yet — mirror `drive-floor-to-snake.mjs` if proving this feature.

## Gotchas

- Snake and Breakout both say Cabinet 1976 — assert the heading name Breakout as well.
