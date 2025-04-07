"use client";
import useSocket from "@/hooks/useSocket";
import { Box, Button, Grid, Typography } from "@mui/material";
import type { GameInProgress } from "@/shared/types";

export default function GameModePicker() {
	const socket = useSocket();
	const setGameMode = (mode: GameInProgress["mode"]) =>
		socket?.emit("modePicked", mode);

	return (
		<Box p={2}>
			<Typography>Pick a game mode...</Typography>
			<Grid container spacing={2}>
				<Grid>
					<Button
						variant="contained"
						color="primary"
						onClick={() => setGameMode("family_warm_up")}
					>
						All-family warmup
					</Button>
				</Grid>
				<Grid>
					<Button variant="contained" color="primary">
						Face-off
					</Button>
				</Grid>
				<Grid>
					<Button variant="contained" color="primary">
						Fast money
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
