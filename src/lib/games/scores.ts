const PREFIX = "tinkers-arcade:v1:";

export function readHighScore(slug: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(PREFIX + slug);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function writeHighScore(slug: string, score: number): number {
  const prev = readHighScore(slug);
  const next = Math.max(prev, score);
  window.localStorage.setItem(PREFIX + slug, String(next));
  return next;
}
