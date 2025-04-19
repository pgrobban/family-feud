import { FAST_MONEY_QUESTIONS } from "@/shared/utils";
import { FastMoneyScenario } from "./testHelpers";
import { question } from "./faceOffFixtures";

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
