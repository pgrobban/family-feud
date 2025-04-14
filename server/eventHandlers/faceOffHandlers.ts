import type { Server, Socket } from "socket.io";
import type GameManager from "../controllers/GameManager";
import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import bindUpdateGame from "./bindUpdateGame";

export default function registerFaceOffSocketEvents(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {
  const updateGame = bindUpdateGame(socket, io, gameManager);

  socket.on("faceOff:submitBuzzInAnswer", (team, answerText) => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;

    const emitNow = game.submitBuzzInAnswer(team, answerText);
    if (emitNow) {
      io.to(game.id).emit("receivedGameState", game.toJson());
    }
  });

  socket.on('faceOff:requestOtherTeamBuzzInAnswer', () => updateGame((game) => game.requestOtherTeamToBuzzInAnswer()));
  socket.on('faceOff:receivedPlayOrPass', (choice) => updateGame((game) => game.receivedPlayOrPass(choice)));
  socket.on('faceOff:requestAskTeamToPlayOrPass', () => updateGame((game) => game.requestAskTeamToPlayOrPass()));

  socket.on("faceOff:receivedAnswer", (answerText) => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;

    const emitNow = game.receivedFaceOffAnswer(answerText);
    if (emitNow) {
      io.to(game.id).emit("receivedGameState", game.toJson());
    }
  });

  socket.on("faceOff:receivedStealAnswer", (answerText) => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;

    const emitNow = game.receivedStealAnswer(answerText);
    if (emitNow) {
      io.to(game.id).emit("receivedGameState", game.toJson());
    }
  });

  socket.on("faceOff:awardTeamPoints", () => updateGame((game) => game.awardPointsFaceOff()));
}
