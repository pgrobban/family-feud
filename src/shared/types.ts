export interface TeamAndPoints {
  teamName: string;
  points: number;
}

type GameStatus = "waiting_for_host" | "in_progress" | "finished";

export type Mode =
  | "family_warm_up"
  | "face_off"
  | "fast_money"
  | "indeterminate";

export interface BaseGameState {
  id: string;
  teamNames: string[];
  teamsAndPoints: TeamAndPoints[];
  points: number[];
  status: GameStatus;
  mode: Mode;
}

export type GameState =
  | IndeterminateGameState
  | FamilyWarmUpGameState
  | FaceOffGameState
  | FastMoneyGameState;

export interface IndeterminateGameState extends BaseGameState {
  mode: "indeterminate";
  modeStatus: null;
}
export interface FamilyWarmUpGameState extends BaseGameState {
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

export interface FaceOffGameState extends BaseGameState {
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
  | "revealing_steal_answer" // Reveal the steal answer. If all answers are revealed, go to awarding points, otherwise revealing_stored_answers
  | "revealing_stored_answers" // Reveal remaining hidden answers.
  | "awarding_points"; // Award points to the correct team based if the steal was successful.

  currentTeam: 1 | 2 | null; // The team currently answering or controlling.
  inControlTeam: 1 | 2 | null;
  buzzOrder: (1 | 2)[]; // Order of teams that buzzed in.
  question: GameQuestion<FaceOffGameAnswer> | null; // The current question.
  strikes: number; // Number of strikes the team in control has.
  isStolen: boolean;
}
export interface FastMoneyGameState extends BaseGameState {
  mode: "fast_money";
  modeStatus:
  | "waiting_for_questions" // host picks questions
  | "questions_in_progress" // member of team 1 answers
  | "revealing_answers" // reveal the gathered answers. if < 200 points, go to request_steal_question_and_answer, otherwise go to reveal_points
  | "request_steal_question_and_answer" // UI state transition to...
  | "received_steal_question_and_answer" // opposing team picks a question and answer to steal
  | "reveal_steal_question_and_answer" // reveal the question and answer that the other team picked to steal
  | "awarding_points"; // award points to the team that had 200 or more points, or the team that stole
  currentTeam: 1 | 2;
  questions?: GameQuestion[];
  responsesFirstTeam?: FastMoneyAnswer[];
  responsesSecondTeam?: FastMoneyAnswer[]; // for steal round. currently only one element will be populated, with the index of a chosen question to steal.
}

export interface StoredQuestion {
  questionText: string;
  answers: StoredAnswer[];
  comment: string;
}

export interface StoredAnswer {
  answerText: string;
  points: number;
}

export interface FaceOffGameAnswer extends GameAnswer {
  revealedByAnyTeam?: boolean;
}

export interface GameQuestion<TAnswer extends GameAnswer = GameAnswer> {
  questionText: string;
  answers: TAnswer[];
}

export interface GameAnswer extends StoredAnswer {
  answerRevealed: boolean;
}

export interface FastMoneyAnswer extends GameAnswer {
  pointsRevealed: boolean;
  isTopAnswer: boolean;
}
