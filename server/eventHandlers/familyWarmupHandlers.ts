import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "../controllers/GameManager";
import { makeUpdateGame } from "./helpers";

export default function familyWarmupHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {
  const updateGame = makeUpdateGame(io, gameManager);

  socket.on("questionPicked", (question) => updateGame(socket, (game) => game.hostPickedQuestionForCurrentMode(question)));

  socket.on("joinHost", (gameId) => {
    const game = gameManager.getGame(gameId);
    if (game) {
      game.joinHost(socket.id);
      socket.join(game.id);
      io.to(game.id).emit("hostJoined", game.toJson());
      io.to(game.id).emit("receivedGameState", game.toJson());
    }
  });

  socket.on("questionOrModeCancelled", () => updateGame(socket, (game) => game.cancelQuestionOrMode()));

  socket.on("hostRequestedTeamAnswers", () => updateGame(socket, (game) => game.hostRequestedTeamAnswers()));

  socket.on("hostGatheredTeamAnswers", (team1Answers, team2Answers) => updateGame(socket, (game) => game.hostGatheredTeamAnswersFamilyWarmup(team1Answers, team2Answers)));

  socket.on("requestRevealTeamAnswers", () => updateGame(socket, (game) => game.revealTeamAnswersFamilyWarmup()));

  socket.on("awardTeamPoints", () => updateGame(socket, (game) => game.awardPointsFamilyWarmup()));

  socket.on("requestNewQuestion", () => updateGame(socket, (game) => game.requestNewQuestion()));

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("reconnect", (payload) => {
    const { oldSocketId } = payload;

    const game = gameManager.getGameBySocketId(oldSocketId);
    if (game) {
      console.log(`Updating socket ID from ${oldSocketId} to ${socket.id}`);

      // @ts-expect-error TODO
      game.playerSocketIds = game.playerSocketIds.map((id) =>
        id === oldSocketId ? socket.id : id
      );

      // @ts-expect-error TODO
      game.hostSocketIds = game.hostSocketIds.map((id) =>
        id === oldSocketId ? socket.id : id
      );
    }
  });
}