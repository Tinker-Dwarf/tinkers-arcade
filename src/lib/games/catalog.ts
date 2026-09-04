export type GameSlug = "snake" | "tetris" | "breakout";

export type GameMeta = {
  slug: GameSlug;
  title: string;
  year: string;
  tagline: string;
  href: "/play/snake" | "/play/tetris" | "/play/breakout";
  mark: string;
  how: string;
};

export const GAMES: GameMeta[] = [
  {
    slug: "snake",
    title: "Snake",
    year: "1976",
    tagline: "Eat. Grow. Don't bite yourself.",
    href: "/play/snake",
    mark: "S",
    how: "Arrows or WASD. Swipe on a phone. Don't hit the walls or your tail.",
  },
  {
    slug: "tetris",
    title: "Tetris",
    year: "1984",
    tagline: "Seven shapes. Endless gravity.",
    href: "/play/tetris",
    mark: "T",
    how: "Move ←→, rotate Z / X / Up, soft ↓, hard Space, hold C. Buttons on touch.",
  },
  {
    slug: "breakout",
    title: "Breakout",
    year: "1976",
    tagline: "One paddle. A wall of bricks.",
    href: "/play/breakout",
    mark: "B",
    how: "Mouse, touch, or ←→ to slide the paddle. Keep the ember in play.",
  },
];

export function gameBySlug(slug: string | undefined): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
