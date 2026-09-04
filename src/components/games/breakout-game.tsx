import { useEffect, useRef, useState } from "react";
import { startLoop } from "@/lib/games/loop";
import { readHighScore, writeHighScore } from "@/lib/games/scores";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/arcade/game-shell";
import { GAMES } from "@/lib/games/catalog";

const W = 720;
const H = 480;
const SLUG = "breakout";
const game = GAMES[2];
const COLS = 10;
const ROWS = 6;
const BRICK_W = 64;
const BRICK_H = 18;
const GAP = 6;
const PADDLE_W = 96;
const PADDLE_H = 12;
const BALL_R = 6;

type Brick = { x: number; y: number; hp: number; live: boolean };

function makeBricks(): Brick[] {
  const ox = (W - COLS * (BRICK_W + GAP) + GAP) / 2;
  const bricks: Brick[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: ox + c * (BRICK_W + GAP),
        y: 48 + r * (BRICK_H + GAP),
        hp: ROWS - r,
        live: true,
      });
    }
  }
  return bricks;
}

const HP_COLOR = ["#2a2620", "#9a3b24", "#e07a3d", "#ffb070", "#c5ccd4", "#efe6d8"];

export function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over" | "win">("idle");
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

    let paddleX = (W - PADDLE_W) / 2;
    let ballX = W / 2;
    let ballY = H - 80;
    let vx = 180;
    let vy = -240;
    let bricks = makeBricks();
    let points = 0;
    let lives = 3;
    const keys = { l: false, r: false };

    const aimFromPointer = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      paddleX = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.l = e.type === "keydown";
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.r = e.type === "keydown";
      if (e.type === "keydown" && phaseRef.current === "idle") setPhase("play");
    };
    const onMove = (e: MouseEvent) => aimFromPointer(e.clientX);
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

    const resetBall = () => {
      ballX = paddleX + PADDLE_W / 2;
      ballY = H - 80;
      vx = 180 * (Math.random() > 0.5 ? 1 : -1);
      vy = -240;
    };

    const stop = startLoop((dt) => {
      if (phaseRef.current === "play") {
        const speed = 420;
        if (keys.l) paddleX -= speed * dt;
        if (keys.r) paddleX += speed * dt;
        paddleX = Math.max(0, Math.min(W - PADDLE_W, paddleX));

        ballX += vx * dt;
        ballY += vy * dt;
        if (ballX < BALL_R) {
          ballX = BALL_R;
          vx = Math.abs(vx);
        }
        if (ballX > W - BALL_R) {
          ballX = W - BALL_R;
          vx = -Math.abs(vx);
        }
        if (ballY < BALL_R) {
          ballY = BALL_R;
          vy = Math.abs(vy);
        }

        if (
          ballY + BALL_R >= H - 36 &&
          ballY + BALL_R <= H - 36 + PADDLE_H + 8 &&
          ballX >= paddleX &&
          ballX <= paddleX + PADDLE_W &&
          vy > 0
        ) {
          const hit = (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
          vx = 280 * hit;
          vy = -Math.abs(vy);
          ballY = H - 36 - BALL_R;
        }

        for (const b of bricks) {
          if (!b.live) continue;
          if (
            ballX + BALL_R > b.x &&
            ballX - BALL_R < b.x + BRICK_W &&
            ballY + BALL_R > b.y &&
            ballY - BALL_R < b.y + BRICK_H
          ) {
            b.hp -= 1;
            if (b.hp <= 0) {
              b.live = false;
              points += 50;
            } else points += 10;
            setScore(points);
            const overlapX = Math.min(ballX + BALL_R - b.x, b.x + BRICK_W - (ballX - BALL_R));
            const overlapY = Math.min(ballY + BALL_R - b.y, b.y + BRICK_H - (ballY - BALL_R));
            if (overlapX < overlapY) vx *= -1;
            else vy *= -1;
            break;
          }
        }

        if (bricks.every((b) => !b.live)) {
          setPhase("win");
          setHigh(writeHighScore(SLUG, points));
        }
        if (ballY > H + 20) {
          lives -= 1;
          if (lives <= 0) {
            setPhase("over");
            setHigh(writeHighScore(SLUG, points));
          } else resetBall();
        }
      }

      ctx.fillStyle = "#0a0908";
      ctx.fillRect(0, 0, W, H);
      for (const b of bricks) {
        if (!b.live) continue;
        ctx.fillStyle = HP_COLOR[Math.min(b.hp, HP_COLOR.length - 1)] ?? "#e07a3d";
        ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      }
      ctx.fillStyle = "#c5ccd4";
      ctx.fillRect(paddleX, H - 36, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "#e07a3d";
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8b939c";
      ctx.font = "600 12px 'IBM Plex Mono', monospace";
      ctx.fillText(`BALLS ${lives}`, 16, 24);
    });

    return () => {
      stop();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
    };
  }, [phase === "idle" ? "idle" : "run"]);

  const label = phase === "over" ? "Drained" : phase === "win" ? "Wall down" : "Breakout";

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
            <p className="font-display text-5xl tracking-wide">{label}</p>
            <Button
              onClick={() => {
                setScore(0);
                setPhase("play");
              }}
            >
              {phase === "idle" ? "Insert coin" : "Play again"}
            </Button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
