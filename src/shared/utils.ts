import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./gameEventMap";
import type { StoredAnswer, TeamAndPoints } from "./types";

export const FAMILY_WARMUP_TIMER_SECONDS = 60;
export const FAST_MONEY_QUESTIONS = 5;
export const FAST_MONEY_TIMER_SECONDS = 25;

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
