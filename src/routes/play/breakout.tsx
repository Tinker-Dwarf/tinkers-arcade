import { createFileRoute } from "@tanstack/react-router";
import { BreakoutGame } from "@/components/games/breakout-game";

export const Route = createFileRoute("/play/breakout")({ component: BreakoutGame });
