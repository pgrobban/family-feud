import { Box, Typography } from "@mui/material";
import GameBoard from "./GameBoard";
import type { GameState } from "@/shared/types";

export default function GameBoardWithScores({
  gameState,
}: {
  gameState: GameState;
}) {
  return (
    <Box mb={2}>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"stretch"}
        height={900}
      >
        <Box width={220} flex={"0 0 220px"}>
          <Box
            width={220}
            height={"100%"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{
              background: "linear-gradient(135deg, #00aaff, #0044cc)", // Blue gradient
            }}
            textTransform={"uppercase"}
          >
            <Typography variant="h6">
              {gameState.teamsAndPoints[0].teamName}
            </Typography>
            <Typography variant="h3">
              {gameState.teamsAndPoints[0].points}
            </Typography>
          </Box>
        </Box>
        <Box
          flexGrow={1}
          sx={{
            background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
          }}
        >
          <GameBoard gameState={gameState} />
        </Box>
        <Box width={220} flex={"0 0 220px"}>
          <Box
            width={220}
            height={"100%"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            sx={{
              background: "linear-gradient(135deg, #00aaff, #0044cc)", // Blue gradient
            }}
            textTransform={"uppercase"}
            fontWeight={"bold"}
          >
            <Typography variant="h6">
              {gameState.teamsAndPoints[1].teamName}
            </Typography>
            <Typography variant="h3">
              {gameState.teamsAndPoints[1].points}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
