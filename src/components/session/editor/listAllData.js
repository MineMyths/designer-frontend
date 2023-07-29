import {
	Box,
	Button,
	Container,
	Divider,
	Pagination,
	TextField,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { secret } from "../../../app/api";
import fetchIcon from "../../../app/icon";
import { Subtitle, Title } from "../../single/text";
import toTitleCase from "../../util/titleCase";
import InvalidSession from "../invalidSession";
import Loading from "../loading";
import { sidebarWidth } from "../sidebar";

const usePagination = (data, itemsPerPage) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemCount, setItemCount] = useState(0);
	const getCurrentData = () => {
		return data;
	};
	const getPageCount = () => {
		return Math.ceil(itemCount / itemsPerPage);
	};
	const setPaginationData = (d) => {
		data = d;
	};
	return {
		currentPage,
		getCurrentData,
		setCurrentPage,
		getPageCount,
		setPaginationData,
		setItemCount,
	};
};

export default function ListAllData(props) {
	const navigate = useNavigate();
	const { type } = props;
	const { sessionId } = useParams();

	const [loading, setLoading] = useState(true);
	const [validSession, setValidSession] = useState(false);
	const [data, setData] = useState([]);
	const [displayedData, setDisplayedData] = useState([]);

	const [reload, setReload] = useState(false); // used to force reload
	const [filter, setFilter] = useState("");

	const {
		currentPage,
		getCurrentData,
		setCurrentPage,
		getPageCount,
		setPaginationData,
		setItemCount,
	} = usePagination(displayedData, 8, 0);

	function navigateToEdit(sessionId, type, isNew, json) {
		navigate(
			`/session/${sessionId}/${type}/edit/${isNew}/${JSON.stringify(
				json
			)}`
		);
	}

	useEffect(() => {
		setDisplayedData([]);
		setLoading(true);

		const amount = 8;
		const startIndex = (currentPage - 1) * amount;

		api.get(`/${secret}/session/exists/${sessionId}`)
			.then((response) => {
				setValidSession(response.data);
				// get other data if is valid session
				if (response.data) {
					api.get(
						`/${secret}/data/get/${type}/${amount}/${startIndex}/${filter}`
					)
						.then((dataResponse) => {
							console.log(dataResponse.data);
							setData(dataResponse.data);

							// map returns an array of promises
							const iconPromises = dataResponse.data.map(
								(value, index) => {
									const json = JSON.parse(value.value);
									const valueType = value.type;

									return fetchIcon(
										valueType,
										json.subtype.value,
										json.material.value
									)
										.then((iconResponse) => {
											let icon = iconResponse.data;
											let tempComponent = null;
											if (
												valueType.includes(
													"me.omega.mythstom.rpg.item.items"
												)
											) {
												tempComponent = (
													<Button
														color="white"
														variant="outlined"
														key={index}
														sx={{
															p: 3,
															textTransform:
																"none",
															textAlign: "right",
															fontFamily:
																"monospace",
														}}
														onClick={() => {
															navigateToEdit(
																sessionId,
																type,
																false,
																json
															);
														}}
													>
														<Box
															component={"img"}
															src={icon}
															sx={{
																height: "100px",
																width: "100px",
																imageRendering:
																	"pixelated",
															}}
														/>
														<Box ml={2}>
															Item ID:{" "}
															{json.id.value}
															<br />
															Item Name:{" "}
															{json.name.value}
															<br />
															Item Category:{" "}
															{
																json.category
																	.value
															}
															<br />
															Item Subtype:{" "}
															{json.subtype.value
																.split("-")
																.pop()
																.toUpperCase()}
														</Box>
													</Button>
												);
											} else {
												tempComponent = (
													<div key={json.id}>
														Invalid Type
													</div>
												);
											}
											return tempComponent;
										})
										.catch((error) => {
											console.error(
												"Error fetching icon: ",
												error
											);
										});
								}
							);

							// wait for all promises to resolve
							Promise.all(iconPromises)
								.then((tempData) => {
									api.get(
										`/${secret}/data/count/${type}/${filter}`
									)
										.then((countResponse) => {
											setItemCount(countResponse.data);
											setDisplayedData(tempData);
											setPaginationData(tempData);
											setLoading(false);
										})
										.catch((error) => {
											console.error(
												"Error fetching total count: ",
												error
											);
										});
								})
								.catch((error) => {
									console.error(
										"Error processing icons: ",
										error
									);
								});
						})
						.catch((error) => {
							console.error("Error fetching data types: ", error);
						});
				}
			})
			.catch((error) => {
				console.error("Error fetching session exists: ", error);
			});
	}, [sessionId, type, currentPage, reload]);

	if (!validSession) {
		return <InvalidSession />;
	}

	if (
		loading ||
		validSession == null ||
		data == null ||
		displayedData == null
	) {
		return <Loading />;
	}

	return (
		<Container
			maxWidth="xl"
			sx={{
				ml: sidebarWidth,
			}}
		>
			<Title title={`Viewing ${toTitleCase(type)}`} />
			<Subtitle subtitle="Click on an item to start editing it." />
			<Button
				variant="outlined"
				sx={{
					mt: 2,
					mr: 2,
					fontFamily: "monospace",
				}}
				onClick={() => {
					navigateToEdit(sessionId, type, true, {});
				}}
			>
				Create New
			</Button>
			<Button
				variant="outlined"
				sx={{
					mt: 2,
					mr: 2,
					fontFamily: "monospace",
				}}
				onClick={() => {
					setReload(!reload);
				}}
			>
				Reload
			</Button>
			<Divider
				sx={{
					my: 2,
				}}
			/>
			<TextField
				id="id-filter"
				label="Filter by ID"
				value={filter}
				onChange={(event) => {
					setFilter(event.target.value);
				}}
			/>
			<Divider
				sx={{
					my: 2,
				}}
			/>
			<Grid2 container spacing={4} justify="center" alignItems="center">
				{getCurrentData().map((data, index) => (
					<Grid2 xs={3} key={index}>
						{data}
					</Grid2>
				))}
			</Grid2>
			<Pagination
				count={getPageCount()}
				page={currentPage}
				onChange={(event, value) => setCurrentPage(value)}
				sx={{
					mt: 2,
				}}
			/>
		</Container>
	);
}
