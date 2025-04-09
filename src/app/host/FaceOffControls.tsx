"use client";
import type { GameState } from "@/shared/types";
import QuestionPicker from "./QuestionPicker";
import BuzzedInTeamAndAnswerPicker from "./BuzzedInTeamAndAnswerPicker";
import AfterBuzzedInAnswer from "./AfterBuzzedInAnswer";

export default function FaceOffControls({
	gameState,
}: {
	gameState: GameState;
}) {
	if (gameState?.status !== "in_progress" || gameState?.mode !== "face_off") {
		return null;
	}

	if (gameState.modeStatus === "waiting_for_question") {
		return <QuestionPicker />;
	}

	if (!gameState.question) {
		return null;
	}

	console.log("***", gameState);

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
			return <AfterBuzzedInAnswer gameState={gameState} />;
		default:
			return null;
	}
}
