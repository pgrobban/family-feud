import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

const antonSans = Anton({
	variable: "--font-anton",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Robban's Family Feud",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${antonSans.variable}`}>
				<AppRouterCacheProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<Box
							border={"1px solid #ccc"}
							margin={"0 auto"}
							width={1400}
							height={900}
						>
							<Box>{children}</Box>
							<Box position={"fixed"} bottom={20}>
								&copy; pgrobban
							</Box>
						</Box>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
