import { Box, Grid, Typography } from "@mui/material";
import type { GameState, FamilyWarmUpGame } from "@/shared/types";
import AnswerCard from "./AnswerCard";

export default function FamilyWarmupGameBoard({
  gameState,
}: {
  gameState: GameState;
}) {
  if (
    gameState.status !== "in_progress" ||
    gameState.mode !== "family_warm_up"
  ) {
    return null;
  }

  const typedGameState = gameState as GameState & FamilyWarmUpGame;

  switch (typedGameState.modeStatus) {
    case "waiting_for_question":
      return <Typography>Waiting for host to pick question...</Typography>;

    case "question_in_progress":
      if (!typedGameState.question) {
        return null;
      }

      return (
        <Box>
          <Box
            sx={{
              background: "linear-gradient(to bottom, #3964c9, #1b2d6d)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 48,
              textAlign: "center",
              mx: "auto",
              border: "4px solid #fff",
              borderRadius: 2,
              mb: 3,
              p: 2,
              textTransform: "uppercase",
            }}
          >
            <Typography variant="h5">
              {typedGameState.question.questionText}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%", // important
              height: "100%", // optional, but helps if parent is full height
              gap: 1,
              textTransform: "uppercase",
            }}
          >
            {typedGameState.question.answers.map((answer, index) => (
              <AnswerCard
                key={answer.answerText}
                answer={answer}
                index={index}
              />
            ))}
          </Box>
        </Box>
      );
  }

  return null;
}
