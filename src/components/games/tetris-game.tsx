import { useEffect, useRef, useState } from "react";
import { startLoop } from "@/lib/games/loop";
import { readHighScore, writeHighScore } from "@/lib/games/scores";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/arcade/game-shell";
import { GAMES } from "@/lib/games/catalog";

const COLS = 10;
const ROWS = 20;
const HIDDEN = 2;
const TOTAL = ROWS + HIDDEN;
const SLUG = "tetris";
const game = GAMES[1];

type Piece = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type Cell = 0 | Piece;
type Rot = 0 | 1 | 2 | 3;

const ORDER: Piece[] = ["I", "O", "T", "S", "Z", "J", "L"];

const SHAPES: Record<Piece, number[][][]> = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
};

const JLSTZ: Record<string, [number, number][]> = {
  "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "1>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "3>2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "0>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

const I_KICKS: Record<string, [number, number][]> = {
  "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1>0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2>1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3>2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "0>3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

const COLORS: Record<Piece, string> = {
  I: "#8b939c",
  O: "#ffb070",
  T: "#c5ccd4",
  S: "#e07a3d",
  Z: "#9a3b24",
  J: "#6d7680",
  L: "#e07a3d",
};

const LINE_SCORE = [0, 100, 300, 500, 800];

function emptyBoard(): Cell[][] {
  return Array.from({ length: TOTAL }, () => Array<Cell>(COLS).fill(0));
}

function shuffleBag(): Piece[] {
  const bag = [...ORDER];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = bag[i];
    const b = bag[j];
    if (a && b) {
      bag[i] = b;
      bag[j] = a;
    }
  }
  return bag;
}

type Active = { type: Piece; rot: Rot; x: number; y: number };

function cellsOf(p: Active): [number, number][] {
  return SHAPES[p.type][p.rot]!.map(([cx, cy]) => [p.x + cx, p.y + cy]);
}

function fits(board: Cell[][], p: Active) {
  return cellsOf(p).every(([x, y]) => x >= 0 && x < COLS && y >= 0 && y < TOTAL && !board[y]?.[x]);
}

function spawn(type: Piece): Active {
  return { type, rot: 0, x: 3, y: 0 };
}

export function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(0);
  const [lines, setLines] = useState(0);
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

    let board = emptyBoard();
    let bag: Piece[] = [];
    const take = (): Piece => {
      if (bag.length === 0) bag = shuffleBag();
      return bag.shift() ?? "T";
    };
    let queue: Piece[] = [take(), take(), take()];
    let active = spawn(take());
    let hold: Piece | null = null;
    let heldThis = false;
    let fall = 0;
    let lock = 0;
    let lockResets = 0;
    let points = 0;
    let cleared = 0;
    let level = 1;
    let das = 0;
    let dasDir = 0;
    let soft = false;

    const refill = () => {
      while (queue.length < 3) queue.push(take());
    };

    const ghostY = () => {
      let g = { ...active };
      while (fits(board, { ...g, y: g.y + 1 })) g = { ...g, y: g.y + 1 };
      return g;
    };

    const lockPiece = () => {
      for (const [x, y] of cellsOf(active)) {
        if (board[y]) board[y][x] = active.type;
      }
      const full: number[] = [];
      for (let y = 0; y < TOTAL; y++) {
        if (board[y]?.every((c) => c !== 0)) full.push(y);
      }
      if (full.length) {
        board = board.filter((_, y) => !full.includes(y));
        while (board.length < TOTAL) board.unshift(Array<Cell>(COLS).fill(0));
        const n = full.length;
        points += (LINE_SCORE[n] ?? 0) * level;
        cleared += n;
        level = 1 + Math.floor(cleared / 10);
        setScore(points);
        setLines(cleared);
      }
      heldThis = false;
      refill();
      const next = spawn(queue.shift() ?? take());
      if (!fits(board, next)) {
        setPhase("over");
        setHigh(writeHighScore(SLUG, points));
        return;
      }
      active = next;
      lock = 0;
      lockResets = 0;
    };

    const tryMove = (dx: number, dy: number) => {
      const next = { ...active, x: active.x + dx, y: active.y + dy };
      if (!fits(board, next)) return false;
      active = next;
      if (dy === 0) {
        lock = 0;
        lockResets = Math.min(15, lockResets + 1);
      }
      return true;
    };

    const tryRotate = (dir: 1 | -1) => {
      const from = active.rot;
      const to = ((from + dir + 4) % 4) as Rot;
      const key = `${from}>${to}`;
      const kicks = active.type === "O" ? [[0, 0] as [number, number]] : active.type === "I" ? I_KICKS[key] : JLSTZ[key];
      for (const [kx, ky] of kicks ?? [[0, 0]]) {
        const next = { ...active, rot: to, x: active.x + kx, y: active.y - ky };
        if (fits(board, next)) {
          active = next;
          lock = 0;
          lockResets = Math.min(15, lockResets + 1);
          return;
        }
      }
    };

    const hardDrop = () => {
      let n = 0;
      while (tryMove(0, 1)) n++;
      points += n * 2;
      setScore(points);
      lockPiece();
    };

    const doHold = () => {
      if (heldThis) return;
      heldThis = true;
      const current = active.type;
      if (hold) {
        active = spawn(hold);
        hold = current;
      } else {
        refill();
        hold = current;
        active = spawn(queue.shift() ?? take());
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current === "idle") {
        if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space", "KeyZ", "KeyX", "KeyC"].includes(e.code)) {
          e.preventDefault();
          setPhase("play");
        }
        return;
      }
      if (phaseRef.current !== "play") return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(e.code)) e.preventDefault();
      if (e.code === "ArrowLeft") {
        tryMove(-1, 0);
        dasDir = -1;
        das = 0;
      }
      if (e.code === "ArrowRight") {
        tryMove(1, 0);
        dasDir = 1;
        das = 0;
      }
      if (e.code === "ArrowDown") soft = true;
      if (e.code === "ArrowUp" || e.code === "KeyX") tryRotate(1);
      if (e.code === "KeyZ") tryRotate(-1);
      if (e.code === "Space") hardDrop();
      if (e.code === "KeyC") doHold();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" && dasDir === -1) dasDir = 0;
      if (e.code === "ArrowRight" && dasDir === 1) dasDir = 0;
      if (e.code === "ArrowDown") soft = false;
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    const cell = 28;
    const ox = 16;
    const oy = 16;

    const drawMini = (type: Piece | null, px: number, py: number) => {
      if (!type) {
        ctx.strokeStyle = "rgba(139,147,156,0.25)";
        ctx.strokeRect(px, py, cell * 4, cell * 3);
        return;
      }
      ctx.fillStyle = COLORS[type];
      for (const [x, y] of SHAPES[type][0]!) {
        ctx.fillRect(px + x * (cell * 0.7), py + y * (cell * 0.7), cell * 0.65, cell * 0.65);
      }
    };

    const draw = () => {
      ctx.fillStyle = "#0a0908";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#12110f";
      ctx.fillRect(ox, oy, COLS * cell, ROWS * cell);
      for (let y = HIDDEN; y < TOTAL; y++) {
        for (let x = 0; x < COLS; x++) {
          const v = board[y]?.[x];
          if (!v) continue;
          ctx.fillStyle = COLORS[v];
          ctx.fillRect(ox + x * cell + 1, oy + (y - HIDDEN) * cell + 1, cell - 2, cell - 2);
        }
      }
      const g = ghostY();
      ctx.strokeStyle = "rgba(239,230,216,0.35)";
      for (const [x, y] of cellsOf(g)) {
        if (y < HIDDEN) continue;
        ctx.strokeRect(ox + x * cell + 2, oy + (y - HIDDEN) * cell + 2, cell - 4, cell - 4);
      }
      ctx.fillStyle = COLORS[active.type];
      for (const [x, y] of cellsOf(active)) {
        if (y < HIDDEN) continue;
        ctx.fillRect(ox + x * cell + 1, oy + (y - HIDDEN) * cell + 1, cell - 2, cell - 2);
      }
      ctx.fillStyle = "#efe6d8";
      ctx.font = "600 12px 'IBM Plex Mono', monospace";
      ctx.fillText("NEXT", ox + COLS * cell + 24, oy + 16);
      queue.forEach((p, i) => drawMini(p, ox + COLS * cell + 24, oy + 28 + i * 72));
      ctx.fillStyle = "#efe6d8";
      ctx.fillText("HOLD", ox + COLS * cell + 24, oy + 260);
      drawMini(hold, ox + COLS * cell + 24, oy + 272);
      ctx.fillText(`LV ${level}`, ox + COLS * cell + 24, oy + 400);
      ctx.fillText(`LN ${cleared}`, ox + COLS * cell + 24, oy + 420);
    };

    const stop = startLoop((dt) => {
      if (phaseRef.current === "play") {
        if (dasDir !== 0) {
          das += dt;
          if (das > 0.16) {
            const step = 0.035;
            while (das > 0.16 + step) {
              das -= step;
              tryMove(dasDir, 0);
            }
          }
        }
        const interval = soft ? 0.04 : Math.max(0.08, 0.8 * Math.pow(0.85, level - 1));
        const grounded = !fits(board, { ...active, y: active.y + 1 });
        if (grounded) {
          lock += dt;
          if (lock >= 0.5 || lockResets >= 15) lockPiece();
        } else {
          fall += dt;
          while (fall >= interval) {
            fall -= interval;
            if (tryMove(0, 1) && soft) {
              points += 1;
              setScore(points);
            }
          }
        }
      }
      draw();
    });

    return () => {
      stop();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [phase === "idle" ? "idle" : "run"]);

  return (
    <GameShell
      game={game}
      score={score}
      high={high}
      extra={
        <div className="grid grid-cols-4 gap-2 sm:hidden">
          <Button variant="steel" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }))}>
            Left
          </Button>
          <Button variant="steel" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyZ" }))}>
            Rot
          </Button>
          <Button variant="steel" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }))}>
            Right
          </Button>
          <Button onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }))}>Drop</Button>
        </div>
      }
    >
      <div className="cabinet-bezel relative overflow-hidden rounded-md p-2 sm:p-3">
        <canvas ref={canvasRef} width={480} height={600} className="mx-auto block h-auto w-full max-w-[480px] bg-ink" />
        {phase !== "play" && (
          <div className="absolute inset-2 flex flex-col items-center justify-center gap-3 bg-ink/80 sm:inset-3">
            <p className="font-display text-5xl tracking-wide">{phase === "over" ? "Topped out" : "Tetris"}</p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-steel">Lines {lines}</p>
            <Button
              onClick={() => {
                setScore(0);
                setLines(0);
                setPhase("play");
              }}
            >
              {phase === "over" ? "Play again" : "Insert coin"}
            </Button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
