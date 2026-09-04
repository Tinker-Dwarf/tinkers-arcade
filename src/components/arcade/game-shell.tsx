import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { GameMeta } from "@/lib/games/catalog";
import { SiteHeader } from "./site-header";

export function GameShell({
  game,
  score,
  high,
  extra,
  children,
}: {
  game: GameMeta;
  score: number;
  high: number;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grain min-h-dvh">
      <SiteHeader />
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-steel">
              Cabinet {game.year}
            </p>
            <h2 className="font-display text-5xl leading-none tracking-wide">{game.title}</h2>
          </div>
          <div className="flex items-center gap-6 font-mono text-[0.7rem] uppercase tracking-[0.18em]">
            <span>
              Score <span className="text-ember">{score}</span>
            </span>
            <span>
              High <span className="text-ember-2">{high}</span>
            </span>
            <Link to="/" className="text-steel hover:text-bone">
              Floor
            </Link>
          </div>
        </div>
        {children}
        <p className="text-sm text-steel">{game.how}</p>
        {extra}
      </div>
    </div>
  );
}
