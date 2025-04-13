import useSocket from "@/hooks/useSocket";
import type { EventHandler } from "@/shared/gameEventMap";
import type { GameAnswer } from "@/shared/types";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
interface Props {
  answer: GameAnswer;
  answerIndex: number;
  team: 1 | 2;
}

export default function FastMoneyAnswerCard({
  answer,
  answerIndex,
  team,
}: Props) {
  const { answerText, points } = answer;
  const [flipped, setFlipped] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [pointsRevealed, setPointsRevealed] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    if (answerRevealed && !flipped) {
      setFlipped(true);
    }
  }, [answerRevealed, flipped]);

  useEffect(() => {
    if (!socket) return;

    const doAnimation: EventHandler<"fastMoneyAnswerRevealed"> = (
      answerIdx,
      teamIdx
    ) => {
      if (answerIndex !== answerIdx && team !== teamIdx) return;

      setFlipped(true); // flip visually immediately
      setAnswerRevealed(true);
    };

    const onPointsRevealed: EventHandler<"fastMoneyPointsRevealed"> = (
      answerIdx,
      teamIdx
    ) => {
      if (answerIndex !== answerIdx && team !== teamIdx) return;
      setPointsRevealed(true);
    };

    socket.on("fastMoneyAnswerRevealed", doAnimation);
    socket.on("fastMoneyPointsRevealed", onPointsRevealed);
    return () => {
      socket.off("fastMoneyAnswerRevealed", doAnimation);
      socket.off("fastMoneyPointsRevealed", onPointsRevealed);
    };
  }, [socket, answerIndex, team]);

  return (
    <Box
      className={`flip-card ${flipped ? "flipped" : ""}`}
      sx={{ perspective: 1000, width: "100%", height: 81, fontSize: 50 }}
    >
      <Box
        className="flip-card-inner"
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.8s",
        }}
      >
        {/* Front (number) */}
        <Box
          className="flip-card-front"
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
            borderRadius: 2,
            color: "#fff",
            fontWeight: "bold",
            border: "3px solid #fff",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 75,
              background: "#021c44",
              borderRadius: "100% 100%",
              textAlign: "center",
            }}
          >
            {answerIndex + 1}
          </Box>
        </Box>

        {/* Back (revealed answer) */}
        <Box
          className="flip-card-back"
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            background: "linear-gradient(to left, #2249a3, #3e83f8, #2249a3)",
            transform: "rotateX(180deg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pl: 3,
            border: "3px solid #fff",
            borderRadius: 2,
            color: "#fff",
            boxShadow: "inset 0 0 6px #000",
          }}
        >
          <Typography fontSize={50}>{answerText}</Typography>
          <Box
            sx={{
              width: 100,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(to bottom, #3e83f8, #2249a3)",
              borderLeft: "2px solid #fff",
            }}
          >
            {pointsRevealed ? points : "?"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
