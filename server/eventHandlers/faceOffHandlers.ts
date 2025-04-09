import type { Server, Socket } from "socket.io";
import type GameManager from "../controllers/GameManager";
import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import { makeUpdateGame } from "./helpers";

export default function registerFaceOffSocketEvents(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {
  const updateGame = makeUpdateGame(io, gameManager);

  socket.on("submitBuzzInAnswer", (team, answerText) => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;

    const emitNow = game.submitBuzzInAnswer(team, answerText);
    if (emitNow) {
      io.to(game.id).emit("receivedGameState", game.toJson());
    }
  });

  socket.on('requestOtherTeamBuzzInAnswer', () => updateGame(socket, (game) => game.requestOtherTeamToBuzzInAnswer()));
}
