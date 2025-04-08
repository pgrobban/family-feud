"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { isSocketDefined } from "@/shared/utils";
import { Box, Button } from "@mui/material";
import GameBoardWithScores from "../game/GameBoardWithScores";
import GameModePicker from "./GameModePicker";
import FamilyWarmupControls from "./FamilyWarmupControls";
import type { GameState } from "@/shared/types";
import FaceOffControls from "./FaceOffControls";

export default function Host() {
  const socket = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!isSocketDefined(socket)) {
      return;
    }

    const handleGameState = (gameState: GameState | null) =>
      setGameState(gameState);

    socket.emit("requestGameState");
    socket.on("receivedGameState", handleGameState);

    return () => {
      socket.off("receivedGameState", handleGameState);
    };
  }, [socket]);

  const cancelQuestion = () => socket?.emit("questionOrModeCancelled");

  if (!gameState) {
    return <Box>Connecting...</Box>;
  }
  return (
    <>
      <Box>
        <Box mb={2}>
          <GameBoardWithScores gameState={gameState} />
        </Box>
        {gameState.mode === "indeterminate" && <GameModePicker />}
        <FamilyWarmupControls gameState={gameState} />
        <FaceOffControls gameState={gameState} />
        {gameState.mode !== "indeterminate" && (
          <Box mt={10}>
            <Button
              onClick={cancelQuestion}
              variant="contained"
              color="secondary"
            >
              Cancel question
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
}
