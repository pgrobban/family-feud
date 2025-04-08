import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/gameEventMap";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

// Store the socket instance outside of the component scope
let socketInstance: Socket<ClientToServerEvents> | null = null;

export default function useSocket(): Socket<ClientToServerEvents & ServerToClientEvents> | null {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io("http://localhost:3002");

      socketInstance.on("connect", () => {
        console.log("✅ Connected to Socket.IO server:", socketInstance!.id);
      });

      socketInstance.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.IO server");
      });

      setSocket(socketInstance);
    }

    return () => {
      // Don't disconnect here! We want it to persist across pages.
    };
  }, []);

  return socket;
}
