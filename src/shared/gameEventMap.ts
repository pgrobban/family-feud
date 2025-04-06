import { GameInProgress, GameState } from "./types";

export interface ClientToServerEvents {
  createGame: (teamNames: string[]) => void;
  requestGames: () => void;
  requestGameState: () => void;
  modePicked: (mode: Exclude<GameInProgress["mode"], "indeterminate">) => void;
  questionOrModeCancelled: () => void;
  questionPicked: (question: string) => void;
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
  receivedGameState: (gameState: GameState | null) => void;
  receivedGames: (games: GameState[]) => void;
}
