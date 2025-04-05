import { Box, Typography } from "@mui/material";
import GameBoard from "./GameBoard";
import { GameState } from "@/shared/types";

export default function GameBoardWithScores({
  gameState,
}: {
  gameState: GameState;
}) {
  return (
    <Box>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"stretch"}
        height={900}
        padding={2}
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
              {gameState.teamsAndPoints[0].teamName || "team Awesome"}
            </Typography>
            <Typography variant="h3">
              {gameState.teamsAndPoints[0].points ?? 235}
            </Typography>
          </Box>
        </Box>
        <Box flexGrow={1} p={2}>
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
          >
            <Typography variant="h6">
              {gameState.teamsAndPoints[1].teamName || "team Nice"}
            </Typography>
            <Typography variant="h3">
              {gameState.teamsAndPoints[0].points ?? 69}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
