import { Typography } from "@mui/material";
import FamilyWarmupGameBoard from "./FamilyWarmupGameBoard";
import type { FaceOffGame, FamilyWarmUpGame, GameState } from "@/shared/types";
import FaceOffGameBoard from "./FaceOffGameBoard";

export default function GameBoard({ gameState }: { gameState: GameState }) {
  switch (gameState.mode) {
    case "indeterminate":
      return <Typography>Waiting for host to pick a game mode...</Typography>;
    case "family_warm_up":
      return (
        <FamilyWarmupGameBoard
          gameState={gameState as GameState & FamilyWarmUpGame}
        />
      );
    case "face_off":
      return (
        <FaceOffGameBoard gameState={gameState as GameState & FaceOffGame} />
      );
  }
  return null;
}
