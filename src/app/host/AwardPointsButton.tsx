import useSocket from "@/hooks/useSocket";
import { Button } from "@mui/material";

export default function AwardPointsButton() {
	const socket = useSocket();
	const requestAwardPoints = () => socket?.emit("awardTeamPoints");

	return (
		<Button variant="contained" color="primary" onClick={requestAwardPoints}>
			Award points
		</Button>
	);
}
