"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import type { GameState } from "@/shared/types";
import { isSocketDefined } from "@/shared/utils";
import { Box } from "@mui/material";
import GameBoardWithScores from "./GameBoardWithScores";

export default function Create() {
  const socket = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!isSocketDefined(socket)) {
      return;
    }

    const handleReceivedGameState = (gameState: GameState | null) => {
      setGameState(gameState);
    };

    socket.emit("requestGameState");
    socket.on("receivedGameState", handleReceivedGameState);

    return () => {
      socket.off("receivedGameState", handleReceivedGameState);
    };
  }, [socket]);

  if (!gameState) {
    return <Box>Connecting...</Box>;
  }

  return <GameBoardWithScores gameState={gameState} />;
}
