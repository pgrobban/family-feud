import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/shared/gameEventMap";
import type { Server, Socket } from "socket.io";
import type GameManager from "../controllers/GameManager";
import bindUpdateGame from "./bindUpdateGame";

export default function fastMoneyHandlers(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server,
  gameManager: GameManager
) {
  const updateGame = bindUpdateGame(socket, io, gameManager);

  socket.on("fastMoney:questionsPicked", (questions) =>
    updateGame((game) => game.hostPickedFastMoneyQuestions(questions))
  );
  socket.on("fastMoney:receivedResponses", (responses) => updateGame((game) => game.receivedFastMoneyResponses(responses)));

  socket.on("fastMoney:requestRevealAnswer", (answerIndex, column) => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;
    game.requestedFastMoneyAnswerReveal(answerIndex, column);
  });
  socket.on("fastMoney:requestRevealPoints", (answerIndex, column) => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;
    game.requestedFastMoneyPointsReveal(answerIndex, column);
  });

  socket.on("fastMoney:requestStealQuestionAndAnswer", () => updateGame((game) => game.requestedFastMoneyStealQuestionAndAnswer()));
  socket.on("fastMoney:receivedStealQuestionAndAnswer", (questionText, answerText) => updateGame((game) => game.receivedFastMoneyStealQuestionAndAnswer(questionText, answerText)));

  socket.on("fastMoney:requestRevealStealQuestionAndAnswer", () => {
    const game = gameManager.getGameBySocketId(socket.id);
    if (!game) return;
    game.requestedRevealFastMoneyStealQuestionAndAnswer();
  });
  socket.on("fastMoney:requestAwardPoints", () => updateGame((game) => game.awardPointsFastMoney()));
}
