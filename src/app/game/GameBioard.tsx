import { Typography } from "@mui/material";
import type Game from "../../../server/controllers/Game";
import FamilyWarmupGameBoard from "./FamilyWarmupGameBoard";

export default function GameBoard({ game }: { game: Game }) {
  switch (game.mode) {
    case "indeterminate":
      return <Typography>Waiting for host to pick a game mode...</Typography>;
    case "family_warm_up":
      return <FamilyWarmupGameBoard game={game} />;
  }
  return null;
}
