import useSocket from "@/hooks/useSocket";
import { Box, Typography, Grid, Button } from "@mui/material";

export default function QuestionOverControls() {
	const socket = useSocket();
	const requestNewQuestion = () => socket?.emit("requestNewQuestion");
	const requestNewGameMode = () => socket?.emit("questionOrModeCancelled");
	const requestEndGame = () => socket?.emit("requestEndGame");

	return (
		<Box>
			<Typography>Question over</Typography>

			<Grid container spacing={2}>
				<Grid>
					<Button variant="contained" onClick={requestNewQuestion}>
						New question
					</Button>
				</Grid>
				<Grid>
					<Button variant="contained" onClick={requestNewGameMode}>
						New game mode
					</Button>
				</Grid>
				<Grid>
					<Button variant="contained" onClick={requestEndGame}>
						End game & declare winner
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
