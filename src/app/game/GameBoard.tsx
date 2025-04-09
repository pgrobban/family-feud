import FamilyWarmupGameBoard from "./FamilyWarmupGameBoard";
import type { FaceOffGame, FamilyWarmUpGame, GameState } from "@/shared/types";
import FaceOffGameBoard from "./FaceOffGameBoard";
import LogoAndRoundBox from "./LogoAndRoundBox";

export default function GameBoard({ gameState }: { gameState: GameState }) {
  switch (gameState.mode) {
    case "indeterminate":
      return <LogoAndRoundBox round="" text="Waiting for host..." />;
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
