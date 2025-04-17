import useSocket from "@/hooks/useSocket";
import type { EventHandler, ToTeam } from "@/shared/gameEventMap";
import type { FastMoneyAnswer } from "@/shared/types";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSound } from "@/hooks/useSound";

interface Props {
	answer: FastMoneyAnswer;
	answerIndex: number;
	column: ToTeam;
}

export default function FastMoneyAnswerCard({
	answer,
	answerIndex,
	column,
}: Props) {
	const { answerText, points, isTopAnswer } = answer;
	const [flipped, setFlipped] = useState(false);
	const [answerRevealed, setAnswerRevealed] = useState(false);
	const [pointsRevealed, setPointsRevealed] = useState(false);

	const socket = useSocket();
	const sounds = useSound();

	useEffect(() => {
		if (answerRevealed && !flipped) {
			setFlipped(true);
		}
	}, [answerRevealed, flipped]);

	useEffect(() => {
		if (!socket) return;

		const doAnimation: EventHandler<"fastMoney:answerRevealed"> = (
			answerIdx,
			teamIdx,
		) => {
			if (answerIndex !== answerIdx || column !== teamIdx) return;

			setFlipped(true); // flip visually immediately
			sounds.playYouSaid();
			setAnswerRevealed(true);
		};

		const revealPoints: EventHandler<"fastMoney:pointsRevealed"> = (
			answerIdx,
			teamIdx,
		) => {
			if (answerIndex !== answerIdx || column !== teamIdx) return;

			if (points > 0) {
				sounds.playDing();
			} else {
				sounds.playBuzz();
			}
			setPointsRevealed(true);
		};

		socket.on("fastMoney:answerRevealed", doAnimation);
		socket.on("fastMoney:pointsRevealed", revealPoints);
		return () => {
			socket.off("fastMoney:answerRevealed", doAnimation);
			socket.off("fastMoney:pointsRevealed", revealPoints);
		};
	}, [socket, answerIndex, column, points, sounds]);

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
						{answerIndex + 1}
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
						textTransform: "uppercase",
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

					{pointsRevealed && isTopAnswer && (
						<Image
							src="/images/top-answer.png"
							alt="top-answer"
							width={50}
							height={50}
							style={{ position: "relative", right: 0 }}
						/>
					)}

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
						{pointsRevealed ? points : "?"}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
