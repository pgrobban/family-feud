import { FamilyWarmupScenario } from "./testHelpers";

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
