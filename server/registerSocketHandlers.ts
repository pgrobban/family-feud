import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "./controllers/GameManager";
import familyWarmupHandlers from './eventHandlers/familyWarmupHandlers';
import faceOffHandlers from './eventHandlers/faceOffHandlers';
import bindUpdateGame from "./eventHandlers/bindUpdateGame";
import type { GameState } from "@/shared/types";
import fastMoneyHandlers from "./eventHandlers/fastMoneyGameHandlers";


export default function registerSocketHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {

  const updateGame = bindUpdateGame(socket, io, gameManager);

  socket.on("createGame", (teamNames) => {
    gameManager.createGame(socket.id, teamNames);
    const game = gameManager.getGameBySocketId(socket.id);
    if (game) {
      socket.join(game.id);
      io.to(game.id).emit("gameCreated", game.toJson());
      io.emit("receivedGames", gameManager.getAllGames());
    }
  });

  socket.on("requestGames", () => socket.emit("receivedGames", gameManager.getAllGames() as GameState[]));

  socket.on("requestGameState", () => updateGame((game) => game));

  socket.on("modePicked", (mode) => updateGame((game) => game.hostPickedMode(mode)));

  familyWarmupHandlers(socket, io, gameManager);
  faceOffHandlers(socket, io, gameManager);
  fastMoneyHandlers(socket, io, gameManager);
}