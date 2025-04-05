"use client";
import useSocket from "@/hooks/useSocket";
import QuestionPicker from "./QuestionPicker";
import { GameState } from "@/shared/types";

export default function FamilyWarmupControls({
  gameState,
}: {
  gameState: GameState;
}) {
  const socket = useSocket();
  const setQuestion = (question: string) =>
    socket?.emit("questionPicked", question);

  if (
    gameState?.status !== "in_progress" ||
    gameState?.mode !== "family_warm_up"
  ) {
    return null;
  }

  if (gameState.modeStatus === "waiting_for_question") {
    return <QuestionPicker onQuestionPicked={setQuestion} />;
  }

  return null;
}
