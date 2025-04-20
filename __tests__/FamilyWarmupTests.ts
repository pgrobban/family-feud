import Game from "@/server/controllers/Game";
import { createMockSocketServerAndRoom } from "./helpers/testHelpers";
import {
  familyWarmupScenarios,
  runFamilyWarmupScenario,
} from "./helpers/familyWarmupFixtures";

describe("Family warm-up full paths", () => {
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

  test.each(familyWarmupScenarios)("$name", (scenario) => {
    const result = runFamilyWarmupScenario(game, scenario);
    expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(result.modeStatus).toBe("awarding_points");
  });
});
