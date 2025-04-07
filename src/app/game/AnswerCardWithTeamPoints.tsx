import type { FamilyWarmUpGame, GameAnswer } from "@/shared/types";
import { Box, type SxProps } from "@mui/material";
import AnswerCard from "./AnswerCard";

interface Props {
	answer: GameAnswer;
	index: number;
	sideBoxStyles: SxProps;
	modeStatus: FamilyWarmUpGame["modeStatus"];
	team1Answers: string[];
	team2Answers: string[];
}

export default function AnswerCardWithTeamPoints({
	answer,
	index,
	sideBoxStyles,
	modeStatus,
	team1Answers = [],
	team2Answers = [],
}: Props) {
	const okModesToShowTeamPoints = ["revealing_team_answers", "awarding_points"];
	const isEligibleForPoints = okModesToShowTeamPoints.includes(modeStatus);

	const shouldShowTeam1Points =
		isEligibleForPoints && team1Answers.includes(answer.answerText);
	const shouldShowTeam2Points =
		isEligibleForPoints && team2Answers.includes(answer.answerText);

	return (
		<Box display="flex" gap={1}>
			<Box sx={sideBoxStyles}>{shouldShowTeam1Points ? answer.points : ""}</Box>
			<AnswerCard answer={answer} index={index} />
			<Box sx={sideBoxStyles}>{shouldShowTeam2Points ? answer.points : ""}</Box>
		</Box>
	);
}
