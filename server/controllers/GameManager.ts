import Game from "./Game";
import type { Server } from "socket.io";

class GameManager {
  private games: Map<string, Game> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  getIo() {
    return this.io;
  }

  createGame(socketId: string, teamNames: string[]) {
    const gameId = this.generateGameId();
    const newGame = new Game(gameId, socketId, teamNames, this.io);
    this.games.set(gameId, newGame);
  }

  getAllGames() {
    return Array.from(this.games.values()).map((game) => game.toJson());
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  getGameBySocketId(socketId: string) {
    for (const game of this.games.values()) {
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

export default GameManager;
