"use client";
import useSocket from "@/hooks/useSocket";
import QuestionPicker from "./QuestionPicker";
import type { FamilyWarmUpGame, GameState } from "@/shared/types";
import { Button } from "@mui/material";
import TeamAnswerSelector from "./TeamAnswerSelector";
import QuestionOverControls from "./QuestionOverControls";
import AwardPointsButton from "./AwardPointsButton";
import FamilyWarmupQuestionInProgressControls from "./FamilyWarmupQuestionInProgressControls";

export default function FamilyWarmupControls({
  gameState,
}: {
  gameState: GameState & FamilyWarmUpGame;
}) {
  const socket = useSocket();

  if (
    gameState?.status !== "in_progress" ||
    gameState?.mode !== "family_warm_up"
  ) {
    return null;
  }

  const requestRevealTeamAnswers = () =>
    socket?.emit("familyWarmup:requestRevealTeamAnswers");

  switch (gameState.modeStatus) {
    case "waiting_for_question":
      return <QuestionPicker />;
    case "question_in_progress":
      return <FamilyWarmupQuestionInProgressControls />;
    case "gathering_team_answers":
      return (
        <TeamAnswerSelector storedAnswers={gameState.question?.answers || []} />
      );
    case "revealing_stored_answers":
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={requestRevealTeamAnswers}
        >
          Reveal team answers
        </Button>
      );
    case "revealing_team_answers":
      return <AwardPointsButton currentMode={gameState.mode} />;
    case "awarding_points":
      return <QuestionOverControls />;
  }
}
