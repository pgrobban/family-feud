import { Typography } from "@mui/material";
import type Game from "../../../server/controllers/Game";

export default function FamilyWarmupGameBoard({ game }: { game: Game }) {
  if (game.mode !== "family_warm_up") {
    return null;
  }

  console.log("*** game", game);

  switch (game.modeStatus) {
    case "waiting_for_question":
      return <Typography>Waiting for host to pick question...</Typography>;
  }
  return null;
}
