import { Delete, SaveOutlined } from "@mui/icons-material";
import {
	Autocomplete,
	Box,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { secret } from "../../../app/api";
import Accordian from "../../single/accordian";
import { Subtitle, Title } from "../../single/text";
import toTitleCase from "../../util/titleCase";
import InvalidSession from "../invalidSession";
import Loading from "../loading";
import { sidebarWidth } from "../sidebar";

export default function EditMenu(props) {
	const navigate = useNavigate();
	const { type } = props;
	const { sessionId, isNew, jsonText } = useParams();

	const newValue = isNew === "true";

	const [validSession, setValidSession] = useState(false);
	const [json, setJson] = useState(JSON.parse(jsonText));
	const [properties, setProperties] = useState({});
	const [mappings, setMappings] = useState({});

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	function getMapped(type) {
		if (mappings.hasOwnProperty(type)) {
			return mappings[type].split("|");
		}
		return ["*"];
	}

	function handleDelete() {
		api.delete(`/${secret}/data/delete/${type}/${json.id.value}`)
			.then((response) => {
				console.log(response);
			})
			.catch((error) => {
				console.error("Error deleting data: ", error);
			});
		navigate(`/session/${sessionId}/${type}`);
	}

	function handleSave() {
		for (const property in json) {
			if (typeof json[property].type === "string") {
				const mapped = getMapped(json[property].type);
				if (mapped[0] !== "*") {
					if (!mapped.includes(json[property].value)) {
						alert(
							`The value for ${property} is not a valid value. Valid values are: ${mapped.join(
								", "
							)}`
						);
						return;
					}
				}
			}
		}
		console.log(
			`/${secret}/data/push/${type}/${json.id.value}/${JSON.stringify(
				json
			)}/${newValue}`
		);
		api.post(
			`/${secret}/data/push/${type}/${json.id.value}/${JSON.stringify(
				json
			)}/${newValue}`
		)
			.then((response) => {
				console.log(response);
				if (response.status === 200) {
					navigate(`/session/${sessionId}/${type}`);
				}
			})
			.catch((error) => {
				console.log(error);
				if (error.response.status === 409) {
					alert("A data value already exists with that ID!");
				} else {
					alert("Error saving data! Check console for details.");
				}
				console.error(error);
			});
	}

	function handleChange(event, path, newValue, setExtras = true) {
		console.log(path);
		if (setExtras) {
			setJson((prevJson) => {
				_.set(prevJson, path, {
					value:
						newValue !== undefined ? newValue : event.target.value,
					type: properties[path],
					name: path,
				});
				return { ...prevJson };
			});
		} else {
			setJson((prevJson) => {
				_.set(
					prevJson,
					path,
					newValue !== undefined ? newValue : event.target.value
				);
				return { ...prevJson };
			});
		}
		console.log(json);
	}

	function handleAddMapPair(property, key, defaultValue, keyType, valueType) {
		setJson((prevJson) => {
			if (!prevJson.hasOwnProperty(property)) {
				prevJson[property] = {
					type: {
						keyType: keyType,
						valueType: valueType,
						type: "Map",
					},
					name: property,
					value: {
						[key]: defaultValue,
					},
				};
			} else {
				if (prevJson[property].value.hasOwnProperty(key)) {
					return { ...prevJson };
				}
				prevJson[property].value[key] = (defaultValue.length > 1 ? JSON.parse(defaultValue) : defaultValue);
			}
			return { ...prevJson };
		});
	}

	function renderMap(name, path, jsonProperty, generics) {
		const keyType = generics[0];
		const valueType = generics[1];
		const keyMapped = getMapped(keyType);
		const valueMapped = getMapped(valueType);
		if (jsonProperty === undefined) {
			// Put {} into the json as the jsonProperty
			setJson((prevJson) => {
				prevJson[name] = {
					type: {
						keyType: keyType,
						valueType: valueType,
						type: "Map",
					},
					name: name,
					value: {},
				};
				return { ...prevJson };
			});
		}
		const mapProperty =
			jsonProperty === undefined ? {} : jsonProperty["value"];
		let tempPath = path;
		return (
			<Box>
				<Accordian title={toTitleCase(name)}>
					<Box
						sx={{
							m: 2,
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						{Object.keys(mapProperty).map((value) => {
							tempPath = `${path}.value.${value}`;
							return (
								<Box
									sx={{
										display: "flex",
										flexDirection: "row",
										justifyContent: "space-between",
										gap: 1,
									}}
								>
									<Button
										fullWidth
										variant="outlined"
										color="white"
										onClick={() => {
											setJson((prevJson) => {
												delete prevJson[name].value[
													value
												];
												return { ...prevJson };
											});
										}}
									>
										<Delete
											sx={{
												mr: 1,
												mb: 0.5,
											}}
										/>
										{value}
									</Button>
									{renderFormField(
										`${name} - ${value}`,
										tempPath,
										valueType,
										jsonProperty,
										generics
									)}
								</Box>
							);
						})}
						<FormControl
							component="fieldset"
							sx={{
								width: "100%",
							}}
						>
							<Autocomplete
								disablePortal
								id={name}
								value={""}
								options={keyMapped}
								onChange={(event, newValue) => {
									handleAddMapPair(
										name,
										newValue,
										valueMapped[0],
										keyType,
										valueType
									);
								}}
								getOptionLabel={(option) => {
									return option.toString();
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label={"Add Map Pair - Select Key"}
										required={false}
									/>
								)}
							/>
						</FormControl>
					</Box>
				</Accordian>
			</Box>
		);
	}

	function renderAutoComplete(name, path, mapped, jsonProperty) {
		const titleCaseName = toTitleCase(name);
		return (
			<FormControl
				required={true}
				component="fieldset"
				sx={{
					width: "100%",
				}}
			>
				<Autocomplete
					disablePortal
					id={name}
					value={
						jsonProperty !== undefined
							? name.includes(" - ")
								? jsonProperty[name.split(" - ")[1]]
								: jsonProperty.value
							: ""
					}
					options={mapped}
					onChange={(event, newValue) => {
						console.log(event.target.value);
						event.target.value = newValue;
						handleChange(event, path, newValue);
					}}
					getOptionLabel={(option) => {
						return option.toString();
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							label={titleCaseName}
							required={true}
						/>
					)}
				/>
			</FormControl>
		);
	}

	function RenderAttributeValue(props) {
		const { name, path, jsonProperty } = props;

		const [dialogOpen, setDialogOpen] = useState(false);

		const [min, setMin] = useState(
			jsonProperty !== undefined
				? name.includes(" - ")
					? jsonProperty.value[name.split(" - ")[1]].range.minimum
					: jsonProperty.range.minimum
				: ""
		);
		const [max, setMax] = useState(
			jsonProperty !== undefined
				? name.includes(" - ")
					? jsonProperty.value[name.split(" - ")[1]].range.maximum
					: jsonProperty.range.maximum
				: ""
		);
		const [type, setType] = useState(
			jsonProperty !== undefined
				? name.includes(" - ")
					? jsonProperty.value[name.split(" - ")[1]].type
					: jsonProperty.type
				: ""
		);

		console.log(name);
		console.log(jsonProperty);
		console.log(type)

		return (
			<Box
				sx={{
					width: "50%",
				}}
			>
				<Button
					variant="outlined"
					color="white"
					sx={{
						width: "100%",
					}}
					onClick={() => {
						setDialogOpen(true);
					}}
				>
					Edit Value
				</Button>
				<Dialog
					open={dialogOpen}
					onClose={() => {
						setDialogOpen(false);
					}}
				>
					<DialogTitle d="delete-dialog-title">
						Attribute Value - {name}
					</DialogTitle>
					<DialogContent>
						<DialogContentText id="delete-dialog-content">
							Choose the minimum, maximum, and type for this
							value. Numbers can go negative. If you wish for the
							value to never change, set the minimum and maximum
							to the same value.
						</DialogContentText>
					</DialogContent>
					<DialogActions
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 1,
						}}
					>
						<Box
							sx={{
								width: "100%",
								display: "flex",
								flexDirection: "row",
								gap: 1,
							}}
						>
							<TextField
								required={true}
								id={name}
								label={"Range Minimum"}
								type={"number"}
								defaultValue={min}
								onChange={(event) => {
									setMin(event.target.value);
									// handleChange(
									// 	event,
									// 	`${path}.range.minimum`,
									// 	undefined,
									// 	false
									// );
								}}
								sx={{
									width: "100%",
								}}
							/>
							<TextField
								required={true}
								id={name}
								label={"Range Maximum"}
								type={"number"}
								defaultValue={max}
								onChange={(event) => {
									setMax(event.target.value);
									// handleChange(
									// 	event,
									// 	`${path}.range.maximum`,
									// 	undefined,
									// 	false
									// );
								}}
								sx={{
									width: "100%",
								}}
							/>
							<Autocomplete
								disablePortal
								id={`${name}-type`}
								value={type}
								options={["FLAT", "PERCENTAGE"]}
								onChange={(event, newValue) => {
									setType(newValue);
									// handleChange(
									// 	event,
									// 	`${path}.type`,
									// 	newValue,
									// 	false
									// );
								}}
								getOptionLabel={(option) => {
									console.log(option)
									return option;
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label={"Attribute Value Type"}
										required={true}
									/>
								)}
								sx={{
									width: "100%",
								}}
							/>
						</Box>
						<Button
							fullWidth
							size="large"
							variant="outlined"
							onClick={() => {
								setDialogOpen(false);
								handleChange(
									undefined,
									`${path}.range.minimum`,
									min,
									false
								);
								handleChange(
									undefined,
									`${path}.range.maximum`,
									max,
									false
								);
								handleChange(
									undefined,
									`${path}.type`,
									type,
									false
								);
							}}
						>
							Save
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		);
	}

	function renderFormField(name, path, type, jsonProperty, generics) {
		const titleCaseName = toTitleCase(name);
		const mapped = getMapped(type);
		switch (type) {
			case "me.omega.mythstom.rpg.attribute.component.AttributeValue":
				return (
					<RenderAttributeValue
						name={name}
						titleCaseName={titleCaseName}
						mapped={mapped}
						path={path}
						jsonProperty={jsonProperty}
					/>
				);
			case "kotlin.String":
			case "kotlin.Int":
				return (
					<TextField
						required={true}
						id={name}
						label={titleCaseName}
						multiline={type === "kotlin.String"}
						type={type !== "kotlin.String" ? "number" : "text"}
						defaultValue={
							jsonProperty !== undefined
								? name.includes(" - ")
									? jsonProperty.value[name.split(" - ")[1]]
									: jsonProperty.value
								: ""
						}
						onChange={(event) => {
							handleChange(event, path);
						}}
						fullWidth
					/>
				);
			case "kotlin.Boolean":
				return renderAutoComplete(
					name,
					path,
					["true", "false"],
					jsonProperty
				);
			case "kotlin.collections.Map":
				return renderMap(name, path, jsonProperty, generics);
			case "kotlin.collections.List":
				return <div></div>;
			case "net.minestom.server.item.Material":
				return renderAutoComplete(name, path, mapped, jsonProperty);
			default:
				return renderAutoComplete(name, path, mapped, jsonProperty);
		}
	}

	// ensure is a valid session
	useEffect(() => {
		api.get(`/${secret}/session/exists/${sessionId}`)
			.then((response) => {
				setValidSession(response.data);
				// get other data if is valid session
				if (response.data) {
					api.get(`/${secret}/data/properties/${type}`)
						.then((propertiesResponse) => {
							setProperties(propertiesResponse.data);
						})
						.catch((error) => {
							console.error(
								"Error fetching data properties: ",
								error
							);
						});

					api.get(`/${secret}/data/mappings`)
						.then((mappingsResponse) => {
							setMappings(mappingsResponse.data);
						})
						.catch((error) => {
							console.error(
								"Error fetching data mappings: ",
								error
							);
						});
				}
			})
			.catch((error) => {
				console.error("Error fetching session exists: ", error);
			});
	}, [sessionId, type]);

	if (validSession === null || properties === null || mappings === null) {
		return <Loading />;
	}

	if (!validSession) {
		return <InvalidSession />;
	}

	return (
		<Container
			maxWidth="xl"
			sx={{
				ml: sidebarWidth,
			}}
		>
			{newValue ? (
				<Title
					title={`Creating New ${toTitleCase(type).substring(
						0,
						type.length - 1
					)}`}
				/>
			) : (
				<Title
					title={`Editting ${toTitleCase(type).substring(
						0,
						type.length - 1
					)}: ${json.id.value}`}
				/>
			)}
			<Subtitle subtitle={`Make sure you save your changes!`} />
			<Button
				variant="outlined"
				sx={{
					mt: 2,
					mr: 2,
				}}
				onClick={() => {
					navigate(`/session/${sessionId}/${type}`);
				}}
			>
				Go Back
			</Button>
			<Button
				variant="outlined"
				sx={{
					mt: 2,
					mr: 2,
				}}
				onClick={() => {
					navigate(
						`/session/${sessionId}/${type}/edit/true/${JSON.stringify(
							json
						)}`
					);
				}}
			>
				Clone Data
			</Button>
			<Divider
				sx={{
					my: 2,
				}}
			/>
			{/** start of the form */}
			<Box
				component={"form"}
				autoComplete="off"
				sx={{
					width: "50%",
				}}
				onSubmit={(event) => {
					event.preventDefault();
					handleSave();
				}}
			>
				<Button type="submit" variant="outlined" fullWidth>
					Save
				</Button>
				{Object.keys(properties).map((propertyName) => {
					const name = propertyName;
					if (!newValue && name === "id") {
						return undefined;
					}
					const propertyType = properties[propertyName].split("?")[0];
					let generics = null;
					if (properties[propertyName].includes("?")) {
						generics = properties[propertyName]
							.split("?")[1]
							.split(",");
					}
					const jsonProperty = json[name];
					return (
						<Box
							sx={{
								mt: 2,
							}}
							key={propertyName}
						>
							{renderFormField(
								name,
								name,
								propertyType,
								jsonProperty,
								generics
							)}
						</Box>
					);
				})}
			</Box>
			{/** end of the form */}
			<Divider
				sx={{
					my: 2,
				}}
			/>
			{!newValue ? (
				<div>
					<Button
						variant="outlined"
						color="error"
						fullWidth
						onClick={() => {
							setDeleteDialogOpen(true);
						}}
					>
						Delete
					</Button>
					<Dialog
						open={deleteDialogOpen}
						onClose={() => {
							setDeleteDialogOpen(false);
						}}
					>
						<DialogTitle d="delete-dialog-title">
							Confirm Delete
						</DialogTitle>
						<DialogContent>
							<DialogContentText id="delete-dialog-content">
								Are you sure you want to delete this value? This
								action is irreversible.
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								color="white"
								onClick={() => {
									setDeleteDialogOpen(false);
								}}
							>
								Cancel
							</Button>
							<Button
								color="error"
								onClick={() => {
									setDeleteDialogOpen(false);
									handleDelete();
								}}
							>
								Delete
							</Button>
						</DialogActions>
					</Dialog>
				</div>
			) : undefined}
		</Container>
	);
}
