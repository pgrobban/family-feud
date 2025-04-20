import Game from "@/server/controllers/Game";
import { FamilyWarmupScenario } from "./testHelpers";
import { question } from "./faceOffFixtures";

export const familyWarmupState = {
  mode: "family_warm_up",
  status: "in_progress",
  modeStatus: "waiting_for_question",
};

export const familyWarmupScenarios: FamilyWarmupScenario[] = [
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

export const runFamilyWarmupScenario = (
  game: Game,
  scenario: FamilyWarmupScenario,
  keepPoints: boolean = false
) => {
  const updatedGameState = structuredClone(
    keepPoints
      ? {
          ...familyWarmupState,
          mode: "family_warm_up",
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
