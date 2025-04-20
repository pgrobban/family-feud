import { FAST_MONEY_QUESTIONS, FAST_MONEY_WIN_THRESHOLD } from "@/shared/utils";
import { FastMoneyScenario } from "./testHelpers";
import { question } from "./faceOffFixtures";
import Game from "@/server/controllers/Game";

export const fastMoneyState = {
  mode: "fast_money",
  status: "in_progress",
  modeStatus: "waiting_for_questions",
};

export const fastMoneyScenarios: FastMoneyScenario[] = [
  {
    name: "team 1 plays, gets over 150 points",
    questionTexts: new Array(FAST_MONEY_QUESTIONS).fill(question.questionText),
    answerTexts: new Array(FAST_MONEY_QUESTIONS).fill(
      question.answers[0].answerText
    ),
    expectedPoints: [200, 0], // 40 * 5 = 200
  },
  {
    name: "team 1 plays, doesn't get over 150. team 2 steals with highest answer.",
    questionTexts: new Array(FAST_MONEY_QUESTIONS).fill(question.questionText),
    answerTexts: new Array(FAST_MONEY_QUESTIONS).fill(
      question.answers[2].answerText
    ),
    stealQuestionText: question.questionText,
    stealAnswerText: question.answers[0].answerText, // 20 * 5 from first team + 40 for steal answer + 50 for highest = 190
    expectedPoints: [0, 190],
  },
  {
    name: "team 1 plays, doesn't get over 150. team 2 steals but doesn't get highest answer.",
    questionTexts: new Array(FAST_MONEY_QUESTIONS).fill(question.questionText),
    answerTexts: new Array(FAST_MONEY_QUESTIONS).fill(
      question.answers[2].answerText
    ),
    stealQuestionText: question.questionText,
    stealAnswerText: question.answers[3].answerText, // 20 * 5 from first team
    expectedPoints: [100, 0],
  },
];

export const runFastMoneyScenario = (
  game: Game,
  scenario: FastMoneyScenario,
  keepPoints: boolean = false
) => {
  const updatedGameState = structuredClone(
    keepPoints
      ? {
          ...fastMoneyState,
          mode: "fast_money",
          teamsAndPoints: game.toJson().teamsAndPoints,
        }
      : fastMoneyState
  );
  // @ts-expect-error private method
  game.updateGameState(updatedGameState);
  game.hostPickedFastMoneyQuestions(scenario.questionTexts);

  game.receivedFastMoneyResponses(scenario.answerTexts);
  for (let i = 0; i < FAST_MONEY_QUESTIONS; i++) {
    game.requestedFastMoneyAnswerReveal(i, "playing_team");
  }
  jest.runAllTimers();
  const firstTeamPointsSum =
    game.fastMoneyResponsesFirstTeam?.reduce(
      (acc, { points }) => acc + points,
      0
    ) || 0;
  if (firstTeamPointsSum >= FAST_MONEY_WIN_THRESHOLD) {
    for (let i = 0; i < FAST_MONEY_QUESTIONS; i++) {
      game.requestedFastMoneyPointsReveal(i, "playing_team");
    }
    jest.runAllTimers();
  } else {
    if (!scenario.stealQuestionText || !scenario.stealAnswerText) {
      throw new Error("No steal question or answer");
    }

    game.requestedFastMoneyStealQuestionAndAnswer();
    game.receivedFastMoneyStealQuestionAndAnswer(
      scenario.stealQuestionText,
      scenario.stealAnswerText
    );
    game.requestedRevealFastMoneyStealQuestionAndAnswer();
  }
  jest.runAllTimers();
  game.awardPointsFastMoney();

  return game.toJson();
};
