import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./gameEventMap";
import type { GameAnswer, GameQuestion, StoredAnswer, StoredQuestion, TeamAndPoints } from "./types";

export const FAMILY_WARMUP_TIMER_SECONDS = 60;
export const FAST_MONEY_QUESTIONS = 5;
export const FAST_MONEY_TIMER_SECONDS = 25;
export const FAST_MONEY_STEAL_BONUS = 50;

export const isSocketDefined = (
  s: Socket | null
): s is Socket<ClientToServerEvents & ServerToClientEvents> => s !== null;

export const getOpposingTeam = (team: 1 | 2) => (team === 1 ? 2 : 1);

export const getAnswerIndex = (answers: StoredAnswer[], answerText: string) =>
  answers.findIndex(
    (a) => a.answerText.toLowerCase() === answerText.toLowerCase()
  );

export const getSortedTeamNames = (teamsAndPoints: TeamAndPoints[]) => {
  const leadingTeamIndex = teamsAndPoints.findIndex(
    (team) => team.points === Math.max(...teamsAndPoints.map((t) => t.points))
  );
  const opposingTeamIndex =
    getOpposingTeam((leadingTeamIndex + 1) as 1 | 2) - 1;
  return {
    first: teamsAndPoints[leadingTeamIndex].teamName,
    second: teamsAndPoints[opposingTeamIndex].teamName,
  };
};

export const getFastMoneyStealPoints = (questions: GameQuestion[], responses: GameAnswer[]) => {
  for (let i = 0; i < questions.length; i++) {
    if (!responses[i]?.answerText) continue;

    const isHighest = questions[i].answers[0].answerText.toLowerCase() === responses[i].answerText.toLowerCase();

    return {
      isHighest,
      points: responses[i].points
    }
  }

  return {
    isHighest: false,
    points: 0
  }

}
