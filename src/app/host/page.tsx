"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { isSocketDefined } from "@/shared/utils";
import { Box } from "@mui/material";
import GameBoardWithScores from "../game/GameBoardWithScores";
import Game from "../../../server/controllers/Game";
import GameModePicker from "./GameModePicker";

export default function Host() {
  const socket = useSocket();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!isSocketDefined(socket)) {
      return;
    }

    const handleGameState = (game: Game | null) => setGame(game);

    socket.emit("requestGame");
    socket.on("receivedGame", handleGameState);

    return () => {
      socket.off("receivedGame", handleGameState);
    };
  }, [socket]);

  if (!game) {
    return <Box>Connecting...</Box>;
  }

  return (
    <Box>
      <GameBoardWithScores game={game} />
      {game.mode === "indeterminate" && <GameModePicker />}
    </Box>
  );
}
