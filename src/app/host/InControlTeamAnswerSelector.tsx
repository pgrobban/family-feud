import useSocket from "@/hooks/useSocket";
import type { StoredAnswer } from "@/shared/types";
import StoredAnswerSelector from "./StoredAnswerSelector";
import { Box, Typography } from "@mui/material";

export default function InControlTeamAnswerSelector({
	storedAnswers,
}: { storedAnswers: StoredAnswer[] }) {
	const socket = useSocket();
	const onAnswerPicked = (answerText: string) =>
		socket?.emit("receivedAnswer", answerText);

	return (
		<Box>
			<Typography>Select team's answer</Typography>
			<StoredAnswerSelector
				storedAnswers={storedAnswers}
				onAnswerPicked={onAnswerPicked}
				includeInvalidOption
			/>
		</Box>
	);
}
