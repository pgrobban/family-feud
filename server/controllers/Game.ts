import type {
  FaceOffGame,
  FamilyWarmUpGame,
  FastMoneyGame,
  GameInProgress,
  GameQuestion,
  GameState,
  StoredQuestion,
  TeamAndPoints,
} from "@/shared/types";
import questions from "../../src/shared/questions.json";
const storedQuestions: StoredQuestion[] = questions;

export default class Game {
  public id: string;
  private gameState: GameState;
  /* private gameEvents: EventEmitter<GameEventMap> =
    new EventEmitter<GameEventMap>();*/
  private playerSocketIds: string[] = [];
  private hostSocketIds: string[] = [];

  constructor(id: string, socketId: string, teamNames: string[]) {
    this.id = id;
    this.playerSocketIds = [socketId];

    this.gameState = {
      id,
      teamNames,
      teamsAndPoints: teamNames.map((teamName) => ({ teamName, points: 0 })),
      status: "waiting_for_host",
    };
  }

  get mode() {
    if (!this.gameState) throw new Error("Game not created yet");
    // @ts-expect-error TODO
    return (this as GameInProgress).gameState.mode;
  }

  get modeStatus() {
    return this.gameState.modeStatus;
  }

  get teamNames() {
    return this.gameState.teamsAndPoints.map((team) => team.teamName);
  }
  get teamsAndPoints() {
    return this.gameState.teamsAndPoints;
  }

  get status() {
    return this.gameState.status;
  }

  toJson(): GameState {
    //@ts-expect-error TODO
    return {
      id: this.id,
      mode: this.mode,
      modeStatus: this.gameState.modeStatus,
      teamNames: this.teamNames,
      teamsAndPoints: this.teamsAndPoints,
      status: this.status,
      question: this.gameState.question,
    };
  }

  getPlayerSocketIds() {
    return this.playerSocketIds;
  }
  getHostSocketIds() {
    return this.hostSocketIds;
  }

  createGame(teamNames: string[]) {
    this.updateGameState({
      teamsAndPoints: teamNames.map((teamName) => ({ teamName, points: 0 })),
      status: "waiting_for_host",
    });
  }

  joinHost(socketId: string) {
    if (!this.gameState) {
      throw new Error("Game not created yet");
    }
    if (!this.hostSocketIds.includes(socketId)) {
      this.hostSocketIds.push(socketId);
    }

    this.updateGameState({
      status: "in_progress",
      mode: "indeterminate",
    });
    // this.gameEvents.emit("hostJoined", this.gameState);
  }

  hostPickedMode<T extends Exclude<GameInProgress["mode"], "indeterminate">>(
    mode: T
  ) {
    if (!this.validateGameStatus("indeterminate")) {
      return;
    }

    let modeProps: Omit<GameInProgress, "status">;

    switch (mode) {
      case "family_warm_up":
        modeProps = {
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          currentTeam: 0,
        } as FamilyWarmUpGame;
        break;
      case "face_off":
        modeProps = {
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          currentTeam: 0,
        } as FaceOffGame;
        break;
      case "fast_money":
        modeProps = {
          mode,
          modeStatus: "waiting_for_questions",
          questions: [],
          answersTeam1: [],
          answersTeam2: [],
          currentTeam: 0,
        } as FastMoneyGame;
        break;
    }

    this.updateGameState({ ...modeProps, status: "in_progress" });
  }

  hostPickedQuestion(pickedQuestionText: string) {
    if (!this.validateGameStatus("family_warm_up", "waiting_for_question")) {
      return;
    }

    const stored = storedQuestions.find(
      ({ questionText }) => questionText === pickedQuestionText
    );
    if (!stored) {
      return;
    }

    const gameQuestion: GameQuestion = {
      questionText: stored.questionText,
      answers: stored.answers.map((answer) => ({
        ...answer,
        revealed: false,
      })),
    };

    this.updateGameState({
      question: gameQuestion,
      modeStatus: "question_in_progress",
    });
  }

  revealAnswersFamilyWarmup() {
    if (!this.validateGameStatus("family_warm_up", "question_in_progress")) {
      return;
    }

    const typedState = this.gameState as FamilyWarmUpGame;

    if (!typedState.question) {
      throw new Error("No question selected");
    }

    this.updateGameState({
      question: {
        ...typedState.question,
        answers: typedState.question.answers.map((answer) => ({
          ...answer,
          revealed: true,
        })),
      },
      modeStatus: "revealing_answers",
    });
  }

  gatherTeamAnswersFamilyWarmup(
    team1Answers: string[],
    team2Answers: string[]
  ) {
    if (!this.validateGameStatus("family_warm_up", "revealing_answers")) {
      return;
    }

    this.updateGameState({
      team1Answers,
      team2Answers,
    });
  }

  awardPointsFamilyWarmup() {
    if (!this.validateGameStatus("family_warm_up", "gathering_team_answers")) {
      return;
    }

    const gameState = this.gameState as GameState & FamilyWarmUpGame;

    if (!gameState.team1Answers || !gameState.team2Answers) {
      throw new Error(
        `Team answers are missing. Team 1: ${gameState.team1Answers}, Team 2: ${gameState.team2Answers}`
      );
    }

    if (!gameState.question) {
      throw new Error("Question is missing");
    }

    const calculatePoints = (teamAnswers: string[]) =>
      teamAnswers.reduce((total, answerText) => {
        const foundAnswer = gameState.question!.answers.find(
          (a) => a.answerText === answerText
        );
        return total + (foundAnswer ? foundAnswer.points : 0);
      }, 0);

    const newTeamsAndPoints: TeamAndPoints[] = gameState.teamsAndPoints.map(
      (team, index) => ({
        ...team,
        points:
          team.points +
          calculatePoints(
            index === 0 ? gameState.team1Answers! : gameState.team2Answers!
          ),
      })
    );

    this.updateGameState({
      teamsAndPoints: newTeamsAndPoints,
      modeStatus: "awarding_points",
    });
  }

  private validateGameStatus(
    expectedMode: GameInProgress["mode"],
    expectedStatus?: string
  ): boolean {
    if (!this.gameState || this.gameState.status !== "in_progress") {
      throw new Error(`Game not in progress, got: ${this.gameState?.status}`);
    }

    if (!("mode" in this.gameState) || this.gameState.mode !== expectedMode) {
      throw new Error(
        `Wrong game mode, expected ${expectedMode}, got: ${this.gameState.mode}`
      );
    }

    if (!expectedStatus) {
      return true;
    }

    if (
      !("modeStatus" in this.gameState) ||
      this.gameState.modeStatus !== expectedStatus
    ) {
      throw new Error(
        `Game mode not in expected state (${expectedStatus}), got: ${this.gameState.modeStatus}`
      );
    }

    return true;
  }

  private updateGameState(updates: Partial<GameState>) {
    if (!this.gameState) {
      return;
    }
    this.gameState = { ...this.gameState, ...updates } as GameState;
  }
}
