import useSocket from "@/hooks/useSocket";
import { FAMILY_WARMUP_TIMER_SECONDS } from "@/shared/utils";
import { Button, Grid } from "@mui/material";

export default function FamilyWarmupQuestionInProgressControls() {
	const socket = useSocket();

	const onStartTimer = () =>
		socket?.emit("requestStartTimer", FAMILY_WARMUP_TIMER_SECONDS);
	const onCancelTimer = () => socket?.emit("requestCancelTimer");
	const onRequestTeamAnswers = () =>
		socket?.emit("familyWarmup:hostRequestedTeamAnswers");

	return (
		<Grid container spacing={2}>
			<Grid>
				<Button variant="contained" color="primary" onClick={onStartTimer}>
					Start timer ({FAMILY_WARMUP_TIMER_SECONDS} seconds)
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
