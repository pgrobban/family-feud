import type { TeamAndPoints } from "@/shared/types";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function WinScreen({
	teamsAndPoints,
}: { teamsAndPoints: TeamAndPoints[] }) {
	const winningTeamName =
		teamsAndPoints.find(
			(team) =>
				team.points === Math.max(...teamsAndPoints.map((t) => t.points)),
		)?.teamName || "";
	return (
		<Box
			height={"100%"}
			textTransform={"uppercase"}
			display={"flex"}
			flexDirection={"column"}
			alignItems={"center"}
			textAlign={"center"}
			sx={{
				background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
			}}
		>
			<Typography variant="h3">Congratulations, {winningTeamName}</Typography>
			<Box mt={5}>
				<Image src="/images/winner.jpg" alt="Logo" width={475} height={475} />
			</Box>
		</Box>
	);
}
