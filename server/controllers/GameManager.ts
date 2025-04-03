import Game from "./Game";

class GameManager {
  private games: Map<string, Game>;

  constructor() {
    this.games = new Map();
  }

  createGame(teamNames: string[]) {
    const gameId = this.generateGameId();
    const newGame = new Game(gameId, teamNames);
    this.games.set(gameId, newGame);
  }

  getAllGames() {
    return Array.from(this.games.values());
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  deleteGame(gameId: string) {
    this.games.delete(gameId);
  }

  private generateGameId() {
    return Math.random().toString(36).substring(2, 9);
  }
}

export default new GameManager(); // Singleton instance