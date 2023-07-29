import { Typography } from "@mui/material";

export function Title(props) {
    const { title } = props;
    return (
        <Typography
            component="h1"
            sx={{
                mb: 1,
                mt: 2,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 1,
                color: "inherit",
                textDecoration: "none",
                fontSize: "60px"
            }}
        >
            {title}
        </Typography>
    );
}

export function Subtitle(props) {
    const { subtitle } = props;
    return (
        <Typography
            component="p"
            sx={{
                fontFamily: "monospace"
            }}
        >
            {subtitle}
        </Typography>
    );
}