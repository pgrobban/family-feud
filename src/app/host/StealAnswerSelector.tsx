import useSocket from "@/hooks/useSocket";
import type { GameAnswer } from "@/shared/types";
import StoredAnswerSelector from "./StoredAnswerSelector";
import { Box, Typography } from "@mui/material";

interface Props {
	mode: "face_off" | "fast_money";
	gameAnswers: GameAnswer[];
	teamName: string;
}

export default function StealAnswerSelector({ gameAnswers, teamName }: Props) {
	const socket = useSocket();
	const onAnswerPicked = (answerText: string) =>
		socket?.emit("faceOff:receivedStealAnswer", answerText);

	return (
		<Box>
			<Typography>
				Select <span style={{ textDecoration: "underline" }}>{teamName}</span>
				&apos;s answer to steal
			</Typography>
			<StoredAnswerSelector
				storedAnswers={gameAnswers}
				disabled={(answerText) =>
					Boolean(
						gameAnswers.find(
							(gameAnswer) => gameAnswer.answerText === answerText,
						)?.answerRevealed,
					)
				}
				onAnswerPicked={onAnswerPicked}
				includeInvalidOption
			/>
		</Box>
	);
}
