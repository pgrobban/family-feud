import useSocket from "@/hooks/useSocket";
import type { GameInProgress } from "@/shared/types";
import { Button } from "@mui/material";

export default function AwardPointsButton({
	currentMode,
}: { currentMode: Exclude<GameInProgress["mode"], "indeterminate"> }) {
	const socket = useSocket();
	const requestAwardPoints = () =>
		socket?.emit(
			currentMode === "family_warm_up"
				? "familyWarmup:requestAwardTeamPoints"
				: currentMode === "face_off"
					? "faceOff:requestAwardPoints"
					: "fastMoney:requestAwardPoints",
		);

	return (
		<Button variant="contained" color="primary" onClick={requestAwardPoints}>
			Award points
		</Button>
	);
}
