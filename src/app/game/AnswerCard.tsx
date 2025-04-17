import useSocket from "@/hooks/useSocket";
import type { GameAnswer } from "@/shared/types";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
	answer: GameAnswer;
	index: number;
}

const dingSound = new Audio("sounds/ding.mp3");

export default function AnswerCard({ answer, index }: Props) {
	const { answerText, points, answerRevealed } = answer;
	const [flipped, setFlipped] = useState(answerRevealed);

	const socket = useSocket();

	useEffect(() => {
		if (answerRevealed && !flipped) {
			setFlipped(true);
		}
	}, [answerRevealed, flipped]);

	useEffect(() => {
		if (!socket) return;

		const doAnimation = ({ index: animateIndex }: { index: number }) => {
			if (animateIndex !== index) return;

			setFlipped(true); // flip visually immediately
			dingSound.play();
		};

		socket.on("answerRevealed", doAnimation);
		return () => {
			socket.off("answerRevealed", doAnimation);
		};
	}, [socket, index]);

	return (
		<Box
			className={`flip-card ${flipped ? "flipped" : ""}`}
			sx={{ perspective: 1000, width: "100%", height: 81, fontSize: 50 }}
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
						borderRadius: 2,
						color: "#fff",
						fontWeight: "bold",
						border: "3px solid #fff",
					}}
				>
					<Box
						sx={{
							width: 80,
							height: 75,
							background: "#021c44",
							borderRadius: "100% 100%",
							textAlign: "center",
						}}
					>
						{index + 1}
					</Box>
				</Box>

				{/* Back (revealed answer) */}
				<Box
					className="flip-card-back"
					sx={{
						position: "absolute",
						width: "100%",
						height: "100%",
						backfaceVisibility: "hidden",
						background: "linear-gradient(to left, #2249a3, #3e83f8, #2249a3)",
						transform: "rotateX(180deg)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pl: 3,
						border: "3px solid #fff",
						borderRadius: 2,
						color: "#fff",
						boxShadow: "inset 0 0 6px #000",
					}}
				>
					<Typography
						sx={{
							fontSize: `clamp(16px, ${50 - answerText.length}px, 50px)`,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
							flexGrow: 1,
						}}
					>
						{answerText}
					</Typography>
					<Box
						sx={{
							width: 100,
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(to bottom, #3e83f8, #2249a3)",
							borderLeft: "2px solid #fff",
						}}
					>
						{points}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
