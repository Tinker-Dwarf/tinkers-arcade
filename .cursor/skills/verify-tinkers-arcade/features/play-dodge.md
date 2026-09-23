# Play Dodge

From the floor, the Dodge cabinet Link opens `/play/dodge` with GameShell chrome (Cabinet 2026, Score/High, Floor back) and the Dodge play surface.

## Sub-features

- `floor-to-dodge` clicks the Dodge cabinet and lands on `/play/dodge`.
- `dodge-shell` shows heading Dodge, `Cabinet 2026`, Score/High, Floor link.

## How to get to it (user POV)

- On the floor, choose the Dodge cabinet card.
- Or open `/play/dodge` directly.

## Driving it with Playwright

Preconditions:

- Doctor passed; viewport `1280x800`; start on `/`.

- **Click Dodge.** Run `page.locator('a[href="/play/dodge"]').first().click()`.
- **Shell.** Wait for URL `/play/dodge`. Expect heading `Dodge`, text `Cabinet 2026`, Score/High, Floor link.
- **Proof.** Before/after screenshots + ARIA. Navigation + shell load is enough.

No packaged drive helper yet — mirror `drive-floor-to-snake.mjs` if proving this feature.

## Gotchas

- Dodge year is 2026 in catalog — assert that string exactly.
