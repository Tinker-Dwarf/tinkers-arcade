import { createFileRoute } from "@tanstack/react-router";
import { TetrisGame } from "@/components/games/tetris-game";

export const Route = createFileRoute("/play/tetris")({ component: TetrisGame });
