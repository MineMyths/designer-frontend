import { Alert, AlertTitle, CircularProgress, Container } from "@mui/material";
import { sidebarWidth } from "./sidebar";

export default function Loading() {
    return (
        <Container
            maxWidth="xl"
            sx={{
                ml: sidebarWidth,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: `calc(100vw - ${sidebarWidth})`,
            }}
        >
            <CircularProgress />
        </Container>
    );
}