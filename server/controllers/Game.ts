import type {
  FaceOffGame,
  FaceOffGameAnswer,
  FamilyWarmUpGame,
  FastMoneyGame,
  GameInProgress,
  GameQuestion,
  GameState,
  StoredQuestion,
  TeamAndPoints,
} from "@/shared/types";
import questions from "../../src/shared/questions.json";
import type { Server } from "socket.io";
import { getAnswerIndex, getOpposingTeam } from "../../src/shared/utils";

const storedQuestions: StoredQuestion[] = questions;

const MAX_STRIKES = 3;

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
    return this.gameState.mode;
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

  get team1Answers() {
    return (this.gameState as FamilyWarmUpGame).team1Answers;
  }

  get team2Answers() {
    return (this.gameState as FamilyWarmUpGame).team2Answers;
  }

  get currentTeam() {
    return (this.gameState as FaceOffGame | FastMoneyGame).currentTeam;
  }

  get inControlTeam() {
    return (this.gameState as FaceOffGame).inControlTeam;
  }

  get buzzOrder() {
    return (this.gameState as FaceOffGame).buzzOrder;
  }

  get isStolen() {
    return (this.gameState as FaceOffGame).isStolen;
  }

  get strikes() {
    return (this.gameState as FaceOffGame).strikes;
  }

  get questions() {
    return (this.gameState as FastMoneyGame).questions;
  }

  get fastMoneyResponsesFirstTeam() {
    return (this.gameState as FastMoneyGame).responsesFirstTeam;
  }

  get fastMoneyResponsesSecondTeam() {
    return (this.gameState as FastMoneyGame).responsesSecondTeam;
  }

  toJson() {
    const serializableState = {
      id: this.id,
      mode: this.mode,
      modeStatus: this.modeStatus,
      teamNames: this.teamNames,
      teamsAndPoints: this.teamsAndPoints,
      team1Answers: this.team1Answers,
      team2Answers: this.team2Answers,
      status: this.status,
      question: this.question,
      questions: this.questions,
      isStolen: this.isStolen,
      buzzOrder: this.buzzOrder,
      currentTeam: this.currentTeam,
      inControlTeam: this.inControlTeam,
      strikes: this.strikes,
      fastMoneyResponsesFirstTeam: this.fastMoneyResponsesFirstTeam,
      fastMOneyResponsesSecondTeam: this.fastMoneyResponsesSecondTeam,
    };

    return serializableState;
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
      case "fast_money": {
        const firstTeamToAnswerIndex = this.teamsAndPoints.findIndex(
          (team) =>
            team.points ===
            Math.max(...this.teamsAndPoints.map((t) => t.points))
        );
        return {
          mode,
          modeStatus: "waiting_for_questions",
          questions: [],
          currentTeam: firstTeamToAnswerIndex + 1,
          responsesFirstTeam: undefined,
          responsesSecondTeam: undefined,
        } as FastMoneyGame;
      }
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

  hostPickedFastMoneyQuestions(questionTexts: string[]) {
    if (!this.validateGameStatus("fast_money", "waiting_for_questions")) {
      return;
    }

    if (!questionTexts.length || questionTexts.length !== 5) {
      throw new Error(
        "Invalid number of questions, Expected 5, got: " + questionTexts.length
      );
    }

    const questions = questionTexts.map((questionText) => {
      const stored = storedQuestions.find(
        ({ questionText: storedQuestionText }) =>
          storedQuestionText === questionText
      );
      if (!stored) {
        throw new Error(`Question not found: ${questionText}.`);
      }
      return {
        ...stored,
        answers: stored.answers.map((answer) => ({
          ...answer,
          revealed: false,
        })),
      };
    });

    this.updateGameState({
      questions,
      modeStatus: "questions_in_progress",
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
    if (!this.validateGameStatus("family_warm_up", "gathering_team_answers"))
      return;

    const question = this.question;
    if (!question) return;

    this.updateGameState({
      team1Answers,
      team2Answers,
      modeStatus: "revealing_stored_answers",
    });

    question.answers.forEach((_, index) => {
      setTimeout(() => {
        question.answers[index].revealed = true;
        this.io.to(this.id).emit("answerRevealed", { index });

        if (index === question.answers.length - 1) {
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

  awardPoints() {
    if (!this.validateGameStatus(["family_warm_up", "face_off"])) {
      return;
    }

    if (this.mode === "family_warm_up") {
      if (this.modeStatus !== "revealing_team_answers") {
        throw new Error(`Wrong modeStatus, got: ${this.modeStatus}`);
      }
      this.awardPointsFamilyWarmup();
      return;
    }

    if (this.modeStatus !== "revealing_stored_answers") {
      throw new Error(`Wrong modeStatus, got: ${this.modeStatus}`);
    }
    this.awardPointsFaceOff();
  }

  awardPointsFamilyWarmup() {
    const gameState = this.gameState as GameState & FamilyWarmUpGame;

    if (!gameState.team1Answers || !gameState.team2Answers) {
      throw new Error(
        `Team answers are missing. Team 1: ${gameState.team1Answers}, Team 2: ${gameState.team2Answers}`
      );
    }

    const { question, team1Answers, team2Answers } = this as FamilyWarmUpGame;
    if (!question || !team1Answers || !team2Answers) {
      throw new Error("Question or team answers is missing");
    }

    const calculatePoints = (teamAnswers: string[]) =>
      teamAnswers.reduce((total, answerText) => {
        const foundAnswer = question.answers.find(
          (a) => a.answerText === answerText
        );
        return total + (foundAnswer ? foundAnswer.points : 0);
      }, 0);

    const newTeamsAndPoints: TeamAndPoints[] = gameState.teamsAndPoints.map(
      (team, index) => ({
        ...team,
        points:
          team.points +
          calculatePoints(index === 0 ? team1Answers : team2Answers),
      })
    );

    this.updateGameState({
      teamsAndPoints: newTeamsAndPoints,
      modeStatus: "awarding_points",
    });
  }

  awardPointsFaceOff() {
    const { question, currentTeam, isStolen } = this;
    if (!question || !currentTeam) {
      throw new Error("Cannot award points: missing question or currentTeam");
    }

    const answers = question.answers as FaceOffGameAnswer[];
    const totalRevealedPoints = answers.reduce(
      (acc, answer) => acc + (answer.revealedByControlTeam ? answer.points : 0),
      0
    );

    const newTeamsAndPoints = [...this.teamsAndPoints];
    const teamToAward = isStolen ? getOpposingTeam(currentTeam) : currentTeam;

    newTeamsAndPoints[teamToAward - 1].points += totalRevealedPoints;

    this.updateGameState({
      teamsAndPoints: newTeamsAndPoints,
      modeStatus: "awarding_points",
    });
  }

  requestNewQuestion() {
    if (!this.mode || this.mode === "indeterminate") return;

    const newQuestionStateProps = this.getNewQuestionState(this.mode);
    this.updateGameState(newQuestionStateProps);
  }

  endGame() {
    this.updateGameState({
      status: "finished",
    });
  }

  private validateGameStatus(
    expectedModeOrModes: GameInProgress["mode"] | GameInProgress["mode"][],
    expectedStatusOrStatuses?: string | string[]
  ): boolean {
    if (this.status !== "in_progress") {
      throw new Error(`Game not in progress, got: ${this.status}`);
    }

    if (
      !this.mode ||
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
        this.modeStatus !== expectedStatusOrStatuses) ||
      (Array.isArray(expectedStatusOrStatuses) &&
        !expectedStatusOrStatuses.includes(this.modeStatus))
    ) {
      throw new Error(
        `Game mode not in expected status (${expectedStatusOrStatuses}), got: ${this.modeStatus}`
      );
    }

    return true;
  }

  submitBuzzInAnswer(team: 1 | 2, answerText: string) {
    if (
      !this.validateGameStatus("face_off", [
        "face_off_started",
        "getting_other_buzzed_in_answer",
      ])
    ) {
      return;
    }

    const game = this.gameState as Extract<GameState, { mode: "face_off" }>;

    if (!game.question || game.buzzOrder.includes(team)) return;

    const updatedBuzzOrder = [...game.buzzOrder, team];

    const answerIndex = getAnswerIndex(game.question.answers, answerText);
    const isCorrect = answerIndex !== -1;
    const isFirstBuzz = updatedBuzzOrder.length === 1;
    const nextStatus = isFirstBuzz
      ? "reveal_buzzed_in_answer"
      : "reveal_other_buzzed_in_answer";

    if (isCorrect) {
      const answer = game.question.answers[answerIndex];
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
      modeStatus: "getting_other_buzzed_in_answer",
    });
  }

  requestAskTeamToPlayOrPass() {
    if (
      !this.validateGameStatus("face_off", [
        "reveal_buzzed_in_answer",
        "reveal_other_buzzed_in_answer",
      ])
    ) {
      return;
    }

    this.updateGameState({
      modeStatus: "team_asked_to_play",
    });
  }

  receivedPlayOrPass(choice: "play" | "pass") {
    if (!this.validateGameStatus("face_off", ["team_asked_to_play"])) {
      return;
    }

    const typedState = this.gameState as FaceOffGame;
    if (!typedState.currentTeam) {
      throw new Error("No current team!");
    }

    let inControlTeam: 1 | 2;
    if (choice === "play") {
      inControlTeam = typedState.currentTeam;
    } else {
      inControlTeam = typedState.currentTeam === 1 ? 2 : 1;
    }

    this.updateGameState({
      inControlTeam,
      modeStatus: "in_control_team_guesses",
    });
  }

  receivedFaceOffAnswer(answerText: string) {
    if (!this.validateGameStatus("face_off", "in_control_team_guesses")) {
      return;
    }

    const game = this.gameState as FaceOffGame;
    if (!game.question) return;

    const answerIndex = getAnswerIndex(game.question.answers, answerText);
    const isCorrect = answerIndex !== -1;

    if (isCorrect) {
      const answer = game.question.answers[answerIndex];
      answer.revealed = true;
      answer.revealedByControlTeam = true;
      const allAnswersFound = game.question.answers.every(
        ({ revealedByControlTeam }) => revealedByControlTeam
      );
      const nextStatus = allAnswersFound
        ? "revealing_stored_answers"
        : "in_control_team_guesses";

      this.io.to(this.id).emit("answerRevealed", { index: answerIndex });

      setTimeout(() => {
        this.updateGameState({
          question: game.question,
          modeStatus: nextStatus,
        });
        this.io.to(this.id).emit("receivedGameState", this.toJson());
      }, 800);

      return;
    }

    const newStrikes = this.strikes + 1;
    this.io.to(this.id).emit("answerIncorrect", { strikes: newStrikes });
    const nextStatus =
      newStrikes === MAX_STRIKES
        ? "ask_other_team_for_guess_for_steal"
        : "in_control_team_guesses";

    this.updateGameState({
      strikes: newStrikes,
      modeStatus: nextStatus,
    });
    return true;
  }

  receivedStealAnswer(answerText: string) {
    if (
      !this.validateGameStatus("face_off", "ask_other_team_for_guess_for_steal")
    ) {
      return;
    }

    const game = this.gameState as FaceOffGame;
    if (!game.question) return;

    const answerIndex = getAnswerIndex(game.question.answers, answerText);
    const isCorrect = answerIndex !== -1;
    if (isCorrect) {
      const answer = game.question.answers[answerIndex];
      answer.revealed = true;
      answer.revealedByControlTeam = true;

      this.io.to(this.id).emit("answerRevealed", { index: answerIndex });

      setTimeout(() => {
        this.updateGameState({
          question: game.question,
          isStolen: true,
          modeStatus: "revealing_stored_answers",
        });
        this.io.to(this.id).emit("receivedGameState", this.toJson());
      }, 800);

      return;
    }

    this.io.to(this.id).emit("answerIncorrect", { strikes: 1 });

    this.updateGameState({
      modeStatus: "revealing_stored_answers",
    });
    return true;
  }

  private updateGameState(updates: Partial<GameState>) {
    if (!this.gameState) {
      return;
    }
    this.gameState = { ...this.gameState, ...updates } as GameState;
  }
}
