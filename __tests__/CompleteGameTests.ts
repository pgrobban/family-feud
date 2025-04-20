import Game from "@/server/controllers/Game";
import {
  createMockSocketServerAndRoom,
  FaceOffScenario,
  FamilyWarmupScenario,
  FastMoneyScenario,
} from "./helpers/testHelpers";
import { runFamilyWarmupScenario } from "./helpers/familyWarmupFixtures";
import { question, runFaceOffScenario } from "./helpers/faceOffFixtures";
import { runFastMoneyScenario } from "./helpers/fastMoneyFixtures";
import { FAST_MONEY_QUESTIONS } from "@/shared/utils";

const familyWarmupScenario: FamilyWarmupScenario = {
  name: "Team 1 gets more points",
  team1Answers: ["apple", "cherry", "strawberry"],
  team2Answers: ["cherry", "raspberry"],
  expectedPoints: [90, 40],
};
const faceOffTeam1WinsScenario: FaceOffScenario = {
  name: "Team 1 buzzes first, highest answer, chooses to play, clears board",
  buzzedFirst: 1,
  firstAnswer: "apple",
  controlChoice: "play",
  controlGuesses: ["cherry", "strawberry", "raspberry"],
  expectedPoints: [100, 0],
};
const faceOffTeam2WinsScenario: FaceOffScenario = {
  name: "Team 2 buzzes first, highest answer, chooses to play, clears board",
  buzzedFirst: 2,
  firstAnswer: "apple",
  controlChoice: "play",
  controlGuesses: ["cherry", "strawberry", "raspberry"],
  expectedPoints: [0, 100],
};

const fastMoneyTeam1PlaysScenario: FastMoneyScenario = {
  name: "team 1 plays, gets over 150 points",
  questionTexts: new Array(FAST_MONEY_QUESTIONS).fill(question.questionText),
  answerTexts: new Array(FAST_MONEY_QUESTIONS).fill(
    question.answers[0].answerText
  ),
  expectedPoints: [200, 0],
};
const fastMoneyTeam2PlaysScenario: FastMoneyScenario = {
  name: "team 2 plays, gets over 150 points",
  questionTexts: new Array(FAST_MONEY_QUESTIONS).fill(question.questionText),
  answerTexts: new Array(FAST_MONEY_QUESTIONS).fill(
    question.answers[0].answerText
  ),
  expectedPoints: [0, 200],
};

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

  test("Team 1 wins family warm-up, face off, fast money", () => {
    game.joinHost("testRoom");
    game.hostPickedMode("family_warm_up");
    let result = runFamilyWarmupScenario(game, familyWarmupScenario, true);
    let expectedPointsSoFar = familyWarmupScenario.expectedPoints;
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);

    game.cancelQuestionOrMode();
    game.hostPickedMode("face_off");
    result = runFaceOffScenario(game, faceOffTeam1WinsScenario, true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + faceOffTeam1WinsScenario.expectedPoints[0],
      expectedPointsSoFar[1] + faceOffTeam1WinsScenario.expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);

    game.cancelQuestionOrMode();
    game.hostPickedMode("fast_money");
    result = runFastMoneyScenario(game, fastMoneyTeam1PlaysScenario, true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + fastMoneyTeam1PlaysScenario.expectedPoints[0],
      expectedPointsSoFar[1] + fastMoneyTeam1PlaysScenario.expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);
  });

  test("Team 1, wins family warm-up, team 2 face off (2 questions) and fast money", () => {
    game.joinHost("testRoom");
    game.hostPickedMode("family_warm_up");

    let result = runFamilyWarmupScenario(game, familyWarmupScenario, true);
    let expectedPointsSoFar = familyWarmupScenario.expectedPoints;
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);

    game.cancelQuestionOrMode();
    game.hostPickedMode("face_off");

    result = runFaceOffScenario(game, faceOffTeam2WinsScenario, true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + faceOffTeam2WinsScenario.expectedPoints[0],
      expectedPointsSoFar[1] + faceOffTeam2WinsScenario.expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);
    game.cancelQuestionOrMode();

    result = runFaceOffScenario(game, faceOffTeam2WinsScenario, true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + faceOffTeam2WinsScenario.expectedPoints[0],
      expectedPointsSoFar[1] + faceOffTeam2WinsScenario.expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);

    game.cancelQuestionOrMode();
    game.hostPickedMode("fast_money");

    result = runFastMoneyScenario(game, fastMoneyTeam2PlaysScenario, true);
    expectedPointsSoFar = [
      expectedPointsSoFar[0] + fastMoneyTeam2PlaysScenario.expectedPoints[0],
      expectedPointsSoFar[1] + fastMoneyTeam2PlaysScenario.expectedPoints[1],
    ];
    expect(result.teamsAndPoints[0].points).toBe(expectedPointsSoFar[0]);
    expect(result.teamsAndPoints[1].points).toBe(expectedPointsSoFar[1]);
  });
});
