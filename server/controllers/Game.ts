import type {
  BaseGameState,
  FaceOffGame,
  FamilyWarmUpGame,
  FastMoneyGame,
  GameFinished,
  GameInProgress,
  GameQuestion,
  GameState,
  StoredQuestion,
  TeamAndPoints,
  WaitingForHostGame,
} from "@/shared/types";
import questions from "../../src/shared/questions.json";
import type { Server } from "socket.io";

const storedQuestions: StoredQuestion[] = questions;

export default class Game {
  public id: string;
  private gameState: GameState;
  private playerSocketIds: string[] = [];
  private hostSocketIds: string[] = [];
  private io: Server;

  constructor(id: string, socketId: string, teamNames: string[], io: Server) {
    this.id = id;
    this.playerSocketIds = [socketId];
    this.io = io;

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

  get question() {
    return this.gameState.question;
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
    const state: BaseGameState = {
      id: this.id,
      mode: this.mode,
      modeStatus: this.modeStatus,
      teamNames: this.teamNames,
      teamsAndPoints: this.teamsAndPoints,
      status: this.status,
    };

    switch (this.status) {
      case "waiting_for_host": {
        const waitingForHostState = state as GameState & WaitingForHostGame;
        return waitingForHostState;
      }
      case "finished": {
        const waitingForHostState = state as GameState & GameFinished;
        return waitingForHostState;
      }
      case "in_progress": {
        const inProgressGameState = {
          ...state,
          teamNames: this.teamNames,
          teamsAndPoints: this.teamsAndPoints,
        } as GameState & GameInProgress;

        switch (this.mode) {
          case "family_warm_up": {
            const typedState = inProgressGameState as FamilyWarmUpGame;
            return {
              ...typedState,
              team1Answers: (this.gameState as FamilyWarmUpGame).team1Answers,
              team2Answers: (this.gameState as FamilyWarmUpGame).team2Answers,
              question: this.question,
            } as BaseGameState & GameInProgress & FamilyWarmUpGame;
          }
          case "face_off": {
            const typedState = inProgressGameState as FaceOffGame;
            return {
              ...typedState,
              question: this.question,
              buzzOrder: (this.gameState as FaceOffGame).buzzOrder,
              currentTeam: (this.gameState as FaceOffGame).currentTeam,
              isStolen: (this.gameState as FaceOffGame).isStolen,
              strikes: (this.gameState as FaceOffGame).strikes,
            } as BaseGameState & GameInProgress & FaceOffGame;
          }
        }
      }
    }

    // @ts-expect-error TODO
    return state;
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
  }

  hostPickedMode(mode: Exclude<GameInProgress["mode"], "indeterminate">) {
    if (!this.validateGameStatus("indeterminate")) {
      return;
    }

    const stateProps = this.getNewQuestionState(mode);
    this.updateGameState({ ...stateProps, status: "in_progress" });
  }

  private getNewQuestionState(
    mode: Exclude<GameInProgress["mode"], "indeterminate">
  ) {
    switch (mode) {
      case "family_warm_up":
        return {
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          team1Answers: [],
          team2Answers: [],
        } as FamilyWarmUpGame;
      case "face_off":
        return {
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          buzzOrder: [],
          isStolen: false,
          strikes: 0,
          currentTeam: null,
        } as FaceOffGame;
      case "fast_money":
        return {
          mode,
          modeStatus: "waiting_for_questions",
          questions: [],
          answersTeam1: [],
          answersTeam2: [],
          currentTeam: 0,
        } as FastMoneyGame;
    }
  }

  hostRequestedTeamAnswers() {
    if (!this.validateGameStatus("family_warm_up", "question_in_progress")) {
      return;
    }
    this.updateGameState({ modeStatus: "gathering_team_answers" });
  }

  cancelQuestionOrMode() {
    this.updateGameState({
      mode: "indeterminate",
    });
  }

  hostPickedQuestionForCurrentMode(pickedQuestionText: string) {
    if (
      !this.validateGameStatus(
        ["family_warm_up", "face_off", "fast_money"],
        "waiting_for_question"
      )
    ) {
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
      modeStatus:
        this.mode === "family_warm_up"
          ? "question_in_progress"
          : "face_off_started",
    });
  }

