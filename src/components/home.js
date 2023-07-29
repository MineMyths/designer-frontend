import {
	Button,
	Container,
	Divider,
	TextField,
	Typography,
} from "@mui/material";
import { sidebarWidth } from "./session/sidebar";
import { Title } from "./single/text";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { secret } from "../app/api";

export default function Home() {
	const navigate = useNavigate();

	const [sessionId, setSessionId] = useState("");

	function attemptGoToSession() {
		api.get(`/${secret}/session/exists/${sessionId}`)
			.then((response) => {
				if (response.data) {
					navigate(`/session/${sessionId}`);
                    window.location.reload();
				}
			})
			.catch((error) => {
                alert("Invalid session ID")
				console.error("Error fetching session exists: ", error);
			});
	}

	return (
		<Container
			maxWidth="xl"
			sx={{
				ml: sidebarWidth,
			}}
		>
			<Title title="MineMyths Designer" />
			<Typography
				component="p"
				sx={{
					fontFamily: "monospace",
				}}
			>
				MineMyths Designer is the online website used for managing
				content on the MineMyths RPG server.
				<br />
				<br />
				To start, go in game and execute the command{" "}
				<code>/designer</code>. You will be given a link to start your
				own unique session.
			</Typography>
			<Divider
				sx={{
					my: 4,
				}}
			/>
			<TextField
				fullWidth
				label="Session ID"
				onChange={(event) => setSessionId(event.target.value)}
				value={sessionId}
			/>
			<Button
				variant="outlined"
				size="large"
				fullWidth
				sx={{
					my: 2,
					fontFamily: "monospace",
				}}
				onClick={() => {
					attemptGoToSession();
				}}
			>
				Go To Session
			</Button>
		</Container>
	);
}
