import Game from "./Game";

class GameManager {
  private games: Map<string, Game>;

  constructor() {
    this.games = new Map();
  }

  createGame(socketId: string, teamNames: string[]) {
    const gameId = this.generateGameId();
    const newGame = new Game(gameId, socketId, teamNames);
    this.games.set(gameId, newGame);
  }

  getAllGames() {
    return Array.from(this.games.values()).map((game) => game.toJson());
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  getGameBySocketId(socketId: string) {
    // console.log("Searching for game with socketId:", socketId);
    for (const game of this.games.values()) {
      // console.log("Checking game:", game);
      if (game.getHostSocketIds().includes(socketId) || game.getPlayerSocketIds().includes(socketId)) {
        return game;
      }
    }
    return null;
  }

  deleteGame(gameId: string) {
    this.games.delete(gameId);
  }

  private generateGameId() {
    return Math.random().toString(36).substring(2, 9);
  }
}

export default new GameManager(); // Singleton instance
