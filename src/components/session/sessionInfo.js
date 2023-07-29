import { Alert, AlertTitle, Box, Container, Divider, Typography } from "@mui/material";
import { sidebarWidth } from "./sidebar";
import Loading from "./loading";
import InvalidSession from "./invalidSession";
import { useEffect, useState } from "react";
import api, { secret } from "../../app/api";
import { useParams } from "react-router-dom";
import { Title } from "../single/text";

export default function SessionInfo(props) {

    const { sessionId } = useParams();

	const [validSession, setValidSession] = useState(false);
	const [session, setSession] = useState({});

	useEffect(() => {
		api.get(`/${secret}/session/exists/${sessionId}`)
			.then((response) => {
				setValidSession(response.data);

				// get other data if is valid session
				if (response.data) {
					api.get(`/${secret}/session/get/${sessionId}`)
						.then((sessionResponse) => {
                            console.log(sessionResponse.data)
							setSession(sessionResponse.data);
						})
						.catch((error) => {
							console.error("Error fetching session: ", error);
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

	if (!validSession) {
		return <InvalidSession />;
	}

    function renderData(name, value) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    p: 2,
                    gap: 1,
                }}
            >
                <Box
                    sx={{
                        width: "30%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Typography
                    sx={{
                        width: "100%",
                        fontFamily: "monospace",
                        pb: 1,
                        borderBottom: "1px solid #333",
                    }}
                    >
                        {name}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: "70%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Typography
                    sx={{
                        width: "100%",
                        fontFamily: "monospace",
                        pb: 1,
                        borderBottom: "1px solid #333",
                    }}
                    >
                        {value}
                    </Typography>
                </Box>
            </Box>
        )
    }

	return (
		<Container
			maxWidth="xl"
			sx={{
				ml: sidebarWidth,
				p: 5,
			}}
		>
            <Title title="Session Info" />
            <Divider sx={{
                mb: 3,
            }} />
            <Box
                padding={1}
                sx={{
                    border: "1px solid #333",
                    borderRadius: "2px",
                }}
            >
                {renderData("Session ID", session.uuid)}
                {renderData("Session Player", session.playerUUID)}
                {renderData("Last Activity", (`${new Date(session.lastActivity).toLocaleTimeString()}, ${new Date(session.lastActivity).toLocaleDateString()}`))}
                {renderData("Expires At", (`${new Date(session.lastActivity + 5 * 60 * 1000).toLocaleTimeString()}, ${new Date(session.lastActivity + 5 * 60 * 1000).toLocaleDateString()}`))}
            </Box>
        </Container>
	);
}
