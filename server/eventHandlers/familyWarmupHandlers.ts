import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "../controllers/GameManager";
import bindUpdateGame from "./bindUpdateGame";

export default function familyWarmupHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {
  const updateGame = bindUpdateGame(socket, io, gameManager);

  socket.on("questionPicked", (question) => updateGame((game) => game.hostPickedQuestionForCurrentMode(question)));
  socket.on("questionOrModeCancelled", () => updateGame((game) => game.cancelQuestionOrMode()));
  socket.on("hostRequestedTeamAnswers", () => updateGame((game) => game.hostRequestedTeamAnswers()));
  socket.on("hostGatheredTeamAnswers", (team1Answers, team2Answers) => updateGame((game) => game.hostGatheredTeamAnswersFamilyWarmup(team1Answers, team2Answers)));
  socket.on("requestRevealTeamAnswers", () => updateGame((game) => game.revealTeamAnswersFamilyWarmup()));
  socket.on("awardTeamPoints", () => updateGame((game) => game.awardPoints()));
  socket.on("requestNewQuestion", () => updateGame((game) => game.requestNewQuestion()));
}