import Game from "@/server/controllers/Game";
import {
  createMockSocketServerAndRoom,
  FastMoneyScenario,
} from "./helpers/testHelpers";
import {
  FAST_MONEY_QUESTIONS,
  FAST_MONEY_WIN_THRESHOLD,
  getOpposingTeam,
} from "@/shared/utils";
import {
  fastMoneyScenarios,
  fastMoneyState,
} from "./helpers/fastMoneyFixtures";

describe.only("Fast money full paths", () => {
  let game: Game;

  beforeEach(() => {
    const { io, roomId } = createMockSocketServerAndRoom();
    // @ts-expect-error mock IO
    game = new Game(roomId, "testsocket", ["A", "B"], io);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const runScenario = (
    scenario: FastMoneyScenario,
    keepPoints: boolean = false
  ) => {
    const updatedGameState = structuredClone(
      keepPoints
        ? {
            ...fastMoneyState,
            mode: "face_off" as const, // make ts happy
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

  test.each(fastMoneyScenarios)("$name", (scenario) => {
    const result = runScenario(scenario);
    expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(result.modeStatus).toBe("awarding_points");
  });
});
