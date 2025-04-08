import useSocket from "@/hooks/useSocket";
import type { GameAnswer } from "@/shared/types";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
interface Props {
	answer: GameAnswer;
	index: number;
}

export default function AnswerCard({ answer, index }: Props) {
	const { answerText, points, revealed } = answer;
	const [flipped, setFlipped] = useState(revealed);

	const socket = useSocket();

	useEffect(() => {
		if (revealed && !flipped) {
			setFlipped(true);
		}
	}, [revealed, flipped]);

	useEffect(() => {
		if (!socket) return;

		const doAnimation = ({ index: animateIndex }: { index: number }) => {
			if (animateIndex !== index) return;

			setFlipped(true); // flip visually immediately
		};

		socket.on("answerRevealed", doAnimation);
		return () => {
			socket.off("answerRevealed", doAnimation);
		};
	}, [socket, index]);

	return (
		<Box
			className={`flip-card ${flipped ? "flipped" : ""}`}
			sx={{ perspective: 1000, width: "100%", height: 80 }}
		>
			<Box
				className="flip-card-inner"
				sx={{
					width: "100%",
					height: "100%",
					position: "relative",
					transformStyle: "preserve-3d",
					transition: "transform 0.8s",
				}}
			>
				{/* Front (number) */}
				<Box
					className="flip-card-front"
					sx={{
						position: "absolute",
						width: "100%",
						height: "100%",
						backfaceVisibility: "hidden",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
						borderRadius: 1,
						color: "#fff",
						fontWeight: "bold",
						fontSize: 28,
						border: "3px solid #fff",
					}}
				>
					{index + 1}
				</Box>

				{/* Back (revealed answer) */}
				<Box
					className="flip-card-back"
					sx={{
						position: "absolute",
						width: "100%",
						height: "100%",
						backfaceVisibility: "hidden",
						background: "linear-gradient(to bottom, #3e83f8, #2249a3)",
						transform: "rotateX(180deg)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						px: 3,
						border: "4px solid black",
						borderRadius: 1,
						color: "#fff",
						fontSize: 28,
						boxShadow: "inset 0 0 6px #000",
					}}
				>
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
				</Box>
			</Box>
		</Box>
	);
}
