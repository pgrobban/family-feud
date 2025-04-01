"use client";
import Image from "next/image";
import { Box, TextField, Grid, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "entering_team_names" | "waiting_for_host";

export default function Create() {
	const [teamNames, setTeamNames] = useState<string[]>([]);
	const [status, setStatus] = useState<Status>("entering_team_names");
	const statusMessage =
		status === "entering_team_names" ? "Enter team names" : "Waiting for host";
	const inputsDisabled = status === "waiting_for_host";
	const router = useRouter();

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
						onClick={() => router.push("/")}
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
