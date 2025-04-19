import useSocket from "@/hooks/useSocket";
import type { FaceOffGameState } from "@/shared/types";
import { Button } from "@mui/material";
import AwardPointsButton from "./AwardPointsButton";

export default function AfterStealAnswerReveal({
  gameState,
}: {
  gameState: FaceOffGameState;
}) {
  const question = gameState.question;
  const socket = useSocket();

  if (!question) {
    return;
  }

  const answers = question.answers;

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
  return <AwardPointsButton gameState={gameState} />;
}
