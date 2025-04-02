import { Server as ServerIO, type Socket } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "node:http";
import type { Duplex } from "node:stream";
interface SocketServer extends HTTPServer {
  io?: ServerIO;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket) {
    return res.status(500).json({ error: "Socket not available" });
  }

  const server = res.socket as unknown as Duplex & { server: SocketServer };
  if (!server.server.io) {
    const io = new ServerIO(server.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket: Socket) => {
      console.log("A user connected:", socket.id);

      socket.on("message", (data: string) => {
        console.log("Message received:", data);
        socket.broadcast.emit("message", data);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    server.server.io = io;
  }

  res.end();
}