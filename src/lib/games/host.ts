import { GAMES, type GameSlug } from "./catalog";

const SLUGS = new Set<string>(GAMES.map((g) => g.slug));

/** First label of the hostname, so snake.example.com opens Snake. */
export function gameFromHostname(hostname: string): GameSlug | null {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  const first = host.split(".")[0] ?? "";
  if (SLUGS.has(first)) return first as GameSlug;
  return null;
}
