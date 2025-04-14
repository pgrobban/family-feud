import useSocket from "@/hooks/useSocket";
import type { GameAnswer } from "@/shared/types";
import StoredAnswerSelector from "./StoredAnswerSelector";
import { Box, Typography } from "@mui/material";

export default function StealAnswerSelector({
	gameAnswers,
	teamName,
}: { gameAnswers: GameAnswer[]; teamName: string }) {
	const socket = useSocket();
	const onAnswerPicked = (answerText: string) =>
		socket?.emit("faceOff:receivedStealAnswer", answerText);

	return (
		<Box>
			<Typography>Select {teamName}&apos;s answer to steal</Typography>
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
