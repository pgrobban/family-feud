"use client";

import type {
	FaceOffGame,
	FaceOffGameAnswer,
	GameQuestion,
	GameState,
} from "@/shared/types";
import { Box, Typography } from "@mui/material";
import AnswerCard from "./AnswerCard";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import LogoAndRoundBox from "./LogoAndRoundBox";

function RedXOverlay({ count }: { count: number }) {
	return (
		<Box
			sx={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				display: count > 0 ? "flex" : "none",
				justifyContent: "center",
				alignItems: "center",
				gap: "2vw",
				backgroundColor: "rgba(0, 0, 0, 0.6)",
				zIndex: 10,
				animation: count > 0 ? "fadeInOut 1.8s ease-in-out" : "none",
				pointerEvents: "none",
			}}
		>
			{Array.from({ length: count }).map((_, i) => (
				<Typography
					key={i}
					sx={{
						fontSize: "20vw",
						fontWeight: "bold",
						color: "red",
						textShadow: "2px 2px 8px black",
					}}
				>
					X
				</Typography>
			))}

			<style>
				{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        `}
			</style>
		</Box>
	);
}

export default function FaceOffGameBoard({
	gameState,
}: {
	gameState: GameState & FaceOffGame;
}) {
	if (gameState.status !== "in_progress" || gameState.mode !== "face_off") {
		return null;
	}

	const [animateStrikes, setAnimateStrikes] = useState(0);
	const socket = useSocket();

	useEffect(() => {
		if (!socket) return;

		const onAnswerIncorrect = ({ strikes }: { strikes: number }) => {
			setAnimateStrikes(strikes);
			setTimeout(() => {
				setAnimateStrikes(0);
			}, 1800); // matches the animation duration
		};

		socket.on("answerIncorrect", onAnswerIncorrect);
		return () => {
			socket.off("answerIncorrect", onAnswerIncorrect);
		};
	}, [socket]);

	if (gameState.modeStatus === "waiting_for_question") {
		return (
			<LogoAndRoundBox
				round={"Family face-off round"}
				text={"Please select one person of each team to stand by the buzzers"}
			/>
		);
	}

	const question = gameState.question as GameQuestion<FaceOffGameAnswer>;

	if (!question) {
		return null;
	}

	const pointsToBeAwarded = question.answers
		.filter((a) => a.revealed && a.revealedByControlTeam)
		.reduce((sum, a) => sum + a.points, 0);

	return (
		<Box sx={{ position: "relative", width: "100%", height: "100%" }}>
			<RedXOverlay count={animateStrikes} />

			<Box p={2}>
				<Box
					sx={{
						background: "linear-gradient(to bottom, #3964c9, #1b2d6d)",
						color: "#fff",
						fontWeight: "bold",
						fontSize: 48,
						textAlign: "center",
						mx: "auto",
						border: "4px solid #fff",
						borderRadius: 2,
						mb: 3,
						p: 2,
						textTransform: "uppercase",
						width: 200,
					}}
				>
					<Typography variant="h3">{pointsToBeAwarded}</Typography>
				</Box>

				<Box>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							gap: 1,
							textTransform: "uppercase",
						}}
					>
						{question.answers.map((answer, index) => (
							<AnswerCard
								key={answer.answerText}
								answer={answer}
								index={index}
							/>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
