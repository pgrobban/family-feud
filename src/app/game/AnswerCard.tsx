import type { GameAnswer } from "@/shared/types";
import { Box, Typography } from "@mui/material";

interface Props {
	answer: GameAnswer;
	index: number;
}

export default function AnswerCard({ answer, index }: Props) {
	const { answerText, points, revealed } = answer;
	return (
		<Box
			sx={{
				width: "100%", // must be here
				maxWidth: "100%", // avoid capping width unintentionally
				background: answer.revealed
					? "linear-gradient(to bottom, #3e83f8, #2249a3)"
					: "linear-gradient(to bottom, #3e83f8, #2249a3)",
				border: "4px solid black",
				borderRadius: 1,
				boxShadow: "inset 0 0 6px #000",
				color: "#fff",
				height: 80,
				fontSize: 28,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				px: 3,
			}}
		>
			{revealed ? (
				<>
					<Typography sx={{ fontSize: 28 }}>{answerText}</Typography>
					<Box
						sx={{
							backgroundColor: "#1b3c93",
							width: 65,
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "3px solid #fff",
							fontWeight: "bold",
							fontSize: 28,
						}}
					>
						{points}
					</Box>
				</>
			) : (
				<Box
					sx={{
						background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
						borderRadius: "999px",
						width: 60,
						height: 60,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#fff",
						fontWeight: "bold",
						fontSize: 28,
						border: "3px solid #fff",
						margin: "0 auto",
					}}
				>
					{index + 1}
				</Box>
			)}
		</Box>
	);
}
