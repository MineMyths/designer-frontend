import {
	Divider,
	Drawer,
	List,
	ListItemButton,
	ListItemText,
	Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { secret } from "../../app/api";
import toTitleCase from "../util/titleCase";
import InvalidSession from "./invalidSession";
import Loading from "./loading";

export const sidebarWidth = "250px";

export default function Sidebar(props) {
	const navigate = useNavigate();

	const [sessionId, setSessionId] = useState(""); // window.location.pathname.split("/")[2]
	const [validSession, setValidSession] = useState(false);
	const [types, setTypes] = useState([]);

	useEffect(() => {
		setSessionId(window.location.pathname.split("/")[2]);
		api.get(`/${secret}/session/exists/${sessionId}`)
			.then((response) => {
				setValidSession(response.data);
				// get other data if is valid session
				if (response.data) {
					api.get(`/${secret}/data/types`)
						.then((response) => {
							setTypes(response.data);
						})
						.catch((error) => {
							console.error("Error fetching data types: ", error);
						});
				}
			})
			.catch((error) => {
				console.error("Error fetching session exists: ", error);
			});
	}, [sessionId]);

	if (validSession == null) {
		return <Loading />;
	}

	const drawer = (
		<div>
			<div
				style={{
					height: "36px",
				}}
			/>
			<ListItemButton
				onClick={() => {
					if (validSession) {
						navigate(`/session/${sessionId}`);
					} else {
						navigate("/");
					}
				}}
			>
				<ListItemText
					primary={
						<Typography
							color={"white"}
							sx={{
								fontFamily: "monospace",
								fontWeight: 700,
							}}
						>
							MineMyths Designer
						</Typography>
					}
				></ListItemText>
			</ListItemButton>
			<Divider />
			{validSession != null && validSession ? (
				<div>
					<List>
						{types.map((type) => (
							<ListItemButton
								key={type}
								onClick={() => {
									navigate(`/session/${sessionId}/${type}`);
								}}
							>
								<ListItemText
									primary={
										<Typography
											color={"white"}
											sx={{
												fontFamily: "monospace",
											}}
										>
											{toTitleCase(type)}
										</Typography>
									}
								/>
							</ListItemButton>
						))}
					</List>
					<Divider />
					<List>
						<ListItemButton
							key={"info"}
							onClick={() => {
								navigate(`/session/${sessionId}/info`);
							}}
						>
							<ListItemText
								primary={
									<Typography
										color={"white"}
										sx={{
											fontFamily: "monospace",
										}}
									>
										Session Info
									</Typography>
								}
							/>
						</ListItemButton>
						<ListItemButton
							key={"info"}
							onClick={() => {
								api.delete(`/${secret}/session/delete/${sessionId}`)
									.then((response) => {
										console.log(response);
										navigate("/");
										window.location.reload();
									})
									.catch((error) => {
										console.error("Error deleting session: ", error);
									});
							}}
						>
							<ListItemText
								primary={
									<Typography
										color={"white"}
										sx={{
											fontFamily: "monospace",
										}}
									>
										Delete Session
									</Typography>
								}
							/>
						</ListItemButton>
					</List>
				</div>
			) : undefined}
		</div>
	);

	const container =
		window !== undefined ? () => window().document.body : undefined;

	return (
		<Drawer
			container={container}
			variant="permanent"
			anchor="left"
			sx={{
				"& .MuiDrawer-paper": {
					boxSizing: "border-box",
					width: sidebarWidth,
				},
				display: "block",
			}}
		>
			{drawer}
		</Drawer>
	);
}
