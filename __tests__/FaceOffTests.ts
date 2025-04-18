import { faceOffScenarios, faceOffState } from "./helpers/faceOffFixtures";
import Game from "@/server/controllers/Game";
import { createMockSocketServerAndRoom } from "./helpers/testHelpers";
import { getOpposingTeam } from "@/shared/utils";

describe("Face-Off full paths", () => {
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

  test.each(faceOffScenarios)("$name", (scenario) => {
    // Setup Face-Off question
    // @ts-expect-error private method
    game.updateGameState(structuredClone(faceOffState));

    const boardAnswers = ["apple", "cherry", "strawberry", "raspberry"];
    const unrevealedAtStart = new Set(boardAnswers);

    // Buzz in
    game.submitBuzzInAnswer(scenario.buzzedFirst, scenario.firstAnswer);
    if (boardAnswers.includes(scenario.firstAnswer)) {
      unrevealedAtStart.delete(scenario.firstAnswer);
    }

    jest.runAllTimers();

    if (scenario.firstAnswer === boardAnswers[0]) {
      // highest answer
      game.requestAskTeamToPlayOrPass();
    } else {
      game.requestOtherTeamToBuzzInAnswer();
      if (!scenario.secondAnswer) {
        throw new Error(`Scenario needs second buzz in answer!`);
      }

      game.submitBuzzInAnswer(
        getOpposingTeam(scenario.buzzedFirst),
        scenario.secondAnswer
      );
      jest.runAllTimers();
      game.requestAskTeamToPlayOrPass();
    }

    game.receivedPlayOrPass(scenario.controlChoice);

    // Simulate control team guesses
    for (const guess of scenario.controlGuesses) {
      game.receivedFaceOffAnswer(guess);
      jest.runAllTimers();
      unrevealedAtStart.delete(guess);
      if (unrevealedAtStart.size === 0) break; // all correct
    }

    if (unrevealedAtStart.size === 0) {
      // board was cleared
      // @ts-expect-error bypass for test
      game.updateGameState({ modeStatus: "revealing_stored_answers" });
      game.revealStoredAnswers();
      game.awardPointsFaceOff();
    } else {
      // 3 strikes
      // @ts-expect-error bypass for test
      game.updateGameState({
        modeStatus: "ask_other_team_for_guess_for_steal",
      });

      game.receivedStealAnswer(scenario.stealAttempt ?? "wrong answer");

      jest.runAllTimers();
      game.revealStoredAnswers();
      game.awardPointsFaceOff();
    }

    const final = game.toJson();
    expect(final.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(final.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(final.modeStatus).toBe("awarding_points");
  });
});
