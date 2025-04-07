export interface BaseGameState {
  id: string;
  teamNames: string[];
  teamsAndPoints: TeamAndPoints[];
  status: WaitingForHostGame["status"]
  | GameInProgress["status"]
  | GameFinished["status"];
  question?: GameQuestion | null;
  questions?: GameQuestion[];
  mode?:
  | FamilyWarmUpGame["mode"]
  | FaceOffGame["mode"]
  | FastMoneyGame["mode"]
  | IndeterminateGame["mode"];
  modeStatus?:
  | FamilyWarmUpGame["modeStatus"]
  | FaceOffGame["modeStatus"]
  | FastMoneyGame["modeStatus"]
  | null;
}

export type GameState = BaseGameState & (WaitingForHostGame | GameInProgress | GameFinished);

export interface WaitingForHostGame {
  status: "waiting_for_host";
}

export type GameInProgress = {
  status: "in_progress";
} & (IndeterminateGame | FamilyWarmUpGame | FaceOffGame | FastMoneyGame);

export interface IndeterminateGame {
  mode: "indeterminate";
}

export interface FamilyWarmUpGame {
  mode: "family_warm_up";
  modeStatus:
  | "waiting_for_question"
  | "question_in_progress"
  | "gathering_team_answers"
  | "revealing_stored_answers"
  | "revealing_team_answers"
  | "awarding_points";
  currentTeam: number;
  question: GameQuestion | null;
  team1Answers?: string[];
  team2Answers?: string[];
}

export interface FaceOffGame {
  mode: "face_off";
  modeStatus:
  | "waiting_for_question"
  | "question_in_progress"
  | "revealing_answers";
  currentTeam: number;
  question: GameQuestion | null;
}

export interface FastMoneyGame {
  mode: "fast_money";
  modeStatus:
  | "waiting_for_questions"
  | "questions_in_progress"
  | "revealing_answers";
  currentTeam: number;
  questions: GameQuestion[];
  answersTeam1: string[];
  answersTeam2: string[];
}

export interface TeamAndPoints {
  teamName: string;
  points: number;
}

export interface GameFinished {
  status: "finished";
}

export interface StoredQuestion {
  questionText: string;
  answers: StoredAnswer[];
}

export interface StoredAnswer {
  answerText: string;
  points: number;
}

export interface GameAnswer extends StoredAnswer {
  revealed: boolean;
}

export interface GameQuestion extends StoredQuestion {
  answers: GameAnswer[];
}
