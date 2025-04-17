import type {
  BaseGameState,
  FaceOffGameAnswer,
  FaceOffGameState,
  FamilyWarmUpGameState,
  FastMoneyAnswer,
  FastMoneyGameState,
  GameQuestion,
  GameState,
  IndeterminateGameState,
  Mode,
  StoredQuestion,
  TeamAndPoints,
} from "@/shared/types";
import questions from "@/shared/questions.json";
import type { Server } from "socket.io";
import {
  FAST_MONEY_QUESTIONS,
  FAST_MONEY_STEAL_BONUS,
  getAnswerIndex,
  getFastMoneyStealPoints,
  getOpposingTeam,
  getPointsSum,
  MAX_FACE_OFF_STRIKES,
} from "@/shared/utils";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  ToTeam,
} from "@/shared/gameEventMap";

const storedQuestions: StoredQuestion[] = questions;

function isFamilyWarmUpGame(
  gameState: GameState
): gameState is FamilyWarmUpGameState {
  return gameState.mode === "family_warm_up";
}

function isFaceOffGame(gameState: GameState): gameState is FaceOffGameState {
  return gameState.mode === "face_off";
}

function isFastMoneyGame(
  gameState: GameState
): gameState is FastMoneyGameState {
  return gameState.mode === "fast_money";
}

export default class Game {
  public id: string;
  private gameState: GameState;
  private playerSocketIds: string[] = [];
  private hostSocketIds: string[] = [];
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(id: string, socketId: string, teamNames: string[], io: Server) {
    this.id = id;
    this.playerSocketIds = [socketId];
    this.io = io;

    this.gameState = {
      id,
      teamNames,
      teamsAndPoints: teamNames.map((teamName) => ({ teamName, points: 0 })),
      status: "waiting_for_host",
      mode: "indeterminate",
      modeStatus: null,
    };
  }

  get mode() {
    return this.gameState.mode;
  }

  get question() {
    if (isFamilyWarmUpGame(this.gameState)) {
      return (this.gameState as FamilyWarmUpGameState).question;
    }
    if (isFaceOffGame(this.gameState)) {
      return (this.gameState as FaceOffGameState).question;
    }

    return undefined;
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
    return (this.gameState as FamilyWarmUpGameState).team1Answers;
  }

  get team2Answers() {
    return (this.gameState as FamilyWarmUpGameState).team2Answers;
  }

  get currentTeam() {
    return (this.gameState as FaceOffGameState | FastMoneyGameState)
      .currentTeam;
  }

  get inControlTeam() {
    return (this.gameState as FaceOffGameState).inControlTeam;
  }

  get buzzOrder() {
    return (this.gameState as FaceOffGameState).buzzOrder;
  }

  get isStolen() {
    return (this.gameState as FaceOffGameState).isStolen;
  }

  get strikes() {
    return (this.gameState as FaceOffGameState).strikes;
  }

  get questions() {
    return (this.gameState as FastMoneyGameState).questions;
  }

  get fastMoneyResponsesFirstTeam() {
    return (this.gameState as FastMoneyGameState).responsesFirstTeam;
  }

  get fastMoneyResponsesSecondTeam() {
    return (this.gameState as FastMoneyGameState).responsesSecondTeam;
  }

  toJson() {
    if (isFamilyWarmUpGame(this.gameState)) {
      return this.gameState as FamilyWarmUpGameState;
    }

    if (isFaceOffGame(this.gameState)) {
      return this.gameState as FaceOffGameState;
    }

    if (isFastMoneyGame(this.gameState)) {
      return this.gameState as FastMoneyGameState;
    }
    return this.gameState as IndeterminateGameState;
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

    if (this.status === "waiting_for_host") {
      this.updateGameState({
        status: "in_progress",
        mode: "indeterminate",
      });
    }
  }

  hostPickedMode(mode: Exclude<BaseGameState["mode"], "indeterminate">) {
    if (!this.validateGameStatus("indeterminate")) {
      return;
    }

    const stateProps = this.getNewQuestionState(mode);
    this.updateGameState({ ...stateProps, status: "in_progress" });
  }

