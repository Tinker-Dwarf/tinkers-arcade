import { Link } from "@tanstack/react-router";
import type { GameMeta } from "@/lib/games/catalog";

export function CabinetCard({ game, high }: { game: GameMeta; high: number }) {
  return (
    <Link
      to={game.href}
      className="cabinet-bezel group relative block overflow-hidden rounded-md p-3 sm:p-4"
    >
      <div className="relative overflow-hidden rounded-sm border border-ink bg-ink">
        <div className="flex aspect-[4/3] items-center justify-center">
          <span className="font-display text-[7rem] leading-none text-ember/80 transition-transform duration-200 group-hover:scale-105 sm:text-[8rem]">
            {game.mark}
          </span>
        </div>
        <div className="scanlines absolute inset-0" />
        <span className="absolute left-3 top-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-steel">
          {game.year}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 px-1 pb-1">
        <div className="min-w-0">
          <h2 className="font-display text-4xl leading-none tracking-wide text-bone">
            {game.title}
          </h2>
          <p className="mt-1 truncate text-sm text-steel">{game.tagline}</p>
        </div>
        <p className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ember">
          Hi {high}
        </p>
      </div>
    </Link>
  );
}
