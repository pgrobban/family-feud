import type { GameInProgress, GameState } from "./types";

export interface ClientToServerEvents {
  createGame: (teamNames: string[]) => void;
  requestGames: () => void;
  requestGameState: () => void;
  modePicked: (mode: Exclude<GameInProgress["mode"], "indeterminate">) => void;
  questionOrModeCancelled: () => void;
  questionPicked: (question: string) => void;
  joinHost: (gameId: string) => void;
  hostRequestedTeamAnswers: () => void;
  hostGatheredTeamAnswers: (team1Answers: string[], team2Answers: string[]) => void;
  requestRevealTeamAnswers: () => void;
  awardTeamPoints: () => void;
  requestNewQuestion: () => void;
  reconnect: (payload: { oldSocketId: string }) => void;
}

export interface ServerToClientEvents {
  gameCreated: (gameState: GameState) => void;
  hostJoined: (gameState: GameState) => void;
  receivedGameState: (gameState: GameState | null) => void;
  receivedGames: (games: GameState[]) => void;
}
