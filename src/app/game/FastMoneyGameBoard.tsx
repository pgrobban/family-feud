import useSocket from "@/hooks/useSocket";
import { FastMoneyGame, GameAnswer, GameState } from "@/shared/types";
import { useEffect, useState } from "react";
import LogoAndRoundBox from "./LogoAndRoundBox";
import { Box } from "@mui/material";
import CircularCountdownOverlay from "./CircularCountdownTimer";
import AnswerCard from "./AnswerCard";

const BLANK_ANSWERS = new Array<GameAnswer>(5).fill({
  answerText: "",
  points: 0,
  revealed: false,
});

export default function FastMoneyGameBoard({
  gameState,
}: {
  gameState: GameState & FastMoneyGame;
}) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    const onTimerStarted = (seconds: number) => setTimerSeconds(seconds);
    const onTimerCancelled = () => setTimerSeconds(0);

    socket?.on("timerStarted", onTimerStarted);
    socket?.on("timerCancelled", onTimerCancelled);

    return () => {
      socket?.off("timerStarted", onTimerStarted);
      socket?.off("timerCancelled", onTimerCancelled);
    };
  });

  if (gameState.status !== "in_progress" || gameState.mode !== "fast_money") {
    return null;
  }

  if (gameState.modeStatus === "waiting_for_questions") {
    return (
      <LogoAndRoundBox
        round={"Fast money round"}
        text="Teams, choose one player to step up"
      />
    );
  }

  return (
    <Box
      p={2}
      sx={{
        position: "relative",
      }}
    >
      {timerSeconds > 0 && (
        <CircularCountdownOverlay
          seconds={timerSeconds}
          onComplete={() => setTimerSeconds(0)}
        />
      )}
      <Box sx={{ opacity: timerSeconds ? 0.4 : 1.0 }}>
        <Box display="flex" gap={4} justifyContent="center">
          <Box display="flex" flexDirection="column" gap={2}>
            {(gameState.responsesFirstTeam || BLANK_ANSWERS).map(
              (answer, index) => (
                <AnswerCard key={index} answer={answer} index={index} />
              )
            )}
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            {(gameState.responsesSecondTeam || BLANK_ANSWERS).map(
              (answer, index) => (
                <AnswerCard key={index} answer={answer} index={index} />
              )
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
