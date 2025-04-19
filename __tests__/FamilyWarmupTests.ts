import Game from "@/server/controllers/Game";
import {
  createMockSocketServerAndRoom,
  type FamilyWarmupScenario,
} from "./helpers/testHelpers";
import { familyWarmupState, question } from "./helpers/faceOffFixtures";
import { familyWarmupScenarios } from "./helpers/familyWarmupFixtures";

describe("Family warm-up full paths", () => {
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
    scenario: FamilyWarmupScenario,
    keepPoints: boolean = false
  ) => {
    const updatedGameState = structuredClone(
      keepPoints
        ? {
            ...familyWarmupState,
            mode: "face_off" as const, // make ts happy
            teamsAndPoints: game.toJson().teamsAndPoints,
          }
        : familyWarmupState
    );
    // @ts-expect-error private method
    game.updateGameState(updatedGameState);
    game.hostPickedQuestionForCurrentMode(question.questionText);

    game.hostRequestedTeamAnswers();
    game.hostGatheredTeamAnswersFamilyWarmup(
      scenario.team1Answers,
      scenario.team2Answers
    );
    game.revealTeamAnswersFamilyWarmup();
    game.awardPointsFamilyWarmup();
    return game.toJson();
  };

  test.each(familyWarmupScenarios)("$name", (scenario) => {
    const result = runScenario(scenario);
    expect(result.teamsAndPoints[0].points).toBe(scenario.expectedPoints[0]);
    expect(result.teamsAndPoints[1].points).toBe(scenario.expectedPoints[1]);
    expect(result.modeStatus).toBe("awarding_points");
  });
});
