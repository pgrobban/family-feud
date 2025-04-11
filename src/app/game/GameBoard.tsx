import FamilyWarmupGameBoard from "./FamilyWarmupGameBoard";
import type { FaceOffGame, FamilyWarmUpGame, GameState } from "@/shared/types";
import FaceOffGameBoard from "./FaceOffGameBoard";
import LogoAndRoundBox from "./LogoAndRoundBox";
import WinScreen from "./WinScreen";

export default function GameBoard({ gameState }: { gameState: GameState }) {
	switch (gameState.status) {
		case "waiting_for_host":
			return null;
		case "in_progress":
			switch (gameState.mode) {
				case "indeterminate":
					return <LogoAndRoundBox round="" text="Waiting for host..." />;
				case "family_warm_up":
					return (
						<FamilyWarmupGameBoard
							gameState={gameState as GameState & FamilyWarmUpGame}
						/>
					);
				case "face_off":
					return (
						<FaceOffGameBoard
							gameState={gameState as GameState & FaceOffGame}
						/>
					);
				default:
					return <LogoAndRoundBox round="" text="Unknown game mode" />;
			}
		case "finished":
			return <WinScreen teamsAndPoints={gameState.teamsAndPoints} />;
	}
}
