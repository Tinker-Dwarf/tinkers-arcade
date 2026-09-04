import { useEffect, useRef, useState } from "react";
import { startLoop } from "@/lib/games/loop";
import { readHighScore, writeHighScore } from "@/lib/games/scores";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/arcade/game-shell";
import { gameBySlug } from "@/lib/games/catalog";

const W = 800;
const H = 560;
const PLAYER_W = 40;
const PLAYER_H = 40;
const ENEMY = 40;
const STAR = 20;
const PLAYER_SPEED = 300;
const STAR_SPEED = 180;
const SLUG = "dodge";
const game = gameBySlug(SLUG)!;

type Box = { x: number; y: number; w: number; h: number; vy: number };

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function spawnEnemy(): Box {
  return {
    x: rand(0, W - ENEMY),
    y: rand(-160, -40),
    w: ENEMY,
    h: ENEMY,
    vy: rand(120, 420),
  };
}

function spawnStar(): Box {
  return { x: rand(0, W - STAR), y: rand(-140, -40), w: STAR, h: STAR, vy: STAR_SPEED };
}

function overlaps(a: Box, b: Box) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function wrapFalling(box: Box, respawn: () => Box) {
  if (box.y > H) Object.assign(box, respawn());
}

export function DodgeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(0);
  const [session, setSession] = useState(0);
  const phaseRef = useRef(phase);
  const keysRef = useRef({ l: false, r: false });

  useEffect(() => {
    setHigh(readHighScore(SLUG));
  }, []);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const player: Box = {
      x: (W - PLAYER_W) / 2,
      y: H - PLAYER_H - 12,
      w: PLAYER_W,
      h: PLAYER_H,
      vy: 0,
    };
    let enemies = [spawnEnemy(), spawnEnemy(), spawnEnemy()];
    let stars = [spawnStar(), spawnStar()];
    let points = 0;

    const aimFromPointer = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      player.x = Math.max(0, Math.min(W - player.w, x - player.w / 2));
    };

    const onKey = (e: KeyboardEvent) => {
      const down = e.type === "keydown";
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.l = down;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.r = down;
      if (down && (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "KeyA" || e.code === "KeyD")) {
        e.preventDefault();
        if (phaseRef.current === "idle") setPhase("play");
      }
    };
    const onMove = (e: MouseEvent) => {
      if (phaseRef.current === "idle") return;
      aimFromPointer(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      if (phaseRef.current === "idle") setPhase("play");
      aimFromPointer(t.clientX);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    canvas.addEventListener("touchmove", onTouch, { passive: false });

    window.__controlsTest = {
      getX: () => player.x,
      setKeys: (codes: string[]) => {
        keysRef.current.l = codes.includes("KeyA") || codes.includes("ArrowLeft");
        keysRef.current.r = codes.includes("KeyD") || codes.includes("ArrowRight");
      },
    };

    const block = (x: number, y: number, w: number, h: number, fill: string, edge: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = edge;
      ctx.fillRect(x, y, w, 3);
      ctx.fillRect(x, y, 3, h);
    };

    const draw = () => {
      ctx.fillStyle = "#0a0908";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#12110f";
      ctx.fillRect(0, H - 8, W, 8);

      block(player.x, player.y, player.w, player.h, "#2f9e4b", "#8ee0a0");
      for (const e of enemies) block(e.x, e.y, e.w, e.h, "#9a3b24", "#e07a3d");
      for (const s of stars) {
        ctx.save();
        ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#e8c547";
        ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
        ctx.restore();
      }
    };

    const stop = startLoop((dt) => {
      if (phaseRef.current === "play") {
        if (keysRef.current.l) player.x -= PLAYER_SPEED * dt;
        if (keysRef.current.r) player.x += PLAYER_SPEED * dt;
        player.x = Math.max(0, Math.min(W - player.w, player.x));

        for (const e of enemies) {
          e.y += e.vy * dt;
          wrapFalling(e, spawnEnemy);
          if (overlaps(player, e)) {
            setScore(points);
            setHigh(writeHighScore(SLUG, points));
            setPhase("over");
            break;
          }
        }
        for (const s of stars) {
          s.y += s.vy * dt;
          wrapFalling(s, spawnStar);
          if (overlaps(player, s)) {
            points += 10;
            setScore(points);
            Object.assign(s, spawnStar());
          }
        }
      }
      draw();
    });

    return () => {
      stop();
      delete window.__controlsTest;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
    };
  }, [session]);

  const start = () => {
    setScore(0);
    keysRef.current = { l: false, r: false };
    setSession((n) => n + 1);
    setPhase("play");
  };

  return (
    <GameShell game={game} score={score} high={high}>
      <div className="cabinet-bezel relative overflow-hidden rounded-md p-2 sm:p-3">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block h-auto w-full touch-none bg-ink"
        />
        {phase !== "play" && (
          <div className="absolute inset-2 flex flex-col items-center justify-center gap-3 bg-ink/80 sm:inset-3">
            <p className="font-display text-5xl tracking-wide">
              {phase === "over" ? "Game over" : "Dodge"}
            </p>
            <Button onClick={start}>{phase === "over" ? "Play again" : "Insert coin"}</Button>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-3 sm:hidden">
        <Button
          variant="steel"
          className="h-14 flex-1"
          onPointerDown={() => {
            keysRef.current.l = true;
            if (phase === "idle") start();
          }}
          onPointerUp={() => {
            keysRef.current.l = false;
          }}
          onPointerCancel={() => {
            keysRef.current.l = false;
          }}
        >
          Left
        </Button>
        <Button
          variant="steel"
          className="h-14 flex-1"
          onPointerDown={() => {
            keysRef.current.r = true;
            if (phase === "idle") start();
          }}
          onPointerUp={() => {
            keysRef.current.r = false;
          }}
          onPointerCancel={() => {
            keysRef.current.r = false;
          }}
        >
          Right
        </Button>
      </div>
    </GameShell>
  );
}

declare global {
  interface Window {
    __controlsTest?: {
      getX: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}
