import type { FastMoneyGame, GameState } from "@/shared/types";
import FastMoneyQuestionsPicker from "./FastMoneyQuestionsPicker";
import FastMoneyAnswersPicker from "./FastMoneyQuestionInProgressControls";
import FastMoneyRevealAnswers from "./FastMoneyRevealAnswers";

export default function FastMoneyControls({
	gameState,
}: {
	gameState: GameState & FastMoneyGame;
}) {
	if (gameState?.status !== "in_progress" || gameState?.mode !== "fast_money") {
		return null;
	}

	console.log("***", gameState);

	switch (gameState.modeStatus) {
		case "waiting_for_questions":
			return <FastMoneyQuestionsPicker />;
		case "questions_in_progress":
			return <FastMoneyAnswersPicker gameState={gameState} />;
		case "revealing_answers":
			return <FastMoneyRevealAnswers gameState={gameState} />;
		default:
			return null;
	}
}
