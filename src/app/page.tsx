"use client";
import Image from "next/image";
import { Box, Button, Typography, Grid } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Image src="/logo.png" alt="Logo" width={560} height={320} />
      <Grid container spacing={4} direction="column" alignItems="center">
        <Grid>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: 250 }}
            onClick={() => router.push("/create")}
          >
            <Typography variant="h4">Play</Typography>
          </Button>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: 250 }}
            onClick={() => router.push("/join")}
          >
            <Typography variant="h4">Host</Typography>
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
