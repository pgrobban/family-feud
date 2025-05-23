import type { FastMoneyGameState, GameState } from "@/shared/types";
import FastMoneyQuestionsPicker from "./FastMoneyQuestionsPicker";
import FastMoneyAnswersPicker from "./FastMoneyQuestionInProgressControls";
import FastMoneyRevealAnswers from "./FastMoneyRevealAnswers";
import QuestionOverControls from "./QuestionOverControls";
import AwardPointsButton from "./AwardPointsButton";
import FastMoneyStealQuestionAndAnswerPicker from "./FastMoneyStealQuestionAndAnswerPicker";

export default function FastMoneyControls({
	gameState,
}: {
	gameState: GameState & FastMoneyGameState;
}) {
	if (gameState?.status !== "in_progress" || gameState?.mode !== "fast_money") {
		return null;
	}

	switch (gameState.modeStatus) {
		case "waiting_for_questions":
			return <FastMoneyQuestionsPicker />;
		case "questions_in_progress":
			return <FastMoneyAnswersPicker gameState={gameState} />;
		case "revealing_answers":
		case "received_steal_question_and_answer":
			return <FastMoneyRevealAnswers gameState={gameState} />;
		case "request_steal_question_and_answer":
			if (!gameState.questions) {
				return null;
			}

			return (
				<FastMoneyStealQuestionAndAnswerPicker
					questions={gameState.questions}
				/>
			);
		case "reveal_steal_question_and_answer":
			return <AwardPointsButton gameState={gameState} />;
		case "awarding_points":
			return <QuestionOverControls />;
	}
}
