import type {
  FaceOffGame,
  FaceOffGameAnswer,
  GameQuestion,
  GameState,
} from "@/shared/types";
import { Box, Typography } from "@mui/material";
import AnswerCard from "./AnswerCard";

export default function FaceOffGameBoard({
  gameState,
}: {
  gameState: GameState & FaceOffGame;
}) {
  if (
    gameState.status !== "in_progress" ||
    gameState.mode !== "face_off" ||
    !gameState.question
  ) {
    return null;
  }

  const question = gameState.question as GameQuestion<FaceOffGameAnswer>;

  const pointsToBeAwarded = question.answers
    .filter((a) => a.revealed && a.revealedByControlTeam)
    .reduce((sum, a) => sum + a.points, 0);

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
          width: 200,
        }}
      >
        <Typography variant="h3">{pointsToBeAwarded}</Typography>
      </Box>

      <Box>
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
          {gameState.question.answers.map((answer, index) => (
            <AnswerCard key={answer.answerText} answer={answer} index={index} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
