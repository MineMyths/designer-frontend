import { Alert, AlertTitle, Container } from "@mui/material";
import { sidebarWidth } from "./sidebar";

export default function InvalidSession() {
    return (
        <Container
            maxWidth="xl"
            sx={{
                ml: sidebarWidth,
                p: 5,
            }}
        >
            <Alert
                severity="error"
                sx={{
                    fontFamily: "monospace",
                }}
            >
                <AlertTitle
                    sx={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                    }}
                >
                    Invalid Session
                </AlertTitle>
                The session you are trying to access does not exist. Please
                create a new session in game.
            </Alert>
        </Container>
    );
}