# Proof: verify-tinkers-arcade (atelier-class)

Official Verify-bot E2E **PASS** 2026-09-11 (lean-local; Cloud Agents held). Evidence is **not** in git (`artifacts/verify-tinkers-arcade/` is gitignored via `artifacts`). Re-run the helpers to regenerate it.

## Recommended first feature

**`floor-to-snake`** — packaged helper `drive-floor-to-snake.mjs`.

## Official prove (Verify)

- **Result:** PASS
- **RUN_ID:** `20260911T172859Z`
- **Exit codes:** launch=0 doctor=0 drive=0 cleanup=0
- **Checkout:** `/workspace/projects/tinkers-arcade-verify` @ `verify/tinkers-arcade-atelier-class`
- **Feature:** `floor-to-snake` user path (Floor `/` → Snake cabinet Link → `/play/snake` shell). No internal setters. No full game play. Auth not gated for play.
- **Runtime note:** `npm run dev` / TanStack Start need Node `>=22.12` (box used `/home/box/.local/node22/bin` ahead of system Node 20).

### Steps proven

1. Launch `npm run dev` (owned PID via `setsid`; vite `strictPort` on 8080).
2. Doctor exit `0`: HTTP 200, launch PID alive with 8080 in PID tree, identity (`Coal & steel`, heading `Tinker's Arcade`, Floor/Stack, Snake/Tetris/Breakout/Dodge, `Four cabinets`). Console errors: none.
3. Drive exit `0` (Playwright 1280×800, fresh context):
   - Open floor `/`; capture before evidence.
   - Click `a[href="/play/snake"]`.
   - Snake shell: heading Snake, `Cabinet 1976`, Score/High, Floor link back, canvas present.
4. Cleanup exit `0` killed recorded PID tree. `http://127.0.0.1:8080/` stopped. Evidence survived.

### Evidence path

`artifacts/verify-tinkers-arcade/20260911T172859Z/`

| File | Role |
| --- | --- |
| `doctor.json` / `doctor.png` / `doctor.aria.yml` | Identity check |
| `01-before-floor.png` + `.aria.yml` | Floor before click |
| `02-after-snake.png` + `.aria.yml` | Snake shell after navigation |
| `proof.md` / `drive-floor-to-snake.json` | Machine-readable pass |
| `launch.pid` / `launch.json` / `dev.log` | Instance this run started |

### doctor.json ok summary

- `ok: true`, `httpStatus: 200`, `pidAlive: true`
- identity: coalAndSteel, heading, floorLink, stackLink, snake, tetris, breakout, dodge, fourCabinets — all true
- title: `Tinker's Arcade`

## Re-run

```bash
export PATH="/home/box/.local/node22/bin:$PATH"   # if system Node < 22
export RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
.cursor/skills/verify-tinkers-arcade/scripts/launch.sh
node .cursor/skills/verify-tinkers-arcade/scripts/doctor.mjs
node .cursor/skills/verify-tinkers-arcade/scripts/drive-floor-to-snake.mjs
.cursor/skills/verify-tinkers-arcade/scripts/cleanup.sh
ls "artifacts/verify-tinkers-arcade/$RUN_ID/proof.md"
```

Other mapped features (`cabinet-floor`, `play-tetris`, `play-breakout`, `play-dodge`, `stack-page`) have recipes in `features/` and were not driven in this pass. Maintain: skill-dir only (Verify owns).
