import useSocket from "@/hooks/useSocket";
import { FastMoneyGame, GameState } from "@/shared/types";
import FastMoneyQuestionsPicker from "./FastMoneyQuestionsPicker";

export default function FastMoneyControls({
  gameState,
}: {
  gameState: GameState & FastMoneyGame;
}) {
  const socket = useSocket();

  if (gameState?.status !== "in_progress" || gameState?.mode !== "fast_money") {
    return null;
  }

  switch (gameState.modeStatus) {
    case "waiting_for_questions":
      return <FastMoneyQuestionsPicker />;
    default:
      return null;
  }
}
