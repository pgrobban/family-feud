import type { Server, Socket } from "socket.io";
import type Game from "../controllers/Game";
import type GameManager from "../controllers/GameManager";

export function makeUpdateGame(io: Server, gameManager: GameManager) {
  return function updateGame(
    socket: Socket,
    updateFn: (game: Game) => void
  ): void {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;

    updateFn(game);
    io.to(game.id).emit("receivedGameState", game.toJson());
  };
}