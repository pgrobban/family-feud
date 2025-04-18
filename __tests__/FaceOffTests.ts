import {
  faceOffScenarios,
  faceOffState,
  question,
} from "./helpers/faceOffFixtures";
import Game from "@/server/controllers/Game";
import {
  createMockSocketServerAndRoom,
  FaceOffScenario,
} from "./helpers/testHelpers";
import { getOpposingTeam } from "@/shared/utils";

const boardAnswers = question.answers.map((answer) => answer.answerText);

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

  const runScenario = (
    scenario: FaceOffScenario,
    keepPoints: boolean = false
  ) => {
    // Setup Face-Off question
    const updatedGameState = structuredClone(
      keepPoints
        ? {
            ...faceOffState,
            mode: "face_off" as const, // make ts happy
            teamsAndPoints: game.toJson().teamsAndPoints,
          }
        : faceOffState
    );

    // @ts-expect-error private method
    game.updateGameState(updatedGameState);
    game.hostPickedQuestionForCurrentMode(question.questionText);

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
    return game.toJson();
  };

  test.each(faceOffScenarios)("$name", (scenario) => {
    const result = runScenario(scenario);
    expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(result.modeStatus).toBe("awarding_points");
  });

  describe("Multiple consecutive scenarios", () => {
    test("Team 1 keeps answering correctly", () => {
      const scenario: FaceOffScenario = {
        name: "Team 1 keeps answering correctly",
        buzzedFirst: 1,
        firstAnswer: "apple",
        controlChoice: "play",
        controlGuesses: ["cherry", "strawberry", "raspberry"], // Team keeps clearing the board
        expectedPoints: [300, 0], // Team 1 should earn 100 points per answer, so 300 in total
      };

      let result = runScenario(scenario, true); // First game
      result = runScenario(scenario, true); // Second game
      result = runScenario(scenario, true); // Third game

      expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
      expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
      expect(result.modeStatus).toBe("awarding_points");
    });

    test("Team 1 answers correctly twice, Team 2 steals successfully", () => {
      const scenario: FaceOffScenario = {
        name: "Team 1 answers correctly twice, Team 2 steals successfully",
        buzzedFirst: 1,
        firstAnswer: "apple",
        controlChoice: "play",
        controlGuesses: ["cherry", "strawberry"], // Team 1 gets two correct
        stealAttempt: "raspberry", // Team 2 steals for 10 points
        expectedPoints: [0, 200],
      };

      let result = runScenario(scenario, true); // First game
      result = runScenario(scenario, true); // Second game

      expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
      expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
      expect(result.modeStatus).toBe("awarding_points");
    });

    test("Two games with each team winning once", () => {
      // First Game: Team 1 wins
      const scenario1: FaceOffScenario = {
        name: "Team 1 buzzes first, highest answer, chooses to play, clears board",
        buzzedFirst: 1,
        firstAnswer: "apple",
        controlChoice: "play",
        controlGuesses: ["cherry", "strawberry", "raspberry"], // Team 1 clears board
        expectedPoints: [100, 0], // Team 1 wins
      };

      // Second Game: Team 2 wins
      const scenario2: FaceOffScenario = {
        name: "Team 1 buzzes first, highest answer, chooses to play, fails, Team 2 steals successfully",
        buzzedFirst: 1,
        firstAnswer: "apple",
        controlChoice: "play",
        controlGuesses: ["grape", "banana", "orange"], // Team 1 fails
        stealAttempt: "cherry", // Team 2 steals successfully
        expectedPoints: [0, 70], // Team 2 wins
      };

      // Running the first game
      let result = runScenario(scenario1, true); // First game (Team 1 wins)
      expect(result.teamsAndPoints[0].points).toBe(100);
      expect(result.teamsAndPoints[1].points).toBe(0);
      expect(result.modeStatus).toBe("awarding_points");

      // Running the second game
      result = runScenario(scenario2, true); // Second game (Team 2 wins)
      expect(result.teamsAndPoints[0].points).toBe(100);
      expect(result.teamsAndPoints[1].points).toBe(70);
      expect(result.modeStatus).toBe("awarding_points");
    });
  });
});
