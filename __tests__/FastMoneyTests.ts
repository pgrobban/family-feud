import Game from "@/server/controllers/Game";
import {
  fastMoneyScenarios,
  runFastMoneyScenario,
} from "./helpers/fastMoneyFixtures";
import { createMockSocketServerAndRoom } from "./helpers/testHelpers";

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

  test.each(fastMoneyScenarios)("$name", (scenario) => {
    const result = runFastMoneyScenario(game, scenario);
    expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(result.modeStatus).toBe("awarding_points");
  });
});
