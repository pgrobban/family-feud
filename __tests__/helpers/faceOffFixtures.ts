import Game from "@/server/controllers/Game";
import { FaceOffScenario } from "./testHelpers";
import { getOpposingTeam } from "@/shared/utils";

export const question = {
  questionText: "Name a fruit that's red",
  answers: [
    { answerText: "apple", points: 40, answerRevealed: false },
    { answerText: "cherry", points: 30, answerRevealed: false },
    { answerText: "strawberry", points: 20, answerRevealed: false },
    { answerText: "raspberry", points: 10, answerRevealed: false },
  ],
};

const boardAnswers = question.answers.map((answer) => answer.answerText);

export const familyWarmupState = {
  mode: "family_warm_up",
  status: "in_progress",
  modeStatus: "waiting_for_question",
};

export const faceOffState = {
  mode: "face_off",
  modeStatus: "waiting_for_question",
  status: "in_progress",
};

export const faceOffScenarios: FaceOffScenario[] = [
  {
    name: "Team 1 buzzes first, highest answer, chooses to play, clears board",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 1 buzzes first, highest answer, chooses to play, fails, Team 2 steals successfully",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["grape", "banana", "orange"], // 3 strikes
    stealAttempt: "cherry",
    expectedPoints: [0, 70],
  },
  {
    name: "Team 1 buzzes first, highest answer, chooses to play, fails, Team 2 fails to steal",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "banana",
    expectedPoints: [40, 0],
  },
  {
    name: "Team 1 buzzes first, highest answer, chooses to pass, team 2 clears board",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "pass",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 1 buzzes first, highest answer, chooses to pass, team 2 fails, team 1 steals successfully",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "pass",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "cherry",
    expectedPoints: [70, 0],
  },
  {
    name: "Team 1 buzzes first, highest answer, chooses to pass, team 2 fails, team 1 fails to steal",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "pass",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "banana",
    expectedPoints: [0, 40],
  },
  {
    name: "Team 1 buzzes first, not highest answer. team 2 has highest, chooses to play, clears board.",
    buzzedFirst: 1,
    firstAnswer: "cherry",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 1 buzzes first, not highest answer. team 2 has highest, chooses to play, doesn't clear board, team 1 steals successfully.",
    buzzedFirst: 1,
    firstAnswer: "cherry",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["strawberry", "grape", "banana", "orange"],
    stealAttempt: "raspberry",
    expectedPoints: [100, 0],
  },
  {
    name: "Team 1 buzzes first, not highest answer. team 2 has highest, chooses to play, doesn't clear board, team 1 fails to steal.",
    buzzedFirst: 1,
    firstAnswer: "cherry",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["strawberry", "grape", "banana", "orange"],
    stealAttempt: "grape",
    expectedPoints: [0, 90],
  },
  {
    name: "Team 1 buzzes first, incorrect answer. team 2 answers highest, chooses to play, clears board..",
    buzzedFirst: 1,
    firstAnswer: "banana",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 1 buzzes first, incorrect answer. team 2 answers not highest, chooses to play, clears board..",
    buzzedFirst: 1,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "play",
    controlGuesses: ["apple", "strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 1 buzzes first, incorrect answer. team 2 answers not highest, chooses to pass, team 1 clears board.",
    buzzedFirst: 1,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "pass",
    controlGuesses: ["apple", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 1 buzzes first, incorrect answer. team 2 answers not highest, chooses to pass, team 1 fails to clear board, team 2 steals.",
    buzzedFirst: 1,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "pass",
    controlGuesses: ["apple", "banana", "grape"],
    stealAttempt: "raspberry",
    expectedPoints: [0, 80],
  },
  {
    name: "Team 1 buzzes first, incorrect answer. team 2 answers not highest, chooses to pass, team 1 fails to clear board, team 2 fails to steal.",
    buzzedFirst: 1,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "pass",
    controlGuesses: ["apple", "banana", "grape"],
    stealAttempt: "potato",
    expectedPoints: [70, 0],
  },
  {
    name: "Both teams buzz incorrect answers",
    buzzedFirst: 1,
    firstAnswer: "banana",
    secondAnswer: "grape", // both buzz wrong, team 1 should be in control as they buzzed first
    controlChoice: "play",
    controlGuesses: ["apple", "cherry", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 1 gives second-highest, team 2 gives third-highest, team 1 wins",
    buzzedFirst: 1,
    firstAnswer: "cherry",
    secondAnswer: "strawberry",
    controlChoice: "play",
    controlGuesses: ["apple", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 1 repeats the same wrong answer multiple times",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["banana", "banana", "banana"],
    stealAttempt: "cherry",
    expectedPoints: [0, 70],
  },
  {
    name: "Team 1 fails to clear, team 2 attempts to steal with already revealed answer <-- not possible since UI disables picking already revealed answers",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "grape"],
    stealAttempt: "cherry",
    expectedPoints: [90, 0],
  },
  {
    name: "Team 1 gets 2 correct, then 3rd strike, team 2 steals remaining one",
    buzzedFirst: 1,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "banana"],
    stealAttempt: "raspberry",
    expectedPoints: [0, 100],
  },
  {
    name: "Team 2 buzzes first, highest answer, chooses to play, clears board",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 2 buzzes first, highest answer, chooses to play, fails, Team 1 steals successfully",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "cherry",
    expectedPoints: [70, 0],
  },
  {
    name: "Team 2 buzzes first, highest answer, chooses to play, fails, Team 1 fails to steal",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "banana",
    expectedPoints: [0, 40],
  },
  {
    name: "Team 2 buzzes first, highest answer, chooses to pass, team 1 clears board",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "pass",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 2 buzzes first, highest answer, chooses to pass, team 1 fails, team 2 steals successfully",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "pass",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "cherry",
    expectedPoints: [0, 70],
  },
  {
    name: "Team 2 buzzes first, highest answer, chooses to pass, team 1 fails, team 2 fails to steal",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "pass",
    controlGuesses: ["grape", "banana", "orange"],
    stealAttempt: "banana",
    expectedPoints: [40, 0],
  },
  {
    name: "Team 2 buzzes first, not highest answer. team 1 has highest, chooses to play, clears board.",
    buzzedFirst: 2,
    firstAnswer: "cherry",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 2 buzzes first, not highest answer. team 1 has highest, chooses to play, doesn't clear board, team 2 steals successfully.",
    buzzedFirst: 2,
    firstAnswer: "cherry",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["strawberry", "grape", "banana", "orange"],
    stealAttempt: "raspberry",
    expectedPoints: [0, 100],
  },
  {
    name: "Team 2 buzzes first, not highest answer. team 1 has highest, chooses to play, doesn't clear board, team 2 fails to steal.",
    buzzedFirst: 2,
    firstAnswer: "cherry",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["strawberry", "grape", "banana", "orange"],
    stealAttempt: "grape",
    expectedPoints: [90, 0],
  },
  {
    name: "Team 2 buzzes first, incorrect answer. team 1 answers highest, chooses to play, clears board..",
    buzzedFirst: 2,
    firstAnswer: "banana",
    secondAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 2 buzzes first, incorrect answer. team 1 answers not highest, chooses to play, clears board..",
    buzzedFirst: 2,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "play",
    controlGuesses: ["apple", "strawberry", "raspberry"],
    expectedPoints: [100, 0],
  },
  {
    name: "Team 2 buzzes first, incorrect answer. team 1 answers not highest, chooses to pass, team 2 clears board.",
    buzzedFirst: 2,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "pass",
    controlGuesses: ["apple", "strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 2 buzzes first, incorrect answer. team 1 answers not highest, chooses to pass, team 2 fails to clear board, team 1 steals.",
    buzzedFirst: 2,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "pass",
    controlGuesses: ["apple", "banana", "grape"],
    stealAttempt: "raspberry",
    expectedPoints: [80, 0],
  },
  {
    name: "Team 2 buzzes first, incorrect answer. team 1 answers not highest, chooses to pass, team 2 fails to clear board, team 1 fails to steal.",
    buzzedFirst: 2,
    firstAnswer: "banana",
    secondAnswer: "cherry",
    controlChoice: "pass",
    controlGuesses: ["apple", "banana", "grape"],
    stealAttempt: "potato",
    expectedPoints: [0, 70],
  },
  {
    name: "Both teams buzz incorrect answers",
    buzzedFirst: 2,
    firstAnswer: "banana",
    secondAnswer: "grape",
    controlChoice: "play",
    controlGuesses: ["apple", "cherry", "strawberry", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 2 gives second-highest, team 1 gives third-highest, team 2 wins",
    buzzedFirst: 2,
    firstAnswer: "cherry",
    secondAnswer: "strawberry",
    controlChoice: "play",
    controlGuesses: ["apple", "raspberry"],
    expectedPoints: [0, 100],
  },
  {
    name: "Team 2 repeats the same wrong answer multiple times",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["banana", "banana", "banana"],
    stealAttempt: "cherry",
    expectedPoints: [70, 0],
  },
  {
    name: "Team 2 fails to clear, team 1 attempts to steal with already revealed answer <-- not possible since UI disables picking already revealed answers",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "grape"],
    stealAttempt: "cherry",
    expectedPoints: [0, 90],
  },
  {
    name: "Team 2 gets 2 correct, then 3rd strike, team 1 steals remaining one",
    buzzedFirst: 2,
    firstAnswer: "apple",
    controlChoice: "play",
    controlGuesses: ["cherry", "strawberry", "banana"],
    stealAttempt: "raspberry",
    expectedPoints: [100, 0],
  },
];

export const runFaceOffScenario = (
  game: Game,
  scenario: FaceOffScenario,
  keepPoints: boolean = false
) => {
  // Setup Face-Off question
  const updatedGameState = structuredClone(
    keepPoints
      ? {
          ...faceOffState,
          mode: "face_off",
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
