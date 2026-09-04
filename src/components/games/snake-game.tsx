import { useEffect, useRef, useState } from "react";
import { startLoop } from "@/lib/games/loop";
import { readHighScore, writeHighScore } from "@/lib/games/scores";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/arcade/game-shell";
import { GAMES } from "@/lib/games/catalog";

const COLS = 20;
const ROWS = 16;
const STEP = 0.13;
const SLUG = "snake";
const game = GAMES[0];

type Dir = { x: number; y: number };
type Pt = { x: number; y: number };

const DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

function opposite(a: Dir, b: Dir) {
  return a.x === -b.x && a.y === -b.y;
}

function spawnFood(snake: Pt[]): Pt {
  for (let i = 0; i < 200; i++) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
  return { x: 0, y: 0 };
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(0);
  const phaseRef = useRef(phase);

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

    let snake: Pt[] = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ];
    let dir: Dir = { x: 1, y: 0 };
    let queued: Dir = dir;
    let food = spawnFood(snake);
    let acc = 0;
    let points = 0;

    const applyDir = (next: Dir) => {
      if (!opposite(next, dir)) queued = next;
    };

    const onKey = (e: KeyboardEvent) => {
      const next = DIRS[e.code];
      if (!next) return;
      e.preventDefault();
      if (phaseRef.current === "idle") setPhase("play");
      applyDir(next);
    };

    let touchStart: Pt | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return;
      touchStart = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t || !touchStart) return;
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) + Math.abs(dy) < 24) {
        if (phaseRef.current === "idle") setPhase("play");
        return;
      }
      if (phaseRef.current === "idle") setPhase("play");
      if (Math.abs(dx) > Math.abs(dy)) applyDir(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      else applyDir(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    };

    window.addEventListener("keydown", onKey, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cw = w / COLS;
      const ch = h / ROWS;
      ctx.fillStyle = "#0a0908";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(139,147,156,0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cw, 0);
        ctx.lineTo(x * cw, h);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * ch);
        ctx.lineTo(w, y * ch);
        ctx.stroke();
      }
      ctx.fillStyle = "#e07a3d";
      ctx.fillRect(food.x * cw + 3, food.y * ch + 3, cw - 6, ch - 6);
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#ffb070" : "#c5ccd4";
        ctx.fillRect(seg.x * cw + 1.5, seg.y * ch + 1.5, cw - 3, ch - 3);
      });
    };

    const stop = startLoop((dt) => {
      if (phaseRef.current === "play") {
        acc += dt;
        const interval = Math.max(0.065, STEP - points * 0.002);
        while (acc >= interval) {
          acc -= interval;
          dir = queued;
          const head = snake[0];
          if (!head) break;
          const next = { x: head.x + dir.x, y: head.y + dir.y };
          const hitWall = next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS;
          const hitSelf = snake.some((s) => s.x === next.x && s.y === next.y);
          if (hitWall || hitSelf) {
            setPhase("over");
            setHigh(writeHighScore(SLUG, points));
            break;
          }
          snake = [next, ...snake];
          if (next.x === food.x && next.y === food.y) {
            points += 10;
            setScore(points);
            food = spawnFood(snake);
          } else {
            snake.pop();
          }
        }
      }
      draw();
    });

    return () => {
      stop();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [phase === "idle" ? "idle" : "run"]);

  const start = () => {
    setScore(0);
    setPhase("play");
  };

  return (
    <GameShell game={game} score={score} high={high}>
      <div className="cabinet-bezel relative overflow-hidden rounded-md p-2 sm:p-3">
        <canvas
          ref={canvasRef}
          width={800}
          height={640}
          className="block h-auto w-full touch-none bg-ink"
        />
        {phase !== "play" && (
          <div className="absolute inset-2 flex flex-col items-center justify-center gap-3 bg-ink/80 sm:inset-3">
            <p className="font-display text-5xl tracking-wide">
              {phase === "over" ? "Game over" : "Snake"}
            </p>
            <Button onClick={start}>{phase === "over" ? "Play again" : "Insert coin"}</Button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
