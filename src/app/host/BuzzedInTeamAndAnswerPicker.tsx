"use client";
import useSocket from "@/hooks/useSocket";
import type { FaceOffGame, StoredQuestion } from "@/shared/types";
import { Button, Grid, Typography } from "@mui/material";
import { useState } from "react";
import StoredAnswerSelector from "./StoredAnswerSelector";

export default function BuzzedInTeamAndAnswerPicker({
	modeStatus,
	question,
	teamNames,
}: {
	modeStatus: FaceOffGame["modeStatus"];
	question: StoredQuestion;
	teamNames: string[];
}) {
	const [buzzedInTeam, setBuzzedInTeam] = useState<1 | 2 | null>(null);
	const [answer, setAnswer] = useState<string | null>();
	const socket = useSocket();
	const submitDisabled =
		modeStatus === "face_off_started" ? !buzzedInTeam || !answer : !answer;

	const onSubmit = () =>
		socket?.emit(
			"faceOff:submitBuzzInAnswer",
			buzzedInTeam as 1 | 2,
			answer as string,
		);

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

			<Grid container>
				<Typography>
					Select {modeStatus === "face_off_started" ? "their" : "other team's"}{" "}
					answer
				</Typography>
				<StoredAnswerSelector
					storedAnswers={question.answers}
					buttonColor={(answerText) =>
						answerText === "answer" ? "success" : "primary"
					}
					onAnswerPicked={(answertText) => setAnswer(answertText)}
					includeInvalidOption
				/>
			</Grid>
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
		</Grid>
	);
}
