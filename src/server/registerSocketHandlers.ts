import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "./controllers/GameManager";
import familyWarmupHandlers from "./eventHandlers/familyWarmupHandlers";
import faceOffHandlers from "./eventHandlers/faceOffHandlers";
import bindUpdateGame from "./eventHandlers/bindUpdateGame";
import type { GameState } from "@/shared/types";
import fastMoneyHandlers from "./eventHandlers/fastMoneyGameHandlers";

export default function registerSocketHandlers(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ServerToClientEvents>,
  gameManager: GameManager
) {
  familyWarmupHandlers(socket, io, gameManager);
  faceOffHandlers(socket, io, gameManager);
  fastMoneyHandlers(socket, io, gameManager);

  const updateGame = bindUpdateGame(socket, io, gameManager);

  socket.on("createGame", (teamNames) => {
    gameManager.createGame(socket.id, teamNames);
    const game = gameManager.getGameBySocketId(socket.id);
    if (game) {
      socket.join(game.id);
      io.to(game.id).emit("gameCreated", game.toJson() as GameState);
      io.emit("receivedGames", gameManager.getAllGames() as GameState[]);
    }
  });

  socket.on("joinHost", (gameId) => {
    const game = gameManager.getGame(gameId);
    if (game) {
      game.joinHost(socket.id);
      socket.join(game.id);
      const state = game.toJson() as GameState;
      io.to(game.id).emit("hostJoined", state);
      io.to(game.id).emit("receivedGameState", state);
    }
  });

  socket.on("requestGames", () =>
    socket.emit("receivedGames", gameManager.getAllGames() as GameState[])
  );
  socket.on("requestGameState", () => updateGame((game) => game));
  socket.on("modePicked", (mode) =>
    updateGame((game) => game.hostPickedMode(mode))
  );
  socket.on("requestEndGame", () => updateGame((game) => game.endGame()));
  socket.on("hostRequestedQuit", () => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (game) {
      socket.leave(game.id);
      socket.broadcast.to(game.id).emit("hostLeft");
    }
  });

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

  socket.on("requestStartTimer", (seconds) =>
    updateGame((game) => io.to(game.id).emit("timerStarted", seconds))
  );
  socket.on("requestCancelTimer", () =>
    updateGame((game) => io.to(game.id).emit("timerCancelled"))
  );
  socket.on("questionOrModeCancelled", () =>
    updateGame((game) => game.cancelQuestionOrMode())
  );
  socket.on("requestNewQuestion", () =>
    updateGame((game) => game.requestNewQuestion())
  );
  socket.on("questionPicked", (question) =>
    updateGame((game) => game.hostPickedQuestionForCurrentMode(question))
  );
}
