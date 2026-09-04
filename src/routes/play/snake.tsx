import { createFileRoute } from "@tanstack/react-router";
import { SnakeGame } from "@/components/games/snake-game";

export const Route = createFileRoute("/play/snake")({ component: SnakeGame });
