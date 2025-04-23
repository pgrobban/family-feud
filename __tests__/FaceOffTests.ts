import {
  faceOffScenarios,
  runFaceOffScenario,
} from "./helpers/faceOffFixtures";
import Game from "@/server/controllers/Game";
import {
  createMockSocketServerAndRoom,
  FaceOffScenario,
} from "./helpers/testHelpers";

describe("Face-Off full paths", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test.each(faceOffScenarios)("$name", (scenario) => {
    const { io, roomId } = createMockSocketServerAndRoom();
    // @ts-expect-error mock io
    const game = new Game(roomId, "testsocket", ["A", "B"], io);

    const result = runFaceOffScenario(game, scenario);
    expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(result.modeStatus).toBe("awarding_points");
  });

  describe("Multiple consecutive scenarios", () => {
    test("Team 1 keeps answering correctly", () => {
      const { io, roomId } = createMockSocketServerAndRoom();
      // @ts-expect-error mock io
      const game = new Game(roomId, "testsocket", ["A", "B"], io);

      const scenario: FaceOffScenario = {
        name: "Team 1 keeps answering correctly",
        buzzedFirst: 1,
        firstAnswer: "apple",
        controlChoice: "play",
        controlGuesses: ["cherry", "strawberry", "raspberry"], // Team keeps clearing the board
        expectedPoints: [300, 0], // Team 1 should earn 100 points per answer, so 300 in total
      };

      let result = runFaceOffScenario(game, scenario, true); // First game
      result = runFaceOffScenario(game, scenario, true); // Second game
      result = runFaceOffScenario(game, scenario, true); // Third game

      expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
      expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
      expect(result.modeStatus).toBe("awarding_points");
    });

    test("Team 1 answers correctly twice, Team 2 steals successfully", () => {
      const { io, roomId } = createMockSocketServerAndRoom();
      // @ts-expect-error mock io
      const game = new Game(roomId, "testsocket", ["A", "B"], io);

      const scenario: FaceOffScenario = {
        name: "Team 1 answers correctly twice, Team 2 steals successfully",
        buzzedFirst: 1,
        firstAnswer: "apple",
        controlChoice: "play",
        controlGuesses: ["cherry", "strawberry"], // Team 1 gets two correct
        stealAttempt: "raspberry", // Team 2 steals for 10 points
        expectedPoints: [0, 200],
      };

      let result = runFaceOffScenario(game, scenario, true); // First game
      result = runFaceOffScenario(game, scenario, true); // Second game

      expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
      expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
      expect(result.modeStatus).toBe("awarding_points");
    });

    test("Two games with each team winning once", () => {
      const { io, roomId } = createMockSocketServerAndRoom();
      // @ts-expect-error mock io
      const game = new Game(roomId, "testsocket", ["A", "B"], io);

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
      let result = runFaceOffScenario(game, scenario1, true); // First game (Team 1 wins)
      expect(result.teamsAndPoints[0].points).toBe(100);
      expect(result.teamsAndPoints[1].points).toBe(0);
      expect(result.modeStatus).toBe("awarding_points");

      // Running the second game
      result = runFaceOffScenario(game, scenario2, true); // Second game (Team 2 wins)
      expect(result.teamsAndPoints[0].points).toBe(100);
      expect(result.teamsAndPoints[1].points).toBe(70);
      expect(result.modeStatus).toBe("awarding_points");
    });
  });
});
