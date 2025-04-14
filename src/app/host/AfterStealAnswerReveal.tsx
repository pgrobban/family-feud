import useSocket from "@/hooks/useSocket";
import type { GameAnswer } from "@/shared/types";
import { Button } from "@mui/material";
import AwardPointsButton from "./AwardPointsButton";

export default function AfterStealAnswerReveal({
	answers,
}: { answers: GameAnswer[] }) {
	const socket = useSocket();

	const onRevealRemainingAnswers = () =>
		socket?.emit("faceOff:requestRevealStoredAnswers");

	const allAnswersRevealed = answers.every((answer) => answer.answerRevealed);
	if (!allAnswersRevealed) {
		return (
			<Button variant="contained" onClick={onRevealRemainingAnswers}>
				Reveal remaining answers
			</Button>
		);
	}
	return <AwardPointsButton currentMode="face_off" />;
}
