"use client";
import useSocket from "@/hooks/useSocket";
import type { StoredAnswer } from "@/shared/types";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useState } from "react";

function TeamAnswerPicker({
	teamNumber,
	teamAnswers,
	toggleAnswerText,
	storedAnswers,
}: {
	teamNumber: 1 | 2;
	teamAnswers: string[];
	toggleAnswerText: (teamNumber: 1 | 2, answerText: string) => void;
	storedAnswers: StoredAnswer[];
}) {
	return (
		<Box p={2}>
			<Typography>Team {teamNumber} answers</Typography>
			<Grid container spacing={2}>
				{storedAnswers.map(({ answerText }) => (
					<Grid key={answerText}>
						<Button
							color={teamAnswers.includes(answerText) ? "success" : "primary"}
							variant="contained"
							onClick={() => toggleAnswerText(teamNumber, answerText)}
						>
							{answerText}
						</Button>
					</Grid>
				))}
			</Grid>
		</Box>
	);
}

export default function TeamAnswerSelector({
	storedAnswers,
}: { storedAnswers: StoredAnswer[] }) {
	const socket = useSocket();
	const [team1Answers, setTeam1Answers] = useState<string[]>([]);
	const [team2Answers, setTeam2Answers] = useState<string[]>([]);

	const submitAnswers = () =>
		socket?.emit("hostGatheredTeamAnswers", team1Answers, team2Answers);

	const toggleAnswerText = (teamNumber: 1 | 2, answerText: string) => {
		let newTeamAnswers = [...(teamNumber === 1 ? team1Answers : team2Answers)];
		if (newTeamAnswers.includes(answerText)) {
			newTeamAnswers = newTeamAnswers.filter((answer) => answer !== answerText);
		} else {
			newTeamAnswers.push(answerText);
		}
		teamNumber === 1
			? setTeam1Answers(newTeamAnswers)
			: setTeam2Answers(newTeamAnswers);
	};

	return (
		<>
			<TeamAnswerPicker
				teamNumber={1}
				teamAnswers={team1Answers}
				toggleAnswerText={toggleAnswerText}
				storedAnswers={storedAnswers}
			/>

			<TeamAnswerPicker
				teamNumber={2}
				teamAnswers={team2Answers}
				toggleAnswerText={toggleAnswerText}
				storedAnswers={storedAnswers}
			/>

			<Box mt={2}>
				<Button variant="contained" color="primary" onClick={submitAnswers}>
					Submit answers
				</Button>
			</Box>
		</>
	);
}
