import { Typography } from "@mui/material";
import FamilyWarmupGameBoard from "./FamilyWarmupGameBoard";
import { GameState } from "@/shared/types";

export default function GameBoard({ gameState }: { gameState: GameState }) {
  switch (gameState.mode) {
    case "indeterminate":
      return <Typography>Waiting for host to pick a game mode...</Typography>;
    case "family_warm_up":
      return <FamilyWarmupGameBoard gameState={gameState} />;
  }
  return null;
}
