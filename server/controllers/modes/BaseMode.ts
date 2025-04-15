import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import type { GameState } from "@/shared/types";

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

  protected emit(event: keyof ServerToClientEvents, data: any) {
    this.io.to(this.roomId).emit(event, data);
  }

  protected patchState(patch: Partial<T>) {
    this.updateGameState(patch);
  }

}