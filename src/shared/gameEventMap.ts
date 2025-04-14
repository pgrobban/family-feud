import type { GameInProgress, GameState } from "./types";

export type ToTeam = 'playing_team' | 'stealing_team';
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
  hostRequestedQuit: () => void;
  requestStartTimer: (seconds: number) => void;
  requestCancelTimer: () => void;

  'familyWarmup:hostRequestedTeamAnswers': () => void;
  'familyWarmup:hostGatheredTeamAnswers': (
    team1Answers: string[],
    team2Answers: string[]
  ) => void;
  'familyWarmup:requestRevealTeamAnswers': () => void;
  'familyWarmup:requestAwardTeamPoints': () => void;

  'faceOff:submitBuzzInAnswer': (team: 1 | 2, answerText: string) => void;
  'faceOff:requestOtherTeamBuzzInAnswer': () => void;
  'faceOff:requestAskTeamToPlayOrPass': () => void;
  'faceOff:receivedPlayOrPass': (choice: "play" | "pass") => void;
  'faceOff:receivedAnswer': (answerText: string) => void;
  'faceOff:receivedStealAnswer': (answerText: string) => void;
  'faceOff:requestRevealStoredAnswers': () => void;
  'faceOff:requestAwardPoints': () => void;

  'fastMoney:questionsPicked': (questions: string[]) => void;
  'fastMoney:receivedResponses': (responses: string[]) => void;
  'fastMoney:requestRevealAnswer': (answerIndex: number, to: ToTeam) => void;
  'fastMoney:requestRevealPoints': (answerIndex: number, to: ToTeam) => void;
  'fastMoney:requestStealQuestionAndAnswer': () => void;
  'fastMoney:receivedStealQuestionAndAnswer': (questionText: string, answerText: string) => void;
  'fastMoney:requestRevealStealQuestionAndAnswer': () => void;
  'fastMoney:requestRevealAllPoints': () => void;
  'fastMoney:requestAwardPoints': () => void;
}

export interface ServerToClientEvents {
  gameCreated: (gameState: GameState) => void;
  hostJoined: (gameState: GameState) => void;
  receivedGameState: (gameState: GameState | null) => void;
  receivedGames: (games: GameState[]) => void;
  answerRevealed: (payload: { index: number }) => void;
  answerIncorrect: (payload: { strikes: number }) => void;
  hostLeft: () => void;
  timerStarted: (seconds: number) => void;
  timerCancelled: () => void;

  'fastMoney:answerRevealed': (answerIndex: number, to: ToTeam) => void;
  'fastMoney:pointsRevealed': (answerIndex: number, to: ToTeam) => void;
}

export type EventHandler<
  K extends keyof (ClientToServerEvents & ServerToClientEvents)
> = K extends keyof ClientToServerEvents
  ? (...args: Parameters<ClientToServerEvents[K]>) => void
  : K extends keyof ServerToClientEvents
  ? (...args: Parameters<ServerToClientEvents[K]>) => void
  : never;
