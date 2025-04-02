"use client";
import Image from "next/image";
import { Box, TextField, Grid, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSocket from "@/hooks/useSocket";

export default function Create() {
	const socket = useSocket();
	const [teamNames, setTeamNames] = useState<string[]>([]);
	const [state, setState] = useState<"entering_names" | "waiting_for_host">(
		"entering_names",
	);
	const router = useRouter();
	const statusMessage =
		state === "entering_names"
			? "Enter team names"
			: "Waiting for host to start the game";
	const inputsDisabled = state === "waiting_for_host";

	const startSocketListener = () => {
		if (!socket) return;
		socket.emit("createGame", teamNames);
		socket.on("gameCreated", () => {
			setState("waiting_for_host");
		});
		socket.on("hostJoined", () => {
			router.push("/game");
		});
	};

	return (
		<>
			<Box display="flex" flexDirection="column" alignItems="center">
				<Image src="/logo.png" alt="Logo" width={560} height={320} />
				<Typography>{statusMessage}</Typography>

				<Grid
					mt={4}
					container
					spacing={2}
					direction="column"
					alignItems="center"
				>
					{[0, 1].map((index) => (
						<Grid key={index} container spacing={2} alignItems="center">
							<Grid>
								<Typography>Team {index + 1}</Typography>
							</Grid>
							<Grid>
								<TextField
									label={`Team ${index + 1} name`}
									value={teamNames[index] || ""}
									onChange={(evt) => {
										const newNames = [...teamNames];
										newNames[index] = evt.target.value;
										setTeamNames(newNames);
									}}
									disabled={inputsDisabled}
								/>
							</Grid>
						</Grid>
					))}
				</Grid>

				<Box display="flex" flexDirection="column" alignItems="center" mt={4}>
					<Button
						variant="contained"
						color="primary"
						sx={{ width: 150 }}
						onClick={startSocketListener}
						disabled={inputsDisabled}
					>
						OK
					</Button>
				</Box>
			</Box>

			<Box position="absolute" bottom={0} left={20}>
				<Button
					variant="contained"
					color="secondary"
					sx={{ width: 200 }}
					onClick={() => router.push("/")}
					disabled={inputsDisabled}
				>
					&larr; Back
				</Button>
			</Box>
		</>
	);
}
