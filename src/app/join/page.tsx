"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import Game from "../../../server/controllers/Game";
// import { useRouter } from "next/navigation";
import { Box, Button, Grid, Typography } from "@mui/material";

export default function Create() {
  const socket = useSocket();
  // const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit("requestGames");
    socket.on("receivedGames", (games: Game[]) => setGames(games));
  }, [socket]);

  const onJoin = (id: string) => socket?.emit("joinHost", id);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h3">Select a game to join</Typography>
      {games.map(({ id, gameState }) => {
        const teamNames = gameState.teamsAndPoints.map(
          ({ teamName }) => teamName
        );
        return (
          <Grid container spacing={2} key={id}>
            <Grid>{id}</Grid>
            <Grid>{teamNames.join(", ")}</Grid>
            <Grid>{gameState.status}</Grid>
            <Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={() => onJoin(id)}
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
