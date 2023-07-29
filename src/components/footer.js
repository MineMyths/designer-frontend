import { Container, Typography } from "@mui/material";
import { Subtitle } from "./single/text";
import { sidebarWidth } from "./session/sidebar";

export default function Footer() {
	return (
		<Container
			maxWidth="xl"
			sx={{
				ml: sidebarWidth,
				my: 5,
			}}
		>
			<Subtitle subtitle="MineMyths Designer, created my omega" />
			<Typography
				component="a"
				sx={{
					fontFamily: "monospace",
				}}
				color="primary"
				href="https://discord.gg/gpdtjtd2wF"
			>
				https://discord.gg/gpdtjtd2wF
			</Typography>
		</Container>
	);
}
