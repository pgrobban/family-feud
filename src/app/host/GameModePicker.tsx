"use client";
import useSocket from "@/hooks/useSocket";
import type { Mode } from "@/shared/types";
import { Box, Button, Grid, Typography } from "@mui/material";

export default function GameModePicker() {
	const socket = useSocket();
	const setGameMode = (mode: Exclude<Mode, "indeterminate">) =>
		socket?.emit("modePicked", mode);

	return (
		<Box mb={2}>
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
					<Button
						variant="contained"
						color="primary"
						onClick={() => setGameMode("face_off")}
					>
						Face-off
					</Button>
				</Grid>
				<Grid>
					<Button
						variant="contained"
						color="primary"
						onClick={() => setGameMode("fast_money")}
					>
						Fast money
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
