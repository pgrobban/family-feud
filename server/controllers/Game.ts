import type { GameEventMap } from "@/shared/gameEventMap";
import type {
  Answer,
  FaceOffGame,
  FamilyWarmUpGame,
  FastMoneyGame,
  GameInProgress,
  GameState,
  TeamAndPoints,
} from "@/shared/types";
import { EventEmitter } from "node:events";

export default class Game {
  public id: string;
  private _gameState: GameState;
  private gameEvents: EventEmitter<GameEventMap> =
    new EventEmitter<GameEventMap>();
  private playerSocketIds: string[] = [];
  private hostSocketIds: string[] = [];

  constructor(id: string, socketId: string, teamNames: string[]) {
    this.id = id;
    this.playerSocketIds = [socketId];

    this._gameState = {
      teamsAndPoints: teamNames.map((teamName) => ({ teamName, points: 0 })),
      status: "waiting_for_host",
    };
    this.gameEvents = new EventEmitter<GameEventMap>();
  }

  get mode() {
    if (!this._gameState) throw new Error("Game not created yet");
    // @ts-expect-error TODO
    return (this as GameInProgress)._gameState.mode;
  }

  get gameState() {
    return this._gameState;
  }

  get teamNames() {
    return this._gameState.teamsAndPoints.map((team) => team.teamName);
  }
  get teamsAndPoints() {
    return this._gameState.teamsAndPoints;
  }

  get status() {
    return this._gameState.status;
  }

  toJson() {
    return {
      id: this.id,
      mode: this.mode,
      teamNames: this.teamNames,
      teamsAndPoints: this.teamsAndPoints,
      status: this.status,
      playerSocketIds: this.playerSocketIds,
      hostSocketIds: this.hostSocketIds
    }
  }

  getPlayerSocketIds() {
    return this.playerSocketIds;
  }
  getHostSocketIds() {
    return this.hostSocketIds;
  }

  createGame(teamNames: string[]) {
    this._gameState = {
      teamsAndPoints: teamNames.map((teamName) => ({ teamName, points: 0 })),
      status: "waiting_for_host",
    };
    //    this.playerSocketIds.push(socketId);
    this.gameEvents.emit("gameCreated", this.gameState);
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
    })
    this.gameEvents.emit("hostJoined", this.gameState);
  }

  hostPickedMode<T extends Exclude<GameInProgress["mode"], "indeterminate">>(
    mode: T
  ) {
    if (!this.validateGameStatus("indeterminate", "waiting_for_host")) {
      return;
    }

    let modeProps: Omit<GameInProgress, "status">;

    switch (mode) {
      case "family_warm_up":
        modeProps = {
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          answers: [],
          currentTeam: 0,
        } as FamilyWarmUpGame;
        break;
      case "face_off":
        modeProps = {
          mode,
          modeStatus: "waiting_for_question",
          question: null,
          answers: [],
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
    this.gameEvents.emit("modePicked", this.gameState);
  }

  hostPickedQuestion(
    question: string,
    answers: Pick<Answer, "answerText" | "points">[]
  ) {
    if (!this.validateGameStatus("family_warm_up", "waiting_for_question")) {
      return;
    }

    this.updateGameState({
      question,
      modeStatus: "question_in_progress",
      answers: answers.map((answer) => ({ ...answer, revealed: false })),
    });

    this.gameEvents.emit("questionPicked", this.gameState);
  }

  revealAnswersFamilyWarmup() {
    if (!this.validateGameStatus("family_warm_up", "question_in_progress")) {
      return;
    }

    this.updateGameState({
      answers: (this.gameState as FamilyWarmUpGame).answers.map((answer) => ({
        ...answer,
        revealed: true,
      })),
      modeStatus: "revealing_answers",
    });

    this.gameEvents.emit("answersRevealed", this.gameState);
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

    this.gameEvents.emit("teamAnswersGathered", this.gameState);
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

    const calculatePoints = (teamAnswers: string[]) =>
      teamAnswers.reduce((total, answerText) => {
        const foundAnswer = gameState.answers.find(
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

    this.gameEvents.emit("pointsAwarded", this.gameState);
  }

  private validateGameStatus(
    expectedMode: GameInProgress["mode"],
    expectedStatus: string
  ): boolean {
    if (!this.gameState || this.gameState.status !== "in_progress") {
      throw new Error(`Game not in progress, got: ${this.gameState?.status}`);
    }

    if (!("mode" in this.gameState) || this.gameState.mode !== expectedMode) {
      throw new Error(
        `Wrong game mode, expected ${expectedMode}, got: ${this.gameState.mode}`
      );
    }

    if (
      !("modeStatus" in this.gameState) ||
      this.gameState.modeStatus !== expectedStatus
    ) {
      throw new Error(
        // @ts-expect-error aaa
        `Game mode not in expected state (${expectedStatus}), got: ${this.gameState.modeStatus}`
      );
    }

    return true;
  }

  private updateGameState(updates: Partial<GameState>) {
    if (!this.gameState) return;
    this._gameState = { ...this.gameState, ...updates } as GameState;
  }
}
