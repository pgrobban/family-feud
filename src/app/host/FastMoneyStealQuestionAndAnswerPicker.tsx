import useSocket from "@/hooks/useSocket";
import type { GameQuestion } from "@/shared/types";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import StoredAnswerSelector from "./StoredAnswerSelector";

export default function FastMoneyStealQuestionAndAnswerPicker({
	questions,
}: { questions: GameQuestion[] }) {
	const socket = useSocket();
	const [questionPicked, setQuestionPicked] = useState<GameQuestion | null>(
		null,
	);
	const [answerPicked, setAnswerPicked] = useState<string | null>(null);

	const requestRevealStealQuestionAnswer = () => {
		if (!questionPicked || !answerPicked) return;
		socket?.emit(
			"fastMoney:receivedStealQuestionAndAnswer",
			questionPicked.questionText,
			answerPicked,
		);
	};

	const pickedQuestionIndex = questions.findIndex(
		(question) => questionPicked?.questionText === question.questionText,
	);

	return (
		<Box>
			<Typography>Select question and answer to steal</Typography>
			<Box display="flex" flexDirection="column" gap={2} mb={5}>
				{questions.map((question, index) => (
					<Box key={index} display="flex" gap={2} flexGrow={1}>
						<Box flex={1}>
							<Button
								fullWidth
								variant="contained"
								onClick={() => setQuestionPicked(question)}
								color={
									questionPicked?.questionText === question.questionText
										? "success"
										: "primary"
								}
							>
								{question.questionText}
							</Button>
						</Box>
						<Box flex={1} flexGrow={4}>
							{questionPicked && index === pickedQuestionIndex && (
								<StoredAnswerSelector
									storedAnswers={questionPicked.answers}
									onAnswerPicked={(answerText) => setAnswerPicked(answerText)}
									buttonColor={(answerText: string) =>
										answerPicked === answerText ? "success" : "primary"
									}
								/>
							)}
						</Box>
					</Box>
				))}
			</Box>

			<Button variant="contained" onClick={requestRevealStealQuestionAnswer}>
				Submit
			</Button>
		</Box>
	);
}
