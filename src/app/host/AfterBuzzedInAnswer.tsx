"use client";
import useSocket from "@/hooks/useSocket";
import type { GameState } from "@/shared/types";
import { Box, Button, Grid, Typography } from "@mui/material";

export default function AfterBuzzedInAnswer({
	gameState,
}: {
	gameState: GameState;
}) {
	const socket = useSocket();

	if (gameState?.status !== "in_progress" || gameState?.mode !== "face_off") {
		return null;
	}

	const emitAskTeamToPlayOrPass = () =>
		socket?.emit("requestAskTeamToPlayOrPass");
	const emitRequestOtherTeamToBuzzInAnswer = () =>
		socket?.emit("requestOtherTeamBuzzInAnswer");

	if (gameState.modeStatus === "reveal_buzzed_in_answer") {
		return (
			<Box>
				<Typography>Was this the highest answer on the board?</Typography>
				<Grid container spacing={2}>
					<Grid>
						<Button variant="contained" onClick={emitAskTeamToPlayOrPass}>
							Yes
						</Button>
					</Grid>
					<Grid>
						<Button
							variant="contained"
							onClick={emitRequestOtherTeamToBuzzInAnswer}
						>
							No
						</Button>
					</Grid>
				</Grid>
			</Box>
		);
	}

	return (
		<Box>
			<Typography>Was this score higher than the previous team?</Typography>
			<Grid container spacing={2}>
				<Grid>
					<Button variant="contained" onClick={emitAskTeamToPlayOrPass}>
						Yes
					</Button>
				</Grid>
				<Grid>
					<Button variant="contained" onClick={emitAskTeamToPlayOrPass}>
						No
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
