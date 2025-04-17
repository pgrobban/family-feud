"use client";
import type { FaceOffGameState, GameState } from "@/shared/types";
import QuestionPicker from "./QuestionPicker";
import BuzzedInTeamAndAnswerPicker from "./BuzzedInTeamAndAnswerPicker";
import AfterBuzzedInAnswer from "./AfterBuzzedInAnswer";
import AskTeamToPlay from "./AskTeamToPlay";
import InControlTeamAnswerSelector from "./InControlTeamAnswerSelector";
import { Box, Typography } from "@mui/material";
import { useCallback } from "react";
import AwardPointsButton from "./AwardPointsButton";
import QuestionOverControls from "./QuestionOverControls";
import StealAnswerSelector from "./StealAnswerSelector";
import { getOpposingTeam } from "@/shared/utils";
import AfterStealAnswerReveal from "./AfterStealAnswerReveal";

export default function FaceOffControls({
	gameState,
}: {
	gameState: GameState & FaceOffGameState;
}) {
	const getControls = useCallback(() => {
		if (gameState.modeStatus === "waiting_for_question") {
			return <QuestionPicker />;
		}

		if (!gameState.question) {
			return null;
		}

		switch (gameState.modeStatus) {
			case "face_off_started":
			case "getting_other_buzzed_in_answer":
				return <BuzzedInTeamAndAnswerPicker gameState={gameState} />;
			case "reveal_buzzed_in_answer":
			case "reveal_other_buzzed_in_answer":
				return <AfterBuzzedInAnswer modeStatus={gameState.modeStatus} />;
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
				if (!gameState.inControlTeam) {
					return null;
				}

				return (
					<InControlTeamAnswerSelector
						gameAnswers={gameState.question.answers}
						teamName={gameState.teamNames[gameState.inControlTeam - 1]}
					/>
				);
			case "revealing_stored_answers":
				return <AwardPointsButton gameState={gameState} />;
			case "awarding_points":
				return <QuestionOverControls />;
			case "ask_other_team_for_guess_for_steal": {
				if (!gameState.inControlTeam) {
					return null;
				}

				const opposingTeamIndex = getOpposingTeam(gameState.inControlTeam) - 1;
				const opposingTeamName = gameState.teamNames[opposingTeamIndex];

				return (
					<StealAnswerSelector
						mode={gameState.mode}
						gameAnswers={gameState.question.answers}
						teamName={opposingTeamName}
					/>
				);
			}
			case "revealing_steal_answer":
				return <AfterStealAnswerReveal gameState={gameState} />;
		}
	}, [gameState]);

	if (gameState?.status !== "in_progress" || gameState?.mode !== "face_off") {
		return null;
	}

	return (
		<Box>
			{gameState.question && (
				<Box border={"1px solid #ccc"} p={1} mb={5}>
					<Typography>{gameState.question?.questionText}</Typography>
				</Box>
			)}
			{getControls()}
		</Box>
	);
}
