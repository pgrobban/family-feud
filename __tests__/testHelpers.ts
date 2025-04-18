export const createMockSocketServerAndRoom = () => ({
  roomId: "testRoom",
  io: {
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  },
});
