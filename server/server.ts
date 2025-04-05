// server.ts
import { Server, Socket } from "socket.io";
import { createServer } from "node:http";
import GameManager from "./controllers/GameManager";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";

const PORT = 3002; // Dedicated WebSocket server port
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on(
  "connection",
  (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    // console.log("New client connected:", socket.id);

    socket.on("createGame", (teamNames) => {
      GameManager.createGame(socket.id, teamNames);

      const game = GameManager.getGameBySocketId(socket.id);
      if (game) {
        io.emit("gameCreated", game.toJson());
      }

      io.emit("receivedGames", GameManager.getAllGames());
    });

    socket.on("requestGames", () => {
      io.emit("receivedGames", GameManager.getAllGames());
    });

    socket.on("requestGameState", () => {
      const game = GameManager.getGameBySocketId(socket.id);
      if (game) {
        socket.emit("receivedGameState", game.toJson());
      } else {
        socket.emit("receivedGameState", null);
      }
    });

    socket.on("modePicked", (mode) => {
      const game = GameManager.getGameBySocketId(socket.id);
      if (game) {
        game.hostPickedMode(mode);
        io.emit("receivedGameState", game.toJson());
      }
    });

    socket.on("questionPicked", (question) => {
      const game = GameManager.getGameBySocketId(socket.id);
      if (game) {
        game.hostPickedQuestion(question);
        io.emit("receivedGameState", game.toJson());
      }
    });

    socket.on("joinHost", (gameId) => {
      const game = GameManager.getGame(gameId);
      if (game) {
        game.joinHost(socket.id);
        io.emit("hostJoined", game.toJson());
        io.emit("receivedGameState", game.toJson());
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
    socket.on("reconnect", (payload) => {
      const { oldSocketId } = payload;

      const game = GameManager.getGameBySocketId(oldSocketId);
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

    socket.onAny((evtName) => console.log("*** got evt", evtName));
  }
);

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
