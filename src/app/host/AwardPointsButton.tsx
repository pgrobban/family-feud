import useSocket from "@/hooks/useSocket";
import type { FastMoneyGameState, GameState } from "@/shared/types";
import { Button } from "@mui/material";

export default function AwardPointsButton({
	gameState,
}: { gameState: GameState }) {
	const { mode } = gameState;
	const fastMoneyResponses =
		mode === "fast_money"
			? (gameState as FastMoneyGameState).responsesFirstTeam
			: [];
	const disabled = fastMoneyResponses?.some(
		(response) => !response.pointsRevealed,
	);

	const socket = useSocket();
	const requestAwardPoints = () =>
		socket?.emit(
			mode === "family_warm_up"
				? "familyWarmup:requestAwardTeamPoints"
				: mode === "face_off"
					? "faceOff:requestAwardPoints"
					: "fastMoney:requestAwardPoints",
		);

	return (
		<Button
			variant="contained"
			color="primary"
			onClick={requestAwardPoints}
			disabled={disabled}
		>
			Award points
		</Button>
	);
}
