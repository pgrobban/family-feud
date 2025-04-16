import type {
  BaseGameState,
  FamilyWarmUpGame,
  GameInProgress,
  GameState,
  TeamAndPoints,
} from "@/shared/types";
import { BaseMode } from "./BaseMode";

export class FamilyWarmUpMode extends BaseMode<
  BaseGameState & FamilyWarmUpGame
> {
  initialize(): GameState & FamilyWarmUpGame {

    const initialState: BaseGameState & FamilyWarmUpGame = {
      ...this.gameState,
      id: this.gameState.id,
      teamNames: this.gameState.teamNames,
      teamsAndPoints: this.gameState.teamsAndPoints,
      status: "in_progress",
      mode: "family_warm_up",
      modeStatus: "waiting_for_question",
      team1Answers: [],
      team2Answers: [],
      question: null,
    };

    return initialState; // Return the correctly combined state
  }

  getType() {
    return "family_warm_up";
  }

  hostRequestedTeamAnswers() {
    console.log("Before:", this.gameState);
    this.updateGameState({ modeStatus: "gathering_team_answers" });
    console.log("After:", this.gameState);
  }

  revealTeamAnswers() {
    const question = this.gameState.question;
    if (!question) throw new Error("No question selected");

    const updatedAnswers = question.answers.map((a) => ({
      ...a,
      revealed: true,
    }));

    this.patchState({
      question: {
        ...question,
        answers: updatedAnswers,
      },
      modeStatus: "revealing_team_answers",
    });
  }

  gatheredAnswers(team1Answers: string[], team2Answers: string[]) {
    const question = this.gameState.question;
    if (!question) throw new Error("No question selected");

    this.patchState({
      team1Answers,
      team2Answers,
      modeStatus: "revealing_stored_answers",
    });

    question.answers.forEach((_, index) => {
      setTimeout(() => {
        question.answers[index].answerRevealed = true;
        question.answers[index].pointsRevealed = true;

        this.emit("answerRevealed", { index });

        if (index === question.answers.length - 1) {
          setTimeout(() => {
            this.emit("receivedGameState", this.gameState);
          }, 500);
        }
      }, index * 800);
    });
  }

  awardPoints() {
    const gameState = this.gameState as GameState & FamilyWarmUpGame;

    if (!gameState.team1Answers || !gameState.team2Answers) {
      throw new Error(
        `Team answers are missing. Team 1: ${gameState.team1Answers}, Team 2: ${gameState.team2Answers}`
      );
    }

    const { question, team1Answers, team2Answers } = this.gameState;
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

  toJson(): GameState {
    const base = this.toJsonBase() as BaseGameState & { status: "in_progress"; mode: "family_warm_up"; modeStatus: FamilyWarmUpGame["modeStatus"] };

    return {
      ...base,
      modeStatus: this.gameState.modeStatus as FamilyWarmUpGame["modeStatus"],
      question: this.gameState.question ?? null,
      team1Answers: this.gameState.team1Answers,
      team2Answers: this.gameState.team2Answers,
    };
  }
}
