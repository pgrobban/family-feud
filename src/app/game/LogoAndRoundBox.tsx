import Image from "next/image";
import { Box, Typography } from "@mui/material";

export default function LogoAndRoundBox({
	round,
	text,
}: { round: string; text?: string }) {
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
				{text && <Typography pt={8}>{text}</Typography>}
			</Box>
		</Box>
	);
}
