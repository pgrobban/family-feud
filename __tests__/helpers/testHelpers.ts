export const createMockSocketServerAndRoom = () => ({
  roomId: "testRoom",
  io: {
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  },
});

export interface FaceOffScenario {
  name: string;
  buzzedFirst: 1 | 2;
  firstAnswer: string;
  secondAnswer?: string;
  controlChoice: "play" | "pass";
  controlGuesses: string[]; // Must be >= 3 if not clearing board
  stealAttempt?: string; // only applies if control team fails
  expectedPoints: [number, number];
}