  private getNewQuestionState(
    mode: Exclude<BaseGameState["mode"], "indeterminate">
  ) {
    switch (mode) {
      case "family_warm_up":
        return {
          ...this.gameState,
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          team1Answers: [],
          team2Answers: [],
        } as FamilyWarmUpGameState;
      case "face_off":
        return {
          ...this.gameState,
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          buzzOrder: [],
          isStolen: false,
          strikes: 0,
          currentTeam: null,
          inControlTeam: null,
        } as FaceOffGameState;
      case "fast_money": {
        const firstTeamToAnswerIndex = this.teamsAndPoints.findIndex(
          (team) =>
            team.points ===
            Math.max(...this.teamsAndPoints.map((t) => t.points))
        );
        return {
          ...this.gameState,
          mode,
          modeStatus: "waiting_for_questions",
          questions: [],
          currentTeam: firstTeamToAnswerIndex + 1,
        } as FastMoneyGameState;
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
        answerRevealed: false,
        pointsRevealed: false,
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

    if (
      !questionTexts.length ||
      questionTexts.length !== FAST_MONEY_QUESTIONS
    ) {
      throw new Error(
        `Invalid number of questions, Expected ${FAST_MONEY_QUESTIONS} got: ${questionTexts.length}`
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
          answerRevealed: false,
          pointsRevealed: false,
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

    const typedState = this.gameState as FamilyWarmUpGameState;

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
    if (!isFamilyWarmUpGame(this.gameState)) return;

    if (!this.validateGameStatus("family_warm_up", "gathering_team_answers"))
      return;

    const question = this.gameState.question;
    if (!question) return;

    this.updateGameState({
      team1Answers,
      team2Answers,
      modeStatus: "revealing_stored_answers",
    });

    question.answers.forEach((_, index) => {
      setTimeout(() => {
        question.answers[index].answerRevealed = true;

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

  awardPointsFamilyWarmup() {
    if (!this.validateGameStatus("family_warm_up", "revealing_team_answers")) {
      return;
    }

    const gameState = this.gameState as FamilyWarmUpGameState;

    if (!gameState.team1Answers || !gameState.team2Answers) {
      throw new Error(
        `Team answers are missing. Team 1: ${gameState.team1Answers}, Team 2: ${gameState.team2Answers}`
      );
    }

    const { question, team1Answers, team2Answers } = gameState;
    if (!question) return;

    const newTeamsAndPoints: TeamAndPoints[] = gameState.teamsAndPoints.map(
      (team, index) => ({
        ...team,
        points:
          team.points +
          getPointsSum(question, index === 0 ? team1Answers : team2Answers),
      })
    );

    this.updateGameState({
      teamsAndPoints: newTeamsAndPoints,
      modeStatus: "awarding_points",
    });
  }

  awardPointsFaceOff() {
    if (!this.validateGameStatus("face_off", "revealing_stored_answers")) {
      return;
    }

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

  awardPointsFastMoney() {
    if (
      !this.validateGameStatus("fast_money", [
        "revealing_answers",
        "reveal_steal_question_and_answer",
      ])
    ) {
      return;
    }

    if (
      !this.fastMoneyResponsesFirstTeam ||
      !this.currentTeam ||
      !this.questions ||
      !this.fastMoneyResponsesSecondTeam
    )
      return;

    const firstTeamPoints = this.fastMoneyResponsesFirstTeam.reduce(
      (acc, response) => acc + response.points,
      0
    );

    const stolenPoints = getFastMoneyStealPoints(
      this.questions,
      this.fastMoneyResponsesSecondTeam
    );
    const pointsToAward =
      firstTeamPoints +
      (stolenPoints.isHighest
        ? stolenPoints.points + FAST_MONEY_STEAL_BONUS
        : 0);

    const newTeamsAndPoints = [...this.teamsAndPoints];

    newTeamsAndPoints[this.currentTeam - 1].points += pointsToAward;
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
    expectedModeOrModes: Mode | Mode[],
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
      answer.answerRevealed = true;
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
      currentTeam: this.currentTeam === 1 ? 2 : 1,
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

    const typedState = this.gameState as FaceOffGameState;
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

    const game = this.gameState as FaceOffGameState;
    if (!game.question) return;

    const answerIndex = getAnswerIndex(game.question.answers, answerText);
    const isCorrect = answerIndex !== -1;

    if (isCorrect) {
      const answer = game.question.answers[answerIndex];
      answer.answerRevealed = true;
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
      newStrikes === MAX_FACE_OFF_STRIKES
        ? "ask_other_team_for_guess_for_steal"
        : "in_control_team_guesses";

    this.updateGameState({
      strikes: newStrikes,
      modeStatus: nextStatus as FaceOffGameState["modeStatus"],
    });
    return true;
  }

  receivedStealAnswer(answerText: string) {
    if (
      !this.validateGameStatus("face_off", "ask_other_team_for_guess_for_steal")
    ) {
      return;
    }

    const game = this.gameState as FaceOffGameState;
    if (!game.question) return;

    const answerIndex = getAnswerIndex(game.question.answers, answerText);
    const isCorrect = answerIndex !== -1;
    if (isCorrect) {
      const answer = game.question.answers[answerIndex];
      answer.answerRevealed = true;
      answer.revealedByControlTeam = true;

      this.io.to(this.id).emit("answerRevealed", { index: answerIndex });

      setTimeout(() => {
        this.updateGameState({
          question: game.question,
          isStolen: true,
          modeStatus:
            "revealing_steal_answer" as FaceOffGameState["modeStatus"],
        });
        this.io.to(this.id).emit("receivedGameState", this.toJson());
      }, 800);

      return;
    }

    this.io.to(this.id).emit("answerIncorrect", { strikes: 1 });

    this.updateGameState({
      modeStatus: "revealing_steal_answer" as FaceOffGameState["modeStatus"],
    });
    return true;
  }

  revealStoredAnswers() {
    if (!this.validateGameStatus("face_off", "revealing_steal_answer")) {
      return;
    }
    const question = this.question;
    if (!question) return;

    question.answers.forEach((_, index) => {
      setTimeout(() => {
        question.answers[index].answerRevealed = true;

        this.io.to(this.id).emit("answerRevealed", { index });

        if (index === question.answers.length - 1) {
          setTimeout(() => {
            this.io.to(this.id).emit("receivedGameState", this.toJson());
          }, 500);
        }
      }, index * 800);
    });

    this.updateGameState({
      modeStatus: "revealing_stored_answers",
    });
  }

  receivedFastMoneyResponses(responses: string[]) {
    if (!this.validateGameStatus("fast_money", "questions_in_progress")) {
      return;
    }

    const game = this.gameState as FastMoneyGameState;
    const { questions } = game;

    if (!questions) return;

    const responsesWithPoints = responses.map((response, index) => {
      const question = questions[index];

      const answerIndex = getAnswerIndex(question.answers, response);
      if (answerIndex !== -1) {
        return {
          answerText: question.answers[answerIndex].answerText,
          points: question.answers[answerIndex].points,
          answerRevealed: false,
          pointsRevealed: false,
          isTopAnswer: question.answers[0].answerText.toLowerCase() === response.toLowerCase()
        };
      }
      return {
        answerText: response,
        points: 0,
        answerRevealed: false,
        pointsRevealed: false,
        isTopAnswer: false
      };
    });

    this.updateGameState({
      responsesFirstTeam: responsesWithPoints,
      modeStatus: "revealing_answers",
    });
  }

  requestedFastMoneyAnswerReveal(
    answerIndex: number,
    to: "playing_team" | "stealing_team"
  ) {
    if (!this.validateGameStatus("fast_money", "revealing_answers")) {
      return;
    }

    const responses: FastMoneyAnswer[] | undefined =
      to === "playing_team"
        ? this.fastMoneyResponsesFirstTeam
        : this.fastMoneyResponsesSecondTeam;

    if (!responses) {
      throw new Error(`No responses for team ${to}`);
    }

    const updatedResponses = [...responses];
    updatedResponses[answerIndex].answerRevealed = true;

    this.updateGameState(
      to === "playing_team"
        ? { responsesFirstTeam: updatedResponses }
        : { responsesSecondTeam: updatedResponses }
    );

    this.io.to(this.id).emit("fastMoney:answerRevealed", answerIndex, to);

    setTimeout(() => {
      this.io.to(this.id).emit("receivedGameState", this.toJson());
    }, 500);
  }

  requestedFastMoneyPointsReveal(answerIndex: number, to: ToTeam) {
    if (
      !this.validateGameStatus("fast_money", [
        "revealing_answers",
        "received_steal_question_and_answer",
      ])
    ) {
      return;
    }

    const responses =
      to === "playing_team"
        ? this.fastMoneyResponsesFirstTeam
        : this.fastMoneyResponsesSecondTeam;

    if (!responses) {
      throw new Error(`No responses for team ${to}`);
    }

    const updatedResponses = [...responses];
    updatedResponses[answerIndex].pointsRevealed = true;

    this.updateGameState(
      to === "playing_team"
        ? { responsesFirstTeam: updatedResponses }
        : { responsesSecondTeam: updatedResponses }
    );

    this.io.to(this.id).emit("fastMoney:pointsRevealed", answerIndex, to);

    setTimeout(() => {
      this.io.to(this.id).emit("receivedGameState", this.toJson());
    }, 500);
  }

  requestedFastMoneyStealQuestionAndAnswer() {
    if (!this.validateGameStatus("fast_money", "revealing_answers")) {
      return;
    }

    if (!this.currentTeam) return;

    this.updateGameState({
      currentTeam: getOpposingTeam(this.currentTeam),
      modeStatus:
        "request_steal_question_and_answer" as FastMoneyGameState["modeStatus"],
    });
  }

  receivedFastMoneyStealQuestionAndAnswer(
    questionText: string,
    answerText: string
  ) {
    if (
      !this.validateGameStatus(
        "fast_money",
        "request_steal_question_and_answer"
      )
    ) {
      return;
    }

    const { questions } = this.gameState as FastMoneyGameState;
    if (!questions) return;

    const questionIndex = questions.findIndex(
      (question) => question.questionText === questionText
    );

    if (questionIndex === -1) return;

    const foundAnswerIndex = questions[questionIndex].answers.findIndex(
      (answer) => answer.answerText === answerText
    );
    const storedAnswer =
      questions[questionIndex].answers[foundAnswerIndex];

    const newResponsesSecondTeam = new Array<FastMoneyAnswer>(
      questions.length
    ).fill({
      answerText: "",
      points: 0,
      answerRevealed: false,
      pointsRevealed: false,
      isTopAnswer: false
    });

    newResponsesSecondTeam[questionIndex] = {
      answerText:
        foundAnswerIndex !== -1 ? storedAnswer.answerText : answerText,
      points: foundAnswerIndex !== -1 ? storedAnswer.points : 0,
      answerRevealed: true,
      pointsRevealed: true,
      isTopAnswer: questions[questionIndex].answers[0].answerText.toLowerCase() === answerText.toLowerCase()
    };

    this.updateGameState({
      responsesSecondTeam: newResponsesSecondTeam,
      modeStatus:
        "received_steal_question_and_answer" as FastMoneyGameState["modeStatus"],
    });
  }

  requestedRevealFastMoneyStealQuestionAndAnswer() {
    if (
      !this.validateGameStatus(
        "fast_money",
        "received_steal_question_and_answer"
      )
    ) {
      return;
    }

    if (!this.fastMoneyResponsesSecondTeam) return;

    const newResponsesSecondTeam = [...this.fastMoneyResponsesSecondTeam];
    const answerIndex = newResponsesSecondTeam.findIndex(
      (answer) => answer.answerText !== ""
    );
    newResponsesSecondTeam[answerIndex].answerRevealed = true;
    newResponsesSecondTeam[answerIndex].pointsRevealed = true;

    this.updateGameState({
      responsesSecondTeam: newResponsesSecondTeam,
      modeStatus:
        "reveal_steal_question_and_answer" as FastMoneyGameState["modeStatus"],
    });

    this.io
      .to(this.id)
      .emit("fastMoney:answerRevealed", answerIndex, "stealing_team");
    setTimeout(() => {
      this.io
        .to(this.id)
        .emit("fastMoney:pointsRevealed", answerIndex, "stealing_team");
    }, 1000);

    setTimeout(() => {
      this.io.to(this.id).emit("receivedGameState", this.toJson());
    }, 2000);
  }

  private updateGameState(updates: Partial<GameState>) {
    if (!this.gameState) {
      return;
    }
    this.gameState = { ...this.gameState, ...updates } as GameState;
  }
}
