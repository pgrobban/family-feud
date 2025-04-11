import type { GameInProgress, GameState } from "./types";

export interface ClientToServerEvents {
  createGame: (teamNames: string[]) => void;
  requestGames: () => void;
  requestGameState: () => void;
  requestEndGame: () => void;
  modePicked: (mode: Exclude<GameInProgress["mode"], "indeterminate">) => void;
  questionOrModeCancelled: () => void;
  questionPicked: (question: string) => void;
  joinHost: (gameId: string) => void;
  requestNewQuestion: () => void;
  reconnect: (payload: { oldSocketId: string }) => void;

  // family warmup events
  hostRequestedTeamAnswers: () => void;
  hostGatheredTeamAnswers: (team1Answers: string[], team2Answers: string[]) => void;
  requestRevealTeamAnswers: () => void;
  awardTeamPoints: () => void;

  // faceoff events
  submitBuzzInAnswer: (team: 1 | 2, answerText: string) => void;
  requestOtherTeamBuzzInAnswer: () => void;
  requestAskTeamToPlayOrPass: () => void;
  receivedPlayOrPass: (choice: 'play' | 'pass') => void;
  receivedAnswer: (answerText: string) => void;
  receivedStealAnswer: (answerText: string) => void;
}

export interface ServerToClientEvents {
  gameCreated: (gameState: GameState) => void;
  hostJoined: (gameState: GameState) => void;
  receivedGameState: (gameState: GameState | null) => void;
  receivedGames: (games: GameState[]) => void;
  answerRevealed: (payload: { index: number }) => void;
  answerIncorrect: (payload: { strikes: number }) => void;
}
