import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CabinetCard } from "@/components/arcade/cabinet-card";
import { SiteHeader } from "@/components/arcade/site-header";
import { GAMES, gameBySlug, type GameSlug } from "@/lib/games/catalog";
import { gameFromHostname } from "@/lib/games/host";
import { readHighScore } from "@/lib/games/scores";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [hosted, setHosted] = useState<GameSlug | null | undefined>(undefined);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    setHosted(gameFromHostname(window.location.hostname));
    setScores(Object.fromEntries(GAMES.map((g) => [g.slug, readHighScore(g.slug)])));
  }, []);

  if (hosted) {
    const meta = gameBySlug(hosted);
    if (meta) return <Navigate to={meta.href} />;
  }

  return (
    <div className="grain min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="max-w-xl text-base leading-relaxed text-steel-2">
          Three cabinets on one floor. Path routes work now. Point a Porkbun subdomain at
          this host and the hostname opens the matching game.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {GAMES.map((game) => (
            <CabinetCard key={game.slug} game={game} high={scores[game.slug] ?? 0} />
          ))}
        </div>
      </main>
    </div>
  );
}
