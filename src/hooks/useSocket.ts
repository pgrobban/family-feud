import type { GameEventMap } from "@/shared/gameEventMap";
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export default function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance: Socket<GameEventMap> = io({
      path: "/api/socket",
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}