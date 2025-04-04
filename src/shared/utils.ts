import type { Socket } from "socket.io-client";
import type { GameEventMap } from "./gameEventMap";

export const isSocketDefined = (s: Socket | null): s is Socket<GameEventMap> => s !== null;
