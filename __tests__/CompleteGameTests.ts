import Game from "@/server/controllers/Game";
import { createMockSocketServerAndRoom } from "./helpers/testHelpers";
import {
  familyWarmupScenarios,
  runFamilyWarmupScenario,
} from "./helpers/familyWarmupFixtures";
import {
  faceOffScenarios,
  runFaceOffScenario,
} from "./helpers/faceOffFixtures";
import {
  fastMoneyScenarios,
  runFastMoneyScenario,
} from "./helpers/fastMoneyFixtures";

describe("Full game tests", () => {
  let game: Game;

  beforeEach(() => {
    const { io, roomId } = createMockSocketServerAndRoom();
    // @ts-expect-error mock io
    game = new Game(roomId, "testsocket", ["A", "B"], io);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("Team 1, wins family warm-up, face off, fast money", () => {
    game.joinHost("testRoom");
    game.hostPickedMode("family_warm_up");
    let result = runFamilyWarmupScenario(game, familyWarmupScenarios[0], true);
    let expectedPointsSoFar = familyWarmupScenarios[0].expectedPoints;
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);

    game.cancelQuestionOrMode();
    game.hostPickedMode("face_off");
    result = runFaceOffScenario(game, faceOffScenarios[0], true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + faceOffScenarios[0].expectedPoints[0],
      expectedPointsSoFar[1] + faceOffScenarios[0].expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);

    game.cancelQuestionOrMode();
    game.hostPickedMode("fast_money");
    result = runFastMoneyScenario(game, fastMoneyScenarios[0], true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + fastMoneyScenarios[0].expectedPoints[0],
      expectedPointsSoFar[1] + fastMoneyScenarios[0].expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);
  });
});
