"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import Game from "../../../server/controllers/Game";
// import { useRouter } from "next/navigation";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Create() {
  const socket = useSocket();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [gameSelected, setGameSelected] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleReceivedGames = (games: Game[]) => setGames(games);
    const handleReceivedGameState = () => router.push("/host");

    socket.emit("requestGames");
    socket.on("receivedGames", handleReceivedGames);
    socket.on("receivedGameState", handleReceivedGameState);

    return () => {
      socket.off("receivedGames", handleReceivedGames);
      socket.off("receivedGameState", handleReceivedGameState);
    };
  }, [socket, router]);

  const onJoin = (gameId: string) => {
    setGameSelected(true);
    socket?.emit("joinHost", gameId);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h3">
        {gameSelected ? "Connecting..." : "Select a game to join"}
      </Typography>
      {games.map(({ id, teamNames, status }) => {
        return (
          <Grid container spacing={2} key={id}>
            <Grid>{id}</Grid>
            <Grid>{teamNames.join(", ")}</Grid>
            <Grid>{status}</Grid>
            <Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onJoin(id)}
                disabled={gameSelected}
              >
                Join
              </Button>
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
}
