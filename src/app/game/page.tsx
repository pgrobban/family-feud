"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import type { Game } from "@/shared/types";
import { isSocketDefined } from "@/shared/utils";
import { Box } from "@mui/material";
import GameBoardWithScores from "./GameBoardWithScores";

export default function Create() {
  const socket = useSocket();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!isSocketDefined(socket)) {
      return;
    }

    const handleReceivedGame = (game: Game | null) => {
      setGame(game);
    };

    socket.emit("requestGame");
    socket.on("receivedGame", handleReceivedGame);

    return () => {
      socket.off("receivedGame", handleReceivedGame);
    };
  }, [socket]);

  if (!game) {
    return <Box>Connecting...</Box>;
  }

  return <GameBoardWithScores game={game} />;
}
