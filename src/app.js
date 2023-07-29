import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
	BrowserRouter,
	Outlet,
	Route,
	Routes,
	useLocation,
} from "react-router-dom";
import Home from "./components/home";
import { theme } from "./theme";

import "./app.css";
import api, { secret } from "./app/api";
import Footer from "./components/footer";
import EditMenu from "./components/session/editor/edit";
import ListAllData from "./components/session/editor/listAllData";
import Sidebar from "./components/session/sidebar";
import SessionInfo from "./components/session/sessionInfo";

function AppContent() {
	const [types, setTypes] = useState([]);

	useEffect(() => {
		api.get(`/${secret}/data/types`)
			.then((response) => {
				setTypes(response.data);
			})
			.catch((error) => {
				console.error("Error fetching data types: ", error);
			});
	}, []);

	return (
		<>
			<Sidebar isSession={useLocation().pathname.includes("/session/")} />
			<Routes>
				<Route path="/" element={<Outlet />}>
					<Route path="*" element={<Home />} />
					<Route path="/" element={<Home />} />
					<Route
						path="/session/:sessionId/info"
						element={<SessionInfo />}
					/>
					{types.map((type) => (
						<Route
							key={type}
							path={`/session/:sessionId/${type}`}
							element={<ListAllData type={type} />}
						/>
					))}
					{types.map((type) => (
						<Route
							key={`${type}-edit`}
							path={`/session/:sessionId/${type}/edit/:isNew/:jsonText`}
							element={<EditMenu type={type} />}
						/>
					))}
				</Route>
			</Routes>
			<Footer />
		</>
	);
}

export default function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<AppContent />
			</BrowserRouter>
		</ThemeProvider>
	);
}
