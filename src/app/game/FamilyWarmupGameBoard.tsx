import { Box, Typography } from "@mui/material";
import type { GameState, FamilyWarmUpGame } from "@/shared/types";

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
          <Box p={2} border={"1px solid #ccc"} textTransform={"uppercase"}>
            <Typography variant="h5">
              {typedGameState.question.questionText}
            </Typography>
          </Box>
        </Box>
      );

    // Add other states as needed
  }

  return null;
}
