import { Typography } from "@mui/material";
import type Game from "../../../server/controllers/Game";

export default function GameBoard({ game }: { game: Game }) {
	if (game.mode === "indeterminate") {
		return <Typography>Waiting for host to pick a game round...</Typography>;
	}
	return null;
}
