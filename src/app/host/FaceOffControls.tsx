"use client";
import type { GameState } from "@/shared/types";
import QuestionPicker from "./QuestionPicker";
import BuzzedInTeamAndAnswerPicker from "./BuzzedInTeamAndAnswerPicker";

export default function FaceOffControls({
	gameState,
}: {
	gameState: GameState;
}) {
	if (gameState?.status !== "in_progress" || gameState?.mode !== "face_off") {
		return null;
	}

	if (gameState.modeStatus === "waiting_for_question") {
		<QuestionPicker />;
	}

	if (!gameState.question) {
		return null;
	}

	switch (gameState.modeStatus) {
		case "waiting_for_question":
			return <QuestionPicker />;
		case "face_off_started":
			return (
				<BuzzedInTeamAndAnswerPicker
					question={gameState.question}
					teamNames={gameState.teamNames}
				/>
			);

		default:
			return null;
	}
}
