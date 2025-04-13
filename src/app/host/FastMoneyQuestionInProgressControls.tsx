import useSocket from "@/hooks/useSocket";
import type { FastMoneyGame, GameState } from "@/shared/types";
import { FAST_MONEY_TIMER_SECONDS } from "@/shared/utils";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function FastMoneyQuestionInProgressControls({
  gameState,
}: {
  gameState: GameState & FastMoneyGame;
}) {
  const socket = useSocket();

  const [answersPicked, setAnswersPicked] = useState<string[]>(
    gameState.questions?.map(() => "") ?? []
  );
  const [notes, setNotes] = useState("");

  if (!gameState.questions) {
    return null;
  }

  const onAnswerPicked = (questionIndex: number, answerText: string) =>
    setAnswersPicked(
      answersPicked.map((answer, i) =>
        i === questionIndex ? answerText : answer
      )
    );

  const onStartTimer = () =>
    socket?.emit("requestStartTimer", FAST_MONEY_TIMER_SECONDS);
  const onCancelTimer = () => socket?.emit("requestCancelTimer");
  const onSubmitAnswers = () => socket?.emit("receivedAnswers", answersPicked);

  const submitDisabled = answersPicked.some((answer) => answer === "");

  return (
    <Grid container spacing={2}>
      <Grid container spacing={2}>
        <Grid>
          <Button variant="contained" color="primary" onClick={onStartTimer}>
            Start timer ({FAST_MONEY_TIMER_SECONDS} seconds)
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" color="secondary" onClick={onCancelTimer}>
            Cancel timer
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="success"
            onClick={onSubmitAnswers}
            disabled={submitDisabled}
          >
            Submit answers
          </Button>
        </Grid>
      </Grid>
      <Grid flexGrow={2}>
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid container>
        {gameState.questions.map((question, questionIndex) => (
          <Grid container key={question.questionText} columnSpacing={2} mb={2}>
            <Typography>{question.questionText}</Typography>
            <Grid container>
              {question.answers.map((answer) => (
                <Grid key={answer.answerText}>
                  <Button
                    variant="contained"
                    color={
                      answersPicked[questionIndex] === answer.answerText
                        ? "success"
                        : "primary"
                    }
                    onClick={() =>
                      onAnswerPicked(questionIndex, answer.answerText)
                    }
                  >
                    {answer.answerText} - {answer.points} pts
                  </Button>
                </Grid>
              ))}
              <Grid>
                <Button
                  variant="contained"
                  color={
                    answersPicked[questionIndex] === "Invalid answer"
                      ? "error"
                      : "secondary"
                  }
                  onClick={() =>
                    onAnswerPicked(questionIndex, "Invalid answer")
                  }
                >
                  Invalid answer
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
