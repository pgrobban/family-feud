import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { SoundProvider } from "@/hooks/useSound";

export const metadata: Metadata = {
	title: "Robban's Family Feud",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<AppRouterCacheProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<SoundProvider>
							<Box margin={"0 auto"} width={1400} height={900}>
								<Box mt={2}>{children}</Box>
								<Box position={"fixed"} right={30} bottom={20}>
									&copy; pgrobban
								</Box>
							</Box>
						</SoundProvider>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
