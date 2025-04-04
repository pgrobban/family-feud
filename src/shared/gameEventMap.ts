import type { GameState } from "./types";

export interface GameEventMap {
  gameCreated: [gameState: GameState];
  hostJoined: [gameState: GameState];
  modePicked: [gameState: GameState];
  questionPicked: [gameState: GameState];
  answersRevealed: [gameState: GameState];
  teamAnswersGathered: [gameState: GameState];
  pointsAwarded: [gameState: GameState];
  requestGameState: [];
  requestGames: [];
  receivedGameState: [gameState: GameState];
  receivedGames: [games: GameState[]];
  joinHost: [gameId: string];
}