import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "./controllers/GameManager";
import familyWarmupHandlers from './eventHandlers/familyWarmupHandlers';
import faceOffHandlers from './eventHandlers/faceOffHandlers';
import { makeUpdateGame } from "./eventHandlers/helpers";


export default function registerSocketHandlers(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server, gameManager: GameManager) {

  const updateGame = makeUpdateGame(io, gameManager);

  socket.on("createGame", (teamNames) => {
    gameManager.createGame(socket.id, teamNames);
    const game = gameManager.getGameBySocketId(socket.id);
    if (game) {
      socket.join(game.id);
      io.to(game.id).emit("gameCreated", game.toJson());
      io.emit("receivedGames", gameManager.getAllGames());
    }
  });

  socket.on("requestGames", () => {
    socket.emit("receivedGames", gameManager.getAllGames());
  });

  socket.on("requestGameState", () => updateGame(socket, (game) => game));

  socket.on("modePicked", (mode) => updateGame(socket, (game) => game.hostPickedMode(mode)));

  familyWarmupHandlers(socket, io, gameManager);
  faceOffHandlers(socket, io, gameManager);
}