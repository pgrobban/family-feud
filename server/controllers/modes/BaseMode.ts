import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import type { BaseGameState, GameState } from "@/shared/types";

export abstract class BaseMode<T extends GameState> {
  protected gameState: T;
  protected io: Server<ClientToServerEvents, ServerToClientEvents>;
  protected roomId: string;
  protected updateGameState: (partialState: Partial<T>) => void;

  constructor(
    gameState: T,
    io: Server,
    roomId: string,
    updateGameState: (partialState: Partial<T>) => void
  ) {
    this.gameState = gameState;
    this.io = io;
    this.roomId = roomId;
    this.updateGameState = updateGameState;
  }

  abstract initialize(): Partial<T>;

  abstract getType(): string;

  protected emit<K extends keyof ServerToClientEvents>(
    event: K,
    ...args: Parameters<ServerToClientEvents[K]>
  ) {
    this.io.to(this.roomId).emit(event, ...args);
  }

  protected patchState(patch: Partial<T>) {
    this.updateGameState(patch);
  }

  abstract toJson(): GameState;

  toJsonBase(): BaseGameState {
    return {
      id: this.roomId,
      status: this.gameState.status,
      mode: this.gameState.mode,
      modeStatus: this.gameState.modeStatus,
      teamNames: this.gameState.teamNames,
      teamsAndPoints: this.gameState.teamsAndPoints,
      question: this.gameState.question,
      questions: this.gameState.questions,
    };
  }
}
