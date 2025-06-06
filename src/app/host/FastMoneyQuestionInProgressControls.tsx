import useSocket from "@/hooks/useSocket";
import type { FastMoneyGameState, GameState } from "@/shared/types";
import { FAST_MONEY_TIMER_SECONDS } from "@/shared/utils";
import { Button, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function FastMoneyQuestionInProgressControls({
  gameState,
}: {
  gameState: GameState & FastMoneyGameState;
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
  const onSubmitAnswers = () =>
    socket?.emit("fastMoney:receivedResponses", answersPicked);

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
      </Grid>
      <Grid flexGrow={2}>
        <TextField
          label="Write quick notes for answers here, click below when round is finished"
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
                    {answer.answerText}
                    <br />
                    {answer.points} pts
                  </Button>
                </Grid>
              ))}
              <Grid>
                <TextField
                  label="Other answer"
                  value={answersPicked[questionIndex]}
                  onChange={(e) =>
                    onAnswerPicked(questionIndex, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color={
                    answersPicked[questionIndex] === "Invalid answer"
                      ? "error"
                      : "secondary"
                  }
                  onClick={() => onAnswerPicked(questionIndex, "-")}
                >
                  Invalid answer
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ))}
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
  );
}
