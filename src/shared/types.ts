export interface BaseGameState {
  id: string;
  teamNames: string[];
  teamsAndPoints: TeamAndPoints[];
  status:
    | WaitingForHostGame["status"]
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

export type GameState = BaseGameState &
  (WaitingForHostGame | GameInProgress | GameFinished);

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
  question: GameQuestion | null;
  team1Answers?: string[];
  team2Answers?: string[];
}

export interface FaceOffGame {
  mode: "face_off";
  modeStatus:
    | "waiting_for_question" // Host is picking or preparing a question.
    | "face_off_started" // Host reads the question aloud; contestants are ready to buzz.
    | "getting_buzzed_in_team_answer" // First team buzzed in. We capture their answer.
    | "reveal_buzzed_in_answer" // Reveal answer. If it's the top answer → go to team_asked_to_play. If not top, continue to getting_other_buzzed_in_answer
    | "getting_other_buzzed_in_answer" // Ask the second team for their answer.
    | "reveal_other_buzzed_in_answer" // Reveal their answer. Determine which answer had a higher point value (or use buzz order for tie).
    | "team_asked_to_play" // Ask the team with the better answer if they want to play or pass.
    | "in_control_team_guesses" // Team in control begins guessing.
    | "reveal_in_control_team_answer" // Reveal answer or give a strike. If 3 strikes → go to steal phase. If all answers revealed → go to awarding points.
    | "ask_other_team_for_guess_for_steal" // Other team confers and gives 1 steal guess.
    | "revealing_stored_answers" // Reveal remaining hidden answers.
    | "awarding_points"; // Award points to the correct team based if the steal was successful.
  currentTeam: 1 | 2 | null; // for buzzing in
  inControlTeam?: number; // optional until a team is in control
  question: GameQuestion<FaceOffGameAnswer> | null;
  buzzOrder: (1 | 2)[];
  isStolen: boolean;
  strikes: number;
}

export interface FastMoneyGame {
  mode: "fast_money";
  modeStatus:
    | "waiting_for_questions" // host picks questions
    | "questions_in_progress" // member of team 1 answers
    | "revealing_questions_and_answers" // reveal the questions and what the answers were. if < 200, don't reveal the answer points. go to request_steal_question_and_answer, otherwise reveal_points
    | "request_steal_question_and_answer" // opposing team picks a question and answer to steal
    | "reveal_points" // reveal the individual question points + steal
    | "award_points"; // award points to the team that had 200 or more points, or the team that stole
  currentTeam: 1 | 2;
  questions?: GameQuestion[];
  responsesFirstTeam?: GameAnswer[];
  responsesSecondTeam?: GameAnswer[];
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

export interface FaceOffGameAnswer extends GameAnswer {
  revealedByControlTeam?: boolean;
}

export interface GameQuestion<TAnswer extends GameAnswer = GameAnswer> {
  questionText: string;
  answers: TAnswer[];
}
