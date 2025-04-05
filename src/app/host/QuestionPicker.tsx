"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import questions from "@/shared/questions.json" assert { type: "json" };
import { StoredQuestion } from "@/shared/types";
const storedQuestions: StoredQuestion[] = questions;

export default function GameModePicker({
  onQuestionPicked,
}: {
  onQuestionPicked: (questionText: string) => void;
}) {
  return (
    <Box p={2}>
      <Typography>Pick a question...</Typography>
      {storedQuestions.map(({ questionText, answers }) => (
        <Grid container key={questionText} spacing={2}>
          <Grid>{questionText}</Grid>
          <Grid>{answers.length} answers</Grid>
          <Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onQuestionPicked(questionText)}
            >
              Pick
            </Button>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
}
