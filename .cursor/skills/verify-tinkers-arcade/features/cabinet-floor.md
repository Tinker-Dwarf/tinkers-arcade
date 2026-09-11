# Cabinet floor

The home route `/` shows coal-and-steel SiteHeader branding and four cabinet cards (Snake, Tetris, Breakout, Dodge) with floor copy.

## Sub-features

- `floor-header` shows `Coal & steel`, heading `Tinker's Arcade`, Floor and Stack nav links.
- `floor-copy` mentions four cabinets on one floor.
- `floor-cabinets` lists cabinet headings Snake, Tetris, Breakout, Dodge as links into `/play/*`.

## How to get to it (user POV)

- Open `http://127.0.0.1:8080/` (Floor).
- Or choose the Floor link from any play shell or Stack.

## Driving it with Playwright

Preconditions:

- Tinker's Arcade is healthy at `http://127.0.0.1:8080/` and doctor passed.
- Viewport is `1280x800`.

- **Open floor.** Run `page.goto('http://127.0.0.1:8080/')`. Expect title matching `/Tinker's Arcade/i`.
- **Header.** Expect text `Coal & steel` and heading `Tinker's Arcade`. Links Floor and Stack are visible.
- **Cabinets.** Expect headings Snake, Tetris, Breakout, Dodge. Expect copy matching `/Four cabinets/i`.
- **Proof.** Screenshot and ARIA snapshot show identity and all four cabinets.

Doctor covers this identity pass; no separate packaged drive helper.

## Gotchas

- AuthProvider wraps the tree but does not gate the floor — do not wait for a sign-in form.
- Hostname-based cabinet redirects only apply on special subdomains; on `127.0.0.1` the floor stays on `/`.
