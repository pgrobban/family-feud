"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import questions from "@/shared/questions.json" assert { type: "json" };
import type { StoredQuestion } from "@/shared/types";
import useSocket from "@/hooks/useSocket";
const storedQuestions: StoredQuestion[] = questions;

export default function GameModePicker() {
	const socket = useSocket();
	const onQuestionPicked = (questionText: string) =>
		socket?.emit("questionPicked", questionText);

	return (
		<Box p={2}>
			<Typography>Pick a question...</Typography>
			{storedQuestions.map(({ questionText, answers }) => (
				<Grid container key={questionText} spacing={2} sx={{ display: "flex" }}>
					<div style={{ flex: 1 }}>{questionText}</div>
					<div style={{ flex: 1 }}>{answers.length} answers</div>
					<div style={{ flex: 1 }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => onQuestionPicked(questionText)}
						>
							Pick
						</Button>
					</div>
				</Grid>
			))}
		</Box>
	);
}
