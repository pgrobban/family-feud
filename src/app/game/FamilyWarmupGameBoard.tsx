"use client";

import { Box, Typography } from "@mui/material";
import type { GameState, FamilyWarmUpGameState } from "@/shared/types";
import AnswerCardWithTeamPoints from "./AnswerCardWithTeamPoints";
import TotalPointsBox from "./TotalPointsBox";
import LogoAndRoundBox from "./LogoAndRoundBox";
import { useEffect, useState } from "react";
import CircularCountdownOverlay from "./CircularCountdownTimer";
import useSocket from "@/hooks/useSocket";
import { useSound } from "@/hooks/useSound";

const sideBoxStyles = {
  mt: 1,
  width: 60,
  height: 60,
  border: "1px solid #ccc",
  background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  textAlign: "center",
};

export default function FamilyWarmupGameBoard({
  gameState,
}: {
  gameState: GameState & FamilyWarmUpGameState;
}) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const socket = useSocket();
  const sounds = useSound();

  useEffect(() => {
    const onTimerStarted = (seconds: number) => setTimerSeconds(seconds);
    const onTimerCancelled = () => setTimerSeconds(0);

    socket?.on("timerStarted", onTimerStarted);
    socket?.on("timerCancelled", onTimerCancelled);

    return () => {
      socket?.off("timerStarted", onTimerStarted);
      socket?.off("timerCancelled", onTimerCancelled);
    };
  }, [socket]);

  useEffect(() => {
    if (
      ["revealing_team_answers", "awarding_points"].includes(
        gameState.modeStatus
      )
    ) {
      sounds.playYouSaid();
    }
  }, [gameState?.modeStatus, sounds]);

  if (
    gameState.status !== "in_progress" ||
    gameState.mode !== "family_warm_up"
  ) {
    return null;
  }

  if (gameState.modeStatus === "waiting_for_question") {
    return (
      <LogoAndRoundBox
        round={"All-family warmup round"}
        text1="Teams, get ready with pen and paper"
      />
    );
  }

  if (!gameState.question) {
    return null;
  }

  return (
    <Box
      p={2}
      sx={{
        position: "relative",
        height: "100%",
      }}
    >
      {timerSeconds > 0 && (
        <CircularCountdownOverlay
          seconds={timerSeconds}
          onComplete={() => setTimerSeconds(0)}
        />
      )}

      <Box
        sx={{
          background: "linear-gradient(to bottom, #3964c9, #1b2d6d)",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 48,
          textAlign: "center",
          mx: "auto",
          border: "4px solid #fff",
          borderRadius: 2,
          mb: 3,
          p: 2,
          textTransform: "uppercase",
          zIndex: 100,
          position: "relative",
        }}
      >
        <Typography variant="h5">{gameState.question.questionText}</Typography>
      </Box>

      <Box sx={{ opacity: timerSeconds ? 0.4 : 1.0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%", // important
            height: "100%", // optional, but helps if parent is full height
            gap: 1,
            textTransform: "uppercase",
          }}
        >
          {gameState.question.answers.map((answer, index) => (
            <AnswerCardWithTeamPoints
              key={answer.answerText}
              answer={answer}
              index={index}
              sideBoxStyles={sideBoxStyles}
              gameState={gameState}
            />
          ))}
          <Box m={1} />
          {gameState.modeStatus === "awarding_points" && (
            <TotalPointsBox
              answers={gameState.question.answers}
              team1Answers={gameState.team1Answers || []}
              team2Answers={gameState.team2Answers || []}
              sideBoxStyles={sideBoxStyles}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
