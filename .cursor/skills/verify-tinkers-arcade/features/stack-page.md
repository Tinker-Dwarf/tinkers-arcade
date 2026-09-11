# Stack page

The Stack nav link opens `/stack`, which documents how GitHub, Netlify, Vercel, and Porkbun wire together under the same SiteHeader.

## Sub-features

- `nav-to-stack` follows the Stack link from Floor or a play shell.
- `stack-copy` shows heading about how the stack talks and wiring rows (GitHub, Netlify, Vercel, Porkbun).

## How to get to it (user POV)

- Choose Stack in SiteHeader.
- Or open `/stack` directly.

## Driving it with Playwright

Preconditions:

- Doctor passed; viewport `1280x800`.

- **Click Stack.** Run `page.getByRole('link', { name: 'Stack' }).click()`.
- **Page.** Wait for URL `/stack`. Expect text matching `/How the stack talks/i` (or heading), and names GitHub / Netlify.
- **Proof.** Before/after screenshots + ARIA.

No packaged drive helper yet.

## Gotchas

- Stack is informational only — do not assert live Netlify/Porkbun network calls.
