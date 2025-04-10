import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./gameEventMap";
import type { StoredAnswer } from "./types";

export const isSocketDefined = (s: Socket | null): s is Socket<ClientToServerEvents & ServerToClientEvents> => s !== null;

export const getOpposingTeam = (team: number) => (team === 1 ? 2 : 1);

export const getAnswerIndex = (answers: StoredAnswer[], answerText: string) => answers.findIndex(
  (a) => a.answerText.toLowerCase() === answerText.toLowerCase()
);