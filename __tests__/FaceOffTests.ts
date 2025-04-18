import Game from "@/server/controllers/Game";
import { createMockSocketServerAndRoom } from "./testHelpers";

type Scenario = {
  name: string;
  buzzedFirst: 1 | 2;
  firstAnswer: string;
  controlChoice: "play" | "pass";
  controlGuesses: string[]; // Must be >= 3 if not clearing board
  stealAttempt?: string; // only applies if control team fails
  expectedPoints: [number, number];
};

const scenarios: Scenario[] = [
  {
    name: "Team 1 buzzes, chooses to play, clears board",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },

  {
    name: "Team 1 buzzes, chooses to play, fails, Team 2 steals successfully",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["grape", "banana", "orange"], // 3 strikes
    stealAttempt: "cherry",
    expectedPoints: [0, 70],
  },
];

describe("Face-Off full paths", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test.each(scenarios)("$name", (scenario) => {
    const { io, roomId } = createMockSocketServerAndRoom();
    // @ts-expect-error mock IO
    const game = new Game(roomId, "testsocket", ["A", "B"], io);

    // Setup Face-Off question
    // @ts-expect-error private method
    game.updateGameState({
      mode: "face_off",
      modeStatus: "face_off_started",
      status: "in_progress",
      buzzOrder: [],
      question: {
        questionText: "Name a fruit that's red",
        answers: [
          { answerText: "apple", points: 40, answerRevealed: false },
          { answerText: "cherry", points: 30, answerRevealed: false },
          { answerText: "strawberry", points: 20, answerRevealed: false },
          { answerText: "raspberry", points: 10, answerRevealed: false },
        ],
      },
    });
    const boardAnswers = ["apple", "cherry", "strawberry", "raspberry"];
    const unrevealedAtStart = new Set(boardAnswers);

    // Buzz in
    game.submitBuzzInAnswer(scenario.buzzedFirst, scenario.firstAnswer);
    unrevealedAtStart.delete(scenario.firstAnswer);
    jest.runAllTimers();

    game.requestAskTeamToPlayOrPass();
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
