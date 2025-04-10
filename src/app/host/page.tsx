"use client";
import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { isSocketDefined } from "@/shared/utils";
import { Box, Button } from "@mui/material";
import GameBoardWithScores from "../game/GameBoardWithScores";
import GameModePicker from "./GameModePicker";
import FamilyWarmupControls from "./FamilyWarmupControls";
import type { FaceOffGame, FamilyWarmUpGame, GameState } from "@/shared/types";
import FaceOffControls from "./FaceOffControls";
import { useRouter } from "next/navigation";

export default function Host() {
	const socket = useSocket();
	const [gameState, setGameState] = useState<GameState | null>(null);
	const router = useRouter();

	useEffect(() => {
		if (!isSocketDefined(socket)) {
			return;
		}

		const handleReceivedGameState = (gameState: GameState | null) =>
			setGameState(gameState);

		socket.emit("requestGameState");
		socket.on("receivedGameState", handleReceivedGameState);

		return () => {
			socket.off("receivedGameState", handleReceivedGameState);
		};
	}, [socket]);

	const cancelQuestion = () => socket?.emit("questionOrModeCancelled");

	const quitGame = () => {
		socket?.emit("hostRequestedQuit");
		router.push("/join");
	};

	if (!gameState) {
		return <Box>Connecting...</Box>;
	}
	return (
		<Box>
			<Box>
				<GameBoardWithScores gameState={gameState} />
			</Box>
			{gameState.mode === "indeterminate" && <GameModePicker />}
			<FamilyWarmupControls
				gameState={gameState as GameState & FamilyWarmUpGame}
			/>
			<FaceOffControls gameState={gameState as GameState & FaceOffGame} />
			{gameState.status === "in_progress" &&
				gameState.mode !== "indeterminate" && (
					<Box mt={10}>
						<Button
							onClick={cancelQuestion}
							variant="contained"
							color="secondary"
						>
							Cancel question
						</Button>
					</Box>
				)}
			<Box mt={10}>
				<Button onClick={quitGame} variant="contained" color="secondary">
					Quit game
				</Button>
			</Box>
		</Box>
	);
}
