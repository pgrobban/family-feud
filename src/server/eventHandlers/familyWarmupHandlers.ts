import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "../controllers/GameManager";
import bindUpdateGame from "./bindUpdateGame";

export default function familyWarmupHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {
  const updateGame = bindUpdateGame(socket, io, gameManager);

  socket.on("familyWarmup:hostRequestedTeamAnswers", () => updateGame((game) => game.hostRequestedTeamAnswers()));
  socket.on("familyWarmup:hostGatheredTeamAnswers", (team1Answers, team2Answers) => updateGame((game) => game.hostGatheredTeamAnswersFamilyWarmup(team1Answers, team2Answers)));
  socket.on("familyWarmup:requestRevealTeamAnswers", () => updateGame((game) => game.revealTeamAnswersFamilyWarmup()));
  socket.on("familyWarmup:requestAwardTeamPoints", () => updateGame((game) => game.awardPointsFamilyWarmup()));
}