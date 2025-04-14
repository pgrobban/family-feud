import useSocket from "@/hooks/useSocket";
import { Button } from "@mui/material";

export default function AwardPointsButton({
	currentMode,
}: { currentMode: "face_off" | "family_warm_up" }) {
	const socket = useSocket();
	const requestAwardPoints = () =>
		socket?.emit(
			currentMode === "face_off"
				? "faceOff:awardTeamPoints"
				: "familyWarmup:awardTeamPoints",
		);

	return (
		<Button variant="contained" color="primary" onClick={requestAwardPoints}>
			Award points
		</Button>
	);
}