  revealTeamAnswersFamilyWarmup() {
    if (
      !this.validateGameStatus("family_warm_up", "revealing_stored_answers")
    ) {
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
      modeStatus: "revealing_team_answers",
    });
  }

  hostGatheredTeamAnswersFamilyWarmup(
    team1Answers: string[],
    team2Answers: string[]
  ) {
    if (
      !this.validateGameStatus("family_warm_up", "gathering_team_answers") ||
      !this.question
    )
      return;

    this.updateGameState({
      team1Answers,
      team2Answers,
      modeStatus: "revealing_stored_answers",
    });

    this.question.answers.forEach((_, index) => {
      setTimeout(() => {
        this.question!.answers[index].revealed = true;
        this.io.to(this.id).emit("answerRevealed", { index });

        if (index === this.question!.answers.length - 1) {
          setTimeout(() => {
            this.io.to(this.id).emit("receivedGameState", this.toJson());
          }, 500);
        }
      }, index * 800);
    });
  }

  hostRevealedTeamAnswersFamilyWarmup() {
    if (
      !this.validateGameStatus("family_warm_up", "revealing_stored_answers")
    ) {
      return;
    }

    this.updateGameState({
      modeStatus: "revealing_team_answers",
    });
  }

  awardPointsFamilyWarmup() {
    if (!this.validateGameStatus("family_warm_up", "revealing_team_answers")) {
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
        const foundAnswer = this.question!.answers.find(
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

  requestNewQuestion() {
    const newQuestionStateProps = this.getNewQuestionState(this.mode);
    this.updateGameState(newQuestionStateProps);
  }

  private validateGameStatus(
    expectedModeOrModes: GameInProgress["mode"] | GameInProgress["mode"][],
    expectedStatusOrStatuses?: string | string[]
  ): boolean {
    if (!this.gameState || this.gameState.status !== "in_progress") {
      throw new Error(`Game not in progress, got: ${this.gameState?.status}`);
    }

    if (
      !("mode" in this.gameState) ||
      (typeof expectedModeOrModes === "string" &&
        this.mode !== expectedModeOrModes) ||
      (Array.isArray(expectedModeOrModes) &&
        !expectedModeOrModes.includes(this.mode))
    ) {
      throw new Error(
        `Wrong game mode, expected ${expectedModeOrModes}, got: ${this.mode}`
      );
    }

    if (!expectedStatusOrStatuses) {
      return true;
    }

    if (!this.modeStatus) {
      return false;
    }

    if (
      !("modeStatus" in this.gameState) ||
      (typeof expectedStatusOrStatuses === "string" &&
        this.gameState.modeStatus !== expectedStatusOrStatuses) ||
      (Array.isArray(expectedStatusOrStatuses) &&
        !expectedStatusOrStatuses.includes(this.modeStatus))
    ) {
      throw new Error(
        `Game mode not in expected status (${expectedStatusOrStatuses}), got: ${this.modeStatus}`
      );
    }

    return true;
  }

  submitBuzzInAnswer(
    team: 1 | 2,
    answerText: string
  ): true | undefined {
    if (
      !this.validateGameStatus("face_off", ["face_off_started", "getting_other_buzzed_in_answer"])
    ) {
      return;
    }

    const game = this.gameState as Extract<GameState, { mode: "face_off" }>;

    if (game.buzzOrder.includes(team)) return;

    const updatedBuzzOrder = [...game.buzzOrder, team];

    const answerIndex = game.question?.answers.findIndex(
      (a) => a.answerText.toLowerCase() === answerText.toLowerCase()
    );

    const isCorrect = answerIndex !== -1;
    const isFirstBuzz = updatedBuzzOrder.length === 1;
    const nextStatus = isFirstBuzz
      ? "reveal_buzzed_in_answer"
      : "reveal_other_buzzed_in_answer";

    if (isCorrect) {
      const answer = game.question!.answers[answerIndex!];
      answer.revealed = true;
      answer.revealedByControlTeam = true;

      this.io.to(this.id).emit("answerRevealed", { index: answerIndex });

      setTimeout(() => {
        this.updateGameState({
          question: game.question,
          buzzOrder: updatedBuzzOrder,
          currentTeam: team,
          modeStatus: nextStatus,
        });
        this.io.to(this.id).emit("receivedGameState", this.toJson());
      }, 800);

      return;
    }
    this.io.to(this.id).emit("answerIncorrect", { strikes: 1 });

    this.updateGameState({
      buzzOrder: updatedBuzzOrder,
      currentTeam: team,
      modeStatus: nextStatus,
    });

    return true;
  }

  requestOtherTeamToBuzzInAnswer() {
    this.updateGameState({
      currentTeam: (this.gameState as FaceOffGame).currentTeam === 1 ? 2 : 1,
      modeStatus: 'getting_other_buzzed_in_answer'
    })
  }

  requestAskTeamToPlayOrPass() {
    if (
      !this.validateGameStatus("face_off", ["reveal_buzzed_in_answer", "reveal_other_buzzed_in_answer"])
    ) {
      return;
    }
    this.updateGameState({
      modeStatus: 'team_asked_to_play'
    });
  }

  receivedPlayOrPass(choice: 'play' | 'pass') {
    if (
      !this.validateGameStatus("face_off", ["team_asked_to_play"])
    ) {
      return;
    }

    const typedState = this.gameState as FaceOffGame;
    if (!typedState.currentTeam) {
      throw new Error('No current team!');
    }

    let inControlTeam: 1 | 2;
    if (choice === "play") {
      inControlTeam = typedState.currentTeam;
    } else {
      inControlTeam = typedState.currentTeam === 1 ? 2 : 1;
    }

    this.updateGameState({
      inControlTeam,
      modeStatus: 'in_control_team_guesses'
    })
  }

  private updateGameState(updates: Partial<GameState>) {
    if (!this.gameState) {
      return;
    }
    this.gameState = { ...this.gameState, ...updates } as GameState;
  }
}
