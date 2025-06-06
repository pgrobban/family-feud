import type { Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./gameEventMap";
import type {
  GameAnswer,
  GameQuestion,
  StoredAnswer,
  TeamAndPoints,
} from "./types";

export const FAMILY_WARMUP_QUESTIONS = 3;
export const FAMILY_WARMUP_TIMER_SECONDS = 60;
export const MAX_FACE_OFF_STRIKES = 3;
export const FAST_MONEY_QUESTIONS = 5;
export const FAST_MONEY_WIN_THRESHOLD = 150;
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

export const getSortedTeamIndexes = (teamsAndPoints: TeamAndPoints[]) => {
  const leadingTeamIndex = teamsAndPoints.findIndex(
    (team) => team.points === Math.max(...teamsAndPoints.map((t) => t.points))
  );
  const opposingTeamIndex =
    getOpposingTeam((leadingTeamIndex + 1) as 1 | 2) - 1;
  return {
    first: leadingTeamIndex,
    second: opposingTeamIndex,
  };
};

export const getSortedTeamNames = (teamsAndPoints: TeamAndPoints[]) => {
  const indexes = getSortedTeamIndexes(teamsAndPoints);
  return {
    first: teamsAndPoints[indexes.first].teamName,
    second: teamsAndPoints[indexes.second].teamName,
  };
};

export const getPointsSum = (question: GameQuestion, answers: string[]) =>
  answers.reduce((total, answer) => {
    const foundAnswer = question.answers.find(
      (a) => a.answerText.toLowerCase() === answer.toLowerCase()
    );
    return total + (foundAnswer ? foundAnswer.points : 0);
  }, 0);

export const getFastMoneyStealPoints = (
  questions: GameQuestion[],
  stealResponses: GameAnswer[]
) => {
  for (let i = 0; i < questions.length; i++) {
    if (!stealResponses[i].answerText) continue;

    const isHighest =
      questions[i].answers[0].answerText.toLowerCase() ===
      stealResponses[i].answerText.toLowerCase();

    return {
      isHighest,
      points: stealResponses[i].points,
    };
  }

  return {
    isHighest: false,
    points: 0,
  };
};
