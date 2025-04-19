"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import questions from "@/shared/questions.json";
import type { StoredQuestion } from "@/shared/types";
import useSocket from "@/hooks/useSocket";
const storedQuestions: StoredQuestion[] = questions;

export default function QuestionPicker() {
  const socket = useSocket();
  const onQuestionPicked = (questionText: string) =>
    socket?.emit("questionPicked", questionText);

  return (
    <Box p={2}>
      <Typography>Pick a question...</Typography>
      {storedQuestions.map(({ questionText, answers, comment }) => (
        <Grid container key={questionText} spacing={2} mb={2}>
          <Box flex={2}>{questionText}</Box>
          <Box flex={1} fontSize={16} sx={{ fontSize: "small" }}>
            <Typography>{comment}</Typography>
            <Typography>{answers.length} answers</Typography>
          </Box>
          <Box flex={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onQuestionPicked(questionText)}
            >
              Pick
            </Button>
          </Box>
        </Grid>
      ))}
    </Box>
  );
}
