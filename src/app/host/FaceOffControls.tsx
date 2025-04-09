"use client";
import type { FaceOffGame, GameState } from "@/shared/types";
import QuestionPicker from "./QuestionPicker";
import BuzzedInTeamAndAnswerPicker from "./BuzzedInTeamAndAnswerPicker";
import AfterBuzzedInAnswer from "./AfterBuzzedInAnswer";
import AskTeamToPlay from "./AskTeamToPlay";
import InControlTeamAnswerSelector from "./InControlTeamAnswerSelector";
import { Box, Typography } from "@mui/material";
import { useCallback } from "react";

export default function FaceOffControls({
  gameState,
}: {
  gameState: GameState & FaceOffGame;
}) {
  const getControls = useCallback(() => {
    if (!gameState.question) {
      return null;
    }

    switch (gameState.modeStatus) {
      case "face_off_started":
      case "getting_other_buzzed_in_answer":
        return (
          <BuzzedInTeamAndAnswerPicker
            question={gameState.question}
            teamNames={gameState.teamNames}
            modeStatus={gameState.modeStatus}
          />
        );
      case "reveal_buzzed_in_answer":
      case "reveal_other_buzzed_in_answer":
        return <AfterBuzzedInAnswer gameState={gameState} />;
      case "team_asked_to_play":
        if (!gameState.currentTeam) {
          return null;
        }

        return (
          <AskTeamToPlay
            teamNames={gameState.teamNames}
            currentTeam={gameState.currentTeam}
          />
        );
      case "in_control_team_guesses":
        return (
          <InControlTeamAnswerSelector
            storedAnswers={gameState.question.answers}
          />
        );
      default:
        return null;
    }
  }, [gameState]);

  if (gameState?.status !== "in_progress" || gameState?.mode !== "face_off") {
    return null;
  }

  if (gameState.modeStatus === "waiting_for_question") {
    return <QuestionPicker />;
  }

  return (
    <Box>
      <Box border={"1px solid #ccc"} p={1} mb={5}>
        <Typography>{gameState.question?.questionText}</Typography>
      </Box>
      {getControls()}
    </Box>
  );
}
