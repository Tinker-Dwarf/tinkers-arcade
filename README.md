# Tinker's Arcade

Snake, Tetris, and Breakout on one coal-and-steel floor. Built to prove GitHub → Netlify (and later Vercel) → Porkbun subdomains.

## Play

- Floor: `/`
- Snake: `/play/snake`
- Tetris: `/play/tetris`
- Breakout: `/play/breakout`

Point a hostname's first label at a game (`snake.yourdomain.com`) and the floor auto-routes into that cabinet.

## Subdomains (Porkbun → Netlify)

Create CNAME records:

```
snake     CNAME  tinker-arcade.netlify.app
tetris    CNAME  tinker-arcade.netlify.app
breakout  CNAME  tinker-arcade.netlify.app
www       CNAME  tinker-arcade.netlify.app
```

Then add those custom domains on the Netlify site.

## Stack

| Layer   | Role                                      |
| ------- | ----------------------------------------- |
| GitHub  | Source of truth (`Tinker-Dwarf/tinkers-arcade`) |
| Netlify | Live host                                 |
| Vercel  | Second host once the Forge team is visible |
| Porkbun | DNS / subdomains                          |
