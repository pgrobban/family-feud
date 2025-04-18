import Game from "@/server/controllers/Game";
import { createMockSocketServerAndRoom } from "./helpers/testHelpers";
import { familyWarmupState, question } from "./helpers/faceOffFixtures";

interface FamilyWarmupScenario {
  name: string;
  team1Answers: string[];
  team2Answers: string[];
  expectedPoints: [number, number];
}

const familyWarmupScenarios: FamilyWarmupScenario[] = [
  {
    name: "Team 1 gets more points",
    team1Answers: ["apple", "cherry", "strawberry"],
    team2Answers: ["cherry", "raspberry"],
    expectedPoints: [90, 40],
  },
  {
    name: "Team 2 gets more points",
    team1Answers: ["cherry", "raspberry"],
    team2Answers: ["apple", "cherry", "strawberry"],
    expectedPoints: [40, 90],
  },
  {
    name: "Neither team gets any points",
    team1Answers: [],
    team2Answers: [],
    expectedPoints: [0, 0],
  },
];

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
