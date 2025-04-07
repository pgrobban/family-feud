import type { GameAnswer } from "@/shared/types";
import { Box, type SxProps } from "@mui/material";

function calculateTeamPoints(
	answers: GameAnswer[],
	teamAnswers: string[],
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

	return (
		<Box display={"flex"} gap={1}>
			<Box sx={sideBoxStyles}>{team1Points}</Box>
			<Box width="100%" textAlign={"center"} p={2}>
				Total points for this question
			</Box>
			<Box sx={sideBoxStyles}>{team2Points}</Box>
		</Box>
	);
}
