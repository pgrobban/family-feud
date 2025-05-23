"use client";
import useSocket from "@/hooks/useSocket";
import type { FaceOffGameState } from "@/shared/types";
import { Button, Grid, Typography } from "@mui/material";
import { useState } from "react";
import StoredAnswerSelector from "./StoredAnswerSelector";

export default function BuzzedInTeamAndAnswerPicker({
  gameState,
}: {
  gameState: FaceOffGameState;
}) {
  const { modeStatus, currentTeam, teamNames, question } = gameState;
  const socket = useSocket();

  const [buzzedInTeam, setBuzzedInTeam] = useState<1 | 2 | null>(null);
  const [answer, setAnswer] = useState<string | null>();
  const submitDisabled =
    modeStatus === "face_off_started" ? !buzzedInTeam || !answer : !answer;

  const onSubmit = () => {
    if (!answer) return;

    if (modeStatus === "face_off_started") {
      socket?.emit("faceOff:submitBuzzInAnswer", buzzedInTeam as 1 | 2, answer);
    } else {
      socket?.emit("faceOff:submitBuzzInAnswer", currentTeam as 1 | 2, answer);
    }
  };

  if (!question) return;

  return (
    <Grid container spacing={2}>
      {modeStatus === "face_off_started" && (
        <Grid container>
          <Grid>
            <Typography>Select team who buzzed in first</Typography>
          </Grid>
          <Grid container spacing={2}>
            <Grid>
              <Button
                variant="contained"
                color={buzzedInTeam === 1 ? "success" : "primary"}
                onClick={() => setBuzzedInTeam(1)}
              >
                {teamNames[0]}
              </Button>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                color={buzzedInTeam === 2 ? "success" : "primary"}
                onClick={() => setBuzzedInTeam(2)}
              >
                {teamNames[1]}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}

      {modeStatus === "face_off_started" && buzzedInTeam && (
        <Grid container>
          <Typography>
            Select answer for {teamNames[buzzedInTeam - 1]} (buzzed in)
          </Typography>
          <StoredAnswerSelector
            storedAnswers={question.answers}
            buttonColor={(answerText) =>
              answerText === answer ? "success" : "primary"
            }
            onAnswerPicked={(answerText) => setAnswer(answerText)}
            includeInvalidOption
            disabled={(answerText) =>
              question.answers.some(
                (answer) =>
                  answer.answerText === answerText && answer.answerRevealed
              )
            }
          />
        </Grid>
      )}
      {modeStatus === "getting_other_buzzed_in_answer" && currentTeam && (
        <Grid container>
          <Typography>
            Select answer for {teamNames[currentTeam - 1]} (steal)
          </Typography>
          <StoredAnswerSelector
            storedAnswers={question.answers}
            buttonColor={(answerText) =>
              answerText === answer ? "success" : "primary"
            }
            onAnswerPicked={(answerText) => setAnswer(answerText)}
            includeInvalidOption
            disabled={(answerText) =>
              question.answers.some(
                (answer) =>
                  answer.answerText === answerText && answer.answerRevealed
              )
            }
          />
        </Grid>
      )}

      {answer && (
        <Grid container size={6}>
          <Grid spacing={2}>
            <Button
              variant="contained"
              color={"primary"}
              onClick={onSubmit}
              disabled={submitDisabled}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
