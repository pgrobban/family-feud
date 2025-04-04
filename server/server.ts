// server.ts
import { Server } from "socket.io";
import { createServer } from "node:http";
import GameManager from "./controllers/GameManager";

const PORT = 3002; // Dedicated WebSocket server port
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001", // Allow Next.js frontend
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("New client connected:", socket.id);

  socket.on("createGame", (teamNames) => {
    // console.log("Creating game with:", teamNames);
    GameManager.createGame(socket.id, teamNames);
    io.emit("gameCreated", teamNames);
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

  socket.on("joinHost", (gameId) => {
    const game = GameManager.getGame(gameId);
    game?.joinHost(socket.id);
    io.emit("hostJoined", game);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("reconnect", () => {
    console.log(`🔄 Reconnected: ${socket.id}`);

    // Find the game that was using the old socket ID
    // @ts-expect-error TODO
    const game = GameManager.getGameBySocketId(socket.handshake.query.oldSocketId);
    if (game) {
      console.log(`Updating socket ID from ${socket.handshake.query.oldSocketId} to ${socket.id}`);
      // @ts-expect-error TODO
      game.playerSocketIds = game.playerSocketIds.map(id =>
        id === socket.handshake.query.oldSocketId ? socket.id : id
      );
      // @ts-expect-error TODO
      game.hostSocketIds = game.hostSocketIds.map(id =>
        id === socket.handshake.query.oldSocketId ? socket.id : id
      );
    }
  });

  socket.onAny((evtName) => console.log("*** got evt", evtName));
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
