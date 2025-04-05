"use client";
import useSocket from "@/hooks/useSocket";
import Game from "../../../server/controllers/Game";
import QuestionPicker from "./QuestionPicker";

export default function FamilyWarmupControls({ game }: { game: Game }) {
  const socket = useSocket();
  const setQuestion = (question: string) =>
    socket?.emit("questionPicked", question);

  if (game?.status !== "in_progress" || game?.mode !== "family_warm_up") {
    return null;
  }

  if (game.modeStatus === "waiting_for_question") {
    return <QuestionPicker onQuestionPicked={setQuestion} />;
  }

  return null;
}
