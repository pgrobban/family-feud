export type GameState = {
  id: string;
  teamNames: string[];
  teamsAndPoints: TeamAndPoints[];
} & (WaitingForHostGame | GameInProgress | GameFinished);

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
    | "revealing_answers"
    | "gathering_team_answers"
    | "awarding_points";
  currentTeam: number;
  question: string | null;
  answers: Answer[];
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
  question: string | null;
  answers: Answer[];
}

export interface FastMoneyGame {
  mode: "fast_money";
  modeStatus:
    | "waiting_for_questions"
    | "questions_in_progress"
    | "revealing_answers";
  currentTeam: number;
  questions: string[];
  answersTeam1: Answer[];
  answersTeam2: Answer[];
}

export interface TeamAndPoints {
  teamName: string;
  points: number;
}

export interface GameFinished {
  status: "finished";
}

export interface Answer {
  answerText: string;
  revealed: boolean;
  points: number;
}
