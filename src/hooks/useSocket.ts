import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export default function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance: Socket = io("http://localhost:3002");

    socketInstance.on("connect", () => {
      console.log("✅ Connected to Socket.IO server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}