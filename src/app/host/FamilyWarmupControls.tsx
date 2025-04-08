"use client";
import useSocket from "@/hooks/useSocket";
import QuestionPicker from "./QuestionPicker";
import type { GameState } from "@/shared/types";
import { Button } from "@mui/material";
import TeamAnswerSelector from "./TeamAnswerSelector";

export default function FamilyWarmupControls({
	gameState,
}: {
	gameState: GameState;
}) {
	const socket = useSocket();

	if (
		gameState?.status !== "in_progress" ||
		gameState?.mode !== "family_warm_up"
	) {
		return null;
	}

	const requestTeamAnswers = () => socket?.emit("hostRequestedTeamAnswers");
	const requestRevealTeamAnswers = () =>
		socket?.emit("requestRevealTeamAnswers");
	const requestAwardPoints = () => socket?.emit("awardTeamPoints");
	const requestNewQuestion = () => socket?.emit("requestNewQuestion");

	switch (gameState.modeStatus) {
		case "waiting_for_question":
			return <QuestionPicker />;
		case "question_in_progress":
			return (
				<>
					Start timer for one minute...
					<Button
						variant="contained"
						color="primary"
						onClick={requestTeamAnswers}
					>
						Request team answers
					</Button>
				</>
			);
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
			return (
				<Button
					variant="contained"
					color="primary"
					onClick={requestAwardPoints}
				>
					Award points
				</Button>
			);
		case "awarding_points":
			return (
				<Button
					variant="contained"
					color="primary"
					onClick={requestNewQuestion}
				>
					New question
				</Button>
			);
	}
}
