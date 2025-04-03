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
  console.log("New client connected:", socket.id);

  socket.on("createGame", (teamNames) => {
    console.log("Creating game with:", teamNames);
    GameManager.createGame(teamNames);
    io.emit("gameCreated", teamNames);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
