import { Server, type Socket } from "socket.io";
import { createServer } from "node:http";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import registerSocketHandlers from "./registerSocketHandlers";
import GameManager from "./controllers/GameManager";
import dotenv from "dotenv";
dotenv.config();

const { SOCKET_IO_PORT, CORS_ORIGIN } = process.env;

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [
      "http://localhost:3001",
      ...(CORS_ORIGIN ? [...CORS_ORIGIN.split(",")] : [])
    ],
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

httpServer.listen(SOCKET_IO_PORT, () => {
  console.log(
    `✅ Socket.IO server running on http://localhost:${SOCKET_IO_PORT}`
  );
});
