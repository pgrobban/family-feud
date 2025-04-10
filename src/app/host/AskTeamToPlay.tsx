import useSocket from "@/hooks/useSocket";
import { Box, Button, Grid, Typography } from "@mui/material";

export default function AskTeamToPlay({
	teamNames,
	currentTeam,
}: { teamNames: string[]; currentTeam: 1 | 2 }) {
	const socket = useSocket();
	const emitPlayOrPass = (choice: "play" | "pass") =>
		socket?.emit("receivedPlayOrPass", choice);

	return (
		<Box>
			<Typography>
				Does {teamNames[currentTeam - 1]} want to play or pass?
			</Typography>
			<Grid container spacing={2}>
				<Grid>
					<Button variant="contained" onClick={() => emitPlayOrPass("play")}>
						Play
					</Button>
				</Grid>
				<Grid>
					<Button variant="contained" onClick={() => emitPlayOrPass("pass")}>
						Pass
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
