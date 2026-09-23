# Play Tetris

From the floor, the Tetris cabinet Link opens `/play/tetris` with GameShell chrome (Cabinet 1984, Score/High, Floor back) and the Tetris play surface.

## Sub-features

- `floor-to-tetris` clicks the Tetris cabinet and lands on `/play/tetris`.
- `tetris-shell` shows heading Tetris, `Cabinet 1984`, Score/High, Floor link.

## How to get to it (user POV)

- On the floor, choose the Tetris cabinet card.
- Or open `/play/tetris` directly.

## Driving it with Playwright

Preconditions:

- Doctor passed; viewport `1280x800`; start on `/`.

- **Click Tetris.** Run `page.locator('a[href="/play/tetris"]').first().click()`.
- **Shell.** Wait for URL `/play/tetris`. Expect heading `Tetris`, text `Cabinet 1984`, Score/High, Floor link.
- **Proof.** Before/after screenshots + ARIA. Navigation + shell load is enough.

No packaged drive helper yet — mirror `drive-floor-to-snake.mjs` if proving this feature.

## Gotchas

- Do not invent login. Do not call internal board setters.
