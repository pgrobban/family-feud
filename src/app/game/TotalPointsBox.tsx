import type { GameAnswer } from "@/shared/types";
import { Box, type SxProps } from "@mui/material";

function calculateTeamPoints(
  answers: GameAnswer[],
  teamAnswers: string[]
): number {
  return teamAnswers.reduce((total, teamAnswerText) => {
    const match = answers.find((a) => a.answerText === teamAnswerText);
    return total + (match ? match.points : 0);
  }, 0);
}

export default function TotalPointsBox({
  sideBoxStyles,
  answers,
  team1Answers = [],
  team2Answers = [],
}: {
  sideBoxStyles: SxProps;
  answers: GameAnswer[];
  team1Answers: string[];
  team2Answers: string[];
}) {
  const team1Points = calculateTeamPoints(answers, team1Answers);
  const team2Points = calculateTeamPoints(answers, team2Answers);
  const totalPointsStyles = {
    ...sideBoxStyles,
    color: "white",
    fontSize: "120%",
  };

  return (
    <Box display={"flex"} gap={1}>
      <Box sx={totalPointsStyles}>{team1Points}</Box>
      <Box
        width="100%"
        sx={{
          background: "linear-gradient(to bottom, #3964c9, #1b2d6d)",
        }}
        textAlign={"center"}
        p={2}
        border={"3px solid #fff"}
        fontSize={32}
        borderRadius={2}
        color={"white"}
      >
        Total points for this question
      </Box>
      <Box sx={totalPointsStyles}>{team2Points}</Box>
    </Box>
  );
}
