import { Server, type Socket } from "socket.io";
import { createServer } from "node:http";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import registerSocketHandlers from "./registerSocketHandlers";
import GameManager from "./controllers/GameManager";

const PORT = 3002; // Dedicated WebSocket server port
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
const gameManager = new GameManager(io);

io.on(
  "connection",
  (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    registerSocketHandlers(socket, io, gameManager);
    socket.onAny((evtName) => console.log("*** got evt", evtName));
  }
);

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
