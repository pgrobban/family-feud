import { Server, type Socket } from "socket.io";
import { createServer } from "node:http";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import registerSocketHandlers from "./registerSocketHandlers";

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
    registerSocketHandlers(socket, io);
    socket.onAny((evtName) => console.log("*** got evt", evtName));
  }
);

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
