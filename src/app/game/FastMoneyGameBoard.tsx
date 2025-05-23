import useSocket from "@/hooks/useSocket";
import type {
  FastMoneyAnswer,
  FastMoneyGameState,
  GameState,
} from "@/shared/types";
import { useEffect, useState } from "react";
import LogoAndRoundBox from "./LogoAndRoundBox";
import { Box, Typography } from "@mui/material";
import CircularCountdownOverlay from "./CircularCountdownTimer";
import FastMoneyAnswerCard from "./FastMoneyAnswerCard";
import {
  FAST_MONEY_STEAL_BONUS,
  getFastMoneyStealPoints,
  getSortedTeamIndexes,
  getSortedTeamNames,
} from "@/shared/utils";
import { useSound } from "@/hooks/useSound";

const BLANK_ANSWERS = new Array<FastMoneyAnswer>(5).fill({
  answerText: "",
  points: 0,
  answerRevealed: false,
  pointsRevealed: false,
  isTopAnswer: false,
});

export default function FastMoneyGameBoard({
  gameState,
}: {
  gameState: GameState & FastMoneyGameState;
}) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [startingOrder] = useState(
    getSortedTeamIndexes(gameState.teamsAndPoints)
  ); // only used to control column order
  console.log("***", startingOrder);

  const socket = useSocket();
  const sounds = useSound();

  useEffect(() => {
    const onTimerStarted = (seconds: number) => setTimerSeconds(seconds);
    const onTimerCancelled = () => setTimerSeconds(0);
    const onRequestStealQuestionAndAnswer = () => sounds.playYouSaid();

    socket?.on("timerStarted", onTimerStarted);
    socket?.on("timerCancelled", onTimerCancelled);
    socket?.on(
      "fastMoney:requestStealQuestionAndAnswer",
      onRequestStealQuestionAndAnswer
    );

    return () => {
      socket?.off("timerStarted", onTimerStarted);
      socket?.off("timerCancelled", onTimerCancelled);
      socket?.off(
        "fastMoney:requestStealQuestionAndAnswer",
        onRequestStealQuestionAndAnswer
      );
    };
  });

  if (gameState.status !== "in_progress" || gameState.mode !== "fast_money") {
    return null;
  }

  if (gameState.modeStatus === "waiting_for_questions") {
    const sortedTeams = getSortedTeamNames(gameState.teamsAndPoints);
    return (
      <LogoAndRoundBox
        round={"Fast money round"}
        text1={`${sortedTeams.first}, choose one player to compete`}
        text2={`${sortedTeams.second}, choose one player to be potential stealer`}
      />
    );
  }

  const getPointsSum = () => {
    const firstTeamResponseSum =
      gameState.responsesFirstTeam?.reduce(
        (sum, answer) => sum + answer.points,
        0
      ) || 0;

    const stealPoints = gameState.responsesSecondTeam
      ? getFastMoneyStealPoints(
          gameState.questions || [],
          gameState.responsesSecondTeam || []
        )
      : { isHighest: false, points: 0 };

    switch (gameState.modeStatus) {
      case "waiting_for_questions":
      case "questions_in_progress":
      case "revealing_answers":
        return 0;
      case "request_steal_question_and_answer":
      case "received_steal_question_and_answer":
        return firstTeamResponseSum;
      case "reveal_steal_question_and_answer":
      case "awarding_points":
        return (
          firstTeamResponseSum +
          (stealPoints.isHighest
            ? stealPoints.points + FAST_MONEY_STEAL_BONUS
            : 0)
        );
    }
  };

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
      <Box sx={{ opacity: timerSeconds ? 0.4 : 1.0 }}>
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
            width: 200,
          }}
        >
          <Typography variant="h3">{getPointsSum()}</Typography>
        </Box>
        <Box
          display="flex"
          flexDirection={startingOrder.first === 0 ? "row" : "row-reverse"}
          gap={4}
          justifyContent="center"
        >
          <Box display="flex" flexDirection="column" gap={2} flex={1}>
            {(gameState.responsesFirstTeam || BLANK_ANSWERS).map(
              (answer, index) => (
                <FastMoneyAnswerCard
                  key={`${answer}-${index}`}
                  answer={answer}
                  answerIndex={index}
                  column={"playing_team"}
                />
              )
            )}
          </Box>
          <Box display="flex" flexDirection="column" gap={2} flex={1}>
            {(gameState.responsesSecondTeam || BLANK_ANSWERS).map(
              (answer, index) => (
                <FastMoneyAnswerCard
                  key={`${answer}-${index}`}
                  answer={answer}
                  answerIndex={index}
                  column={"stealing_team"}
                />
              )
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
