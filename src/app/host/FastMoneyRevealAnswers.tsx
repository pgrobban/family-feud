import useSocket from "@/hooks/useSocket";
import type { GameState, FastMoneyGameState } from "@/shared/types";
import { Box, Button, Typography } from "@mui/material";
import AwardPointsButton from "./AwardPointsButton";

export default function FastMoneyRevealAnswers({
	gameState,
}: { gameState: GameState & FastMoneyGameState }) {
	const socket = useSocket();

	if (!gameState.responsesFirstTeam) {
		return;
	}

	let pointsToBeAwarded = (gameState.responsesFirstTeam || []).reduce(
		(sum, a) => sum + a.points,
		0,
	);
	if (gameState.modeStatus === "reveal_steal_question_and_answer") {
		pointsToBeAwarded += (gameState.responsesSecondTeam || []).reduce(
			(sum, a) => sum + a.points,
			0,
		);
	}

	const requestRevealAnswer = (answerIndex: number) =>
		socket?.emit("fastMoney:requestRevealAnswer", answerIndex, "playing_team");
	const requestRevealPoints = (answerIndex: number) =>
		socket?.emit("fastMoney:requestRevealPoints", answerIndex, "playing_team");
	const requestStealQuestionAndAnswer = () =>
		socket?.emit("fastMoney:requestStealQuestionAndAnswer");
	const requestRevealStealQuestionAndAnswer = () =>
		socket?.emit("fastMoney:requestRevealStealQuestionAndAnswer");

	return (
		<Box>
			<Typography>Sum of points: {pointsToBeAwarded}</Typography>
			<Box mb={5}>
				<Box display="flex" flexDirection="column" gap={2} width={"50%"}>
					{gameState.responsesFirstTeam.map((answer, index) => (
						<Box key={index} display="flex" gap={2}>
							<Box flex={1}>
								<Button
									fullWidth
									variant="contained"
									onClick={() => requestRevealAnswer(index)}
									disabled={answer.answerRevealed}
								>
									Reveal answer ({answer.answerText})
								</Button>
							</Box>
							<Box flex={1}>
								<Button
									fullWidth
									variant="contained"
									onClick={() => requestRevealPoints(index)}
									disabled={answer.pointsRevealed}
								>
									Reveal points ({answer.points})
								</Button>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			{gameState.modeStatus === "revealing_answers" && (
				<Box display="flex" gap={2}>
					<Button variant="contained" onClick={requestStealQuestionAndAnswer}>
						Request other team to steal question and answer
					</Button>
					<AwardPointsButton currentMode={gameState.mode} />
				</Box>
			)}
			{gameState.modeStatus === "received_steal_question_and_answer" && (
				<Box>
					<Button
						variant="contained"
						onClick={requestRevealStealQuestionAndAnswer}
					>
						Reveal steal question and answer
					</Button>
				</Box>
			)}
		</Box>
	);
}
