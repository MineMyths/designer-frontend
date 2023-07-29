import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    contrastThreshold: 4.5,
    mode: "dark",

    primary: {
      main: "#B388FF",
    },
    secondary: {
      main: "#009bff",
    },
    white: {
      main: "#ffffff",
      background: "#222222",
    }
  },
});
