import { GameInProgress, GameState } from "./types";

export interface ClientToServerEvents {
  createGame: (teamNames: string[]) => void;
  requestGames: () => void;
  requestGame: () => void;
  modePicked: (mode: Exclude<GameInProgress["mode"], "indeterminate">) => void;
  joinHost: (gameId: string) => void;
  reconnect: (payload: { oldSocketId: string }) => void;
}

export interface ServerToClientEvents {
  gameCreated: (gameState: GameState) => void;
  hostJoined: (gameState: GameState) => void;
  questionPicked: (gameState: GameState) => void;
  answersRevealed: (gameState: GameState) => void;
  teamAnswersGathered: (gameState: GameState) => void;
  pointsAwarded: (gameState: GameState) => void;
  receivedGame: (gameState: GameState | null) => void;
  receivedGames: (games: GameState[]) => void;
}
