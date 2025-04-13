import Image from "next/image";
import { Box, Typography } from "@mui/material";

export default function LogoAndRoundBox({
  round,
  text1,
  text2,
}: {
  round: string;
  text1?: string;
  text2?: string;
}) {
  return (
    <Box
      height={"100%"}
      textTransform={"uppercase"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      textAlign={"center"}
      sx={{
        background: "radial-gradient(circle at center, #0b3c9c, #021c44)",
      }}
    >
      <Image src="/logo.png" alt="Logo" width={560} height={320} />
      <Box width={700}>
        <Typography variant="h2">{round}</Typography>
        {text1 && <Typography pt={8}>{text1}</Typography>}
        {text2 && <Typography pt={8}>{text2}</Typography>}
      </Box>
    </Box>
  );
}
