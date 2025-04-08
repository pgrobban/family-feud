import { Box, Typography } from "@mui/material";
import type { GameState, FamilyWarmUpGame } from "@/shared/types";
import AnswerCardWithTeamPoints from "./AnswerCardWithTeamPoints";
import TotalPointsBox from "./TotalPointsBox";

const sideBoxStyles = {
  mt: 1,
  width: 60,
  height: 60,
  border: "1px solid #ccc",
  background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  textAlign: "center",
};

export default function FamilyWarmupGameBoard({
  gameState,
}: {
  gameState: GameState & FamilyWarmUpGame;
}) {
  if (
    gameState.status !== "in_progress" ||
    gameState.mode !== "family_warm_up"
  ) {
    return null;
  }

  switch (gameState.modeStatus) {
    case "waiting_for_question":
      return <Typography>Waiting for host to pick question...</Typography>;

    case "question_in_progress":
    case "gathering_team_answers":
    case "revealing_stored_answers":
    case "revealing_team_answers":
    case "awarding_points":
      if (!gameState.question) {
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
              {gameState.question.questionText}
            </Typography>
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
                <AnswerCardWithTeamPoints
                  key={answer.answerText}
                  answer={answer}
                  index={index}
                  sideBoxStyles={sideBoxStyles}
                  modeStatus={gameState.modeStatus}
                  team1Answers={gameState.team1Answers || []}
                  team2Answers={gameState.team2Answers || []}
                />
              ))}
              <Box m={1} />
              {gameState.modeStatus === "awarding_points" && (
                <TotalPointsBox
                  answers={gameState.question.answers}
                  team1Answers={gameState.team1Answers || []}
                  team2Answers={gameState.team2Answers || []}
                  sideBoxStyles={sideBoxStyles}
                />
              )}
            </Box>
          </Box>
        </Box>
      );
  }
}
