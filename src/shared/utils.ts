import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./gameEventMap";

export const isSocketDefined = (s: Socket | null): s is Socket<ClientToServerEvents & ServerToClientEvents> => s !== null;
