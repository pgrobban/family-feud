import type { StoredAnswer } from "@/shared/types";
import { Button, type ButtonOwnProps, Grid } from "@mui/material";

interface Props {
	storedAnswers: StoredAnswer[];
	buttonColor?: (answerText: string) => ButtonOwnProps["color"];
	onAnswerPicked: (answerText: string) => void;
	includeInvalidOption?: boolean;
}

export default function StoredAnswerSelector({
	storedAnswers,
	buttonColor,
	onAnswerPicked,
	includeInvalidOption,
}: Props) {
	return (
		<Grid container spacing={2}>
			{storedAnswers.map(({ answerText }) => (
				<Grid key={answerText}>
					<Button
						color={buttonColor?.(answerText)}
						variant="contained"
						onClick={() => onAnswerPicked(answerText)}
					>
						{answerText}
					</Button>
				</Grid>
			))}
			{includeInvalidOption && (
				<Grid ml={5}>
					<Button
						color={"secondary"}
						variant="contained"
						onClick={() => onAnswerPicked("Invalid answer")}
					>
						Not on board/
						<br />
						No answer
					</Button>
				</Grid>
			)}
		</Grid>
	);
}
