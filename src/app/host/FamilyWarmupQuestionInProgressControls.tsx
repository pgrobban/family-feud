import useSocket from "@/hooks/useSocket";
import { Button, Grid } from "@mui/material";

export default function FamilyWarmupQuestionInProgressControls() {
	const socket = useSocket();

	const onStartTimer = () => socket?.emit("requestStartTimer", 60);
	const onCancelTimer = () => socket?.emit("requestCancelTimer");
	const onRequestTeamAnswers = () => socket?.emit("hostRequestedTeamAnswers");

	return (
		<Grid container spacing={2}>
			<Grid>
				<Button variant="contained" color="primary" onClick={onStartTimer}>
					Start timer (60 seconds)
				</Button>
			</Grid>
			<Grid>
				<Button variant="contained" color="secondary" onClick={onCancelTimer}>
					Cancel timer
				</Button>
			</Grid>
			<Grid>
				<Button
					variant="contained"
					color="success"
					onClick={onRequestTeamAnswers}
				>
					Request team answers
				</Button>
			</Grid>
		</Grid>
	);
}
