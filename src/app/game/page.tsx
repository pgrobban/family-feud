"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import type { GameState } from "@/shared/types";
import { isSocketDefined } from "@/shared/utils";
import { Box, Typography } from "@mui/material";
import GameBoardWithScores from "./GameBoardWithScores";
import { useRouter } from "next/navigation";

export default function Create() {
  const socket = useSocket();
  const [statusMessage, setStatusMessage] = useState("Connecting...");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isSocketDefined(socket)) {
      return;
    }

    const handleReceivedGameState = (gameState: GameState | null) => {
      setGameState(gameState);
      setStatusMessage("");
    };

    const handleHostLeft = () => {
      setStatusMessage("Host left. Returning to create game screen.");
      setTimeout(() => {
        router.push("/create");
      }, 1000);
    };

    socket.emit("requestGameState");
    socket.on("receivedGameState", handleReceivedGameState);
    socket.on("hostLeft", handleHostLeft);

    return () => {
      socket.off("receivedGameState", handleReceivedGameState);
      socket.off("hostLeft", handleHostLeft);
    };
  }, [socket, router]);

  if (!gameState) {
    return <Box>{statusMessage}</Box>;
  }

  return (
    <Box>
      {statusMessage && <Typography>{statusMessage}</Typography>}
      {gameState && <GameBoardWithScores gameState={gameState} />}
    </Box>
  );
}
