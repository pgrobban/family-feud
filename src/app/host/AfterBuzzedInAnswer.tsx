"use client";
import useSocket from "@/hooks/useSocket";
import { Box, Button, Grid, Typography } from "@mui/material";

export default function AfterBuzzedInAnswer({
  modeStatus,
}: {
  modeStatus: "reveal_buzzed_in_answer" | "reveal_other_buzzed_in_answer";
}) {
  const socket = useSocket();

  const emitAskTeamToPlayOrPass = () =>
    socket?.emit("faceOff:requestAskTeamToPlayOrPass");
  const emitRequestOtherTeamToBuzzInAnswer = () =>
    socket?.emit("faceOff:requestOtherTeamBuzzInAnswer");

  if (modeStatus === "reveal_buzzed_in_answer") {
    return (
      <Box>
        <Typography>Was this the highest answer on the board?</Typography>
        <Grid container spacing={2}>
          <Grid>
            <Button variant="contained" onClick={emitAskTeamToPlayOrPass}>
              Yes
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              onClick={emitRequestOtherTeamToBuzzInAnswer}
            >
              No
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography>Was this score higher than the previous team?</Typography>
      <Grid container spacing={2}>
        <Grid>
          <Button variant="contained" onClick={emitAskTeamToPlayOrPass}>
            Yes
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" onClick={emitAskTeamToPlayOrPass}>
            No
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
