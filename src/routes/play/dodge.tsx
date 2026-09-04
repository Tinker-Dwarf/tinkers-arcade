import { createFileRoute } from "@tanstack/react-router";
import { DodgeGame } from "@/components/games/dodge-game";

export const Route = createFileRoute("/play/dodge")({ component: DodgeGame });
