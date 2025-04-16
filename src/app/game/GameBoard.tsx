import FamilyWarmupGameBoard from "./FamilyWarmupGameBoard";
import type {
	FaceOffGameState,
	FamilyWarmUpGameState,
	FastMoneyGameState,
	GameState,
} from "@/shared/types";
import FaceOffGameBoard from "./FaceOffGameBoard";
import LogoAndRoundBox from "./LogoAndRoundBox";
import WinScreen from "./WinScreen";
import FastMoneyGameBoard from "./FastMoneyGameBoard";

export default function GameBoard({ gameState }: { gameState: GameState }) {
	switch (gameState.status) {
		case "waiting_for_host":
			return null;
		case "in_progress":
			switch (gameState.mode) {
				case "family_warm_up":
					return (
						<FamilyWarmupGameBoard
							gameState={gameState as GameState & FamilyWarmUpGameState}
						/>
					);
				case "face_off":
					return (
						<FaceOffGameBoard
							gameState={gameState as GameState & FaceOffGameState}
						/>
					);
				case "fast_money":
					return (
						<FastMoneyGameBoard
							gameState={gameState as GameState & FastMoneyGameState}
						/>
					);
				default:
					return <LogoAndRoundBox round="" text1="Waiting for host..." />;
			}
		case "finished":
			return <WinScreen teamsAndPoints={gameState.teamsAndPoints} />;
	}
}
