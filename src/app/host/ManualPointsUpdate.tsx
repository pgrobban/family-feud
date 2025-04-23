"use client";
import useSocket from "@/hooks/useSocket";
import type { GameState } from "@/shared/types";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function ManualPointsUpdate({
	gameState,
}: { gameState: GameState }) {
	const [points, setPoints] = useState<[number, number]>([0, 0]);
	const socket = useSocket();

	useEffect(() => {
		setPoints([gameState.points[0], gameState.points[1]]);
	}, [gameState]);

	const requestSetPoints = () => socket?.emit("requestUpdatePoints", points);

	return (
		<Box mt={5} border={"1px solid red"} p={2}>
			<Typography mb={2}>Manually update points</Typography>
			<Grid container spacing={2}>
				<Grid flex={2}>
					<TextField
						type="number"
						value={points[0]}
						label={`Points for ${gameState.teamNames[0]}`}
						onChange={(evt) => setPoints([Number(evt.target.value), points[1]])}
					/>
				</Grid>
				<Grid flex={2}>
					<TextField
						type="number"
						value={points[1]}
						label={`Points for ${gameState.teamNames[1]}`}
						onChange={(evt) => setPoints([points[0], Number(evt.target.value)])}
					/>
				</Grid>
				<Grid flex={1}>
					<Button variant="contained" onClick={requestSetPoints}>
						Submit
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
