import { Delete } from "@mui/icons-material";
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
		let mappedType;
		if (type.includes("ItemSubType")) {
			mappedType = `me.omega.mythstom.rpg.item.type.ItemSubType-${
				json["category"] === undefined
					? "me.omega.mythstom.rpg.item.type.NoneType"
					: `me.omega.mythstom.rpg.item.type.${toTitleCase(
							json["category"].value
					  )}Type`
			}`;
		} else {
			mappedType = type;
		}
		if (mappings.hasOwnProperty(mappedType)) {
			return mappings[mappedType].split("|");
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
		api.post(
			`/${secret}/data/push/${type}/${json.id.value}/${JSON.stringify(
				json
			)}/${newValue}`
		)
			.then((response) => {
				if (response.status === 200) {
					navigate(`/session/${sessionId}/${type}`);
				}
			})
			.catch((error) => {
				if (error.response.status === 409) {
					alert("A data value already exists with that ID!");
				} else {
					alert("Error saving data! Check console for details.");
				}
				console.error(error);
			});
	}

	function handleChange(event, path, newValue) {
		console.log(path);
		setJson((prevJson) => {
			_.set(prevJson, path, {
				value: newValue !== undefined ? newValue : event.target.value,
				type: properties[path],
				name: path,
			});
			return { ...prevJson };
		});
		console.log(json);
	}

	function renderSelect(name, path, mapped, jsonProperty) {
		const titleCaseName = toTitleCase(name);
		return (
			<FormControl
				required={true}
				component="fieldset"
				sx={{
					width: "100%",
				}}
			>
				<InputLabel id={`${name}-label`}>{titleCaseName}</InputLabel>
				<Select
					labelId={`${name}-label`}
					id={name}
					label={titleCaseName}
					value={
						jsonProperty !== undefined
							? name.includes(" - ")
								? jsonProperty[name.split(" - ")[1]]
								: jsonProperty.value
							: ""
					}
					onChange={(event) => {
						handleChange(event, path);
					}}
				>
					{mapped.map((item) => (
						<MenuItem value={item}>{item}</MenuItem>
					))}
				</Select>
			</FormControl>
		);
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
				prevJson[property].value[key] = defaultValue;
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
						{Object.keys(mapProperty).map((value, index) => {
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
							<InputLabel id={`${name}-add-map-pair`}>
								Add Map Pair - Select Key
							</InputLabel>
							<Select
								labelId={`${name}-add-map-pair`}
								id={name}
								label={"Add Map Pair - Select Key"}
								value={""}
								onChange={(event) => {
									handleAddMapPair(
										name,
										event.target.value,
										valueMapped[0],
										keyType,
										valueType
									);
								}}
							>
								{keyMapped.map((item) => (
									<MenuItem value={item}>{item}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Accordian>
			</Box>
		);
	}

	function renderList(name, jsonProperty) {}

	function renderAutoComplete(name, path, mapped, jsonProperty) {
		const titleCaseName = toTitleCase(name);
		const materialsMapped = mapped.map((item) => {
			return {
				label: item,
				value: item,
			};
		});
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
						// console.log(`Option: ${option}`)
						return option.toString();
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							label={titleCaseName}
							required={true}
						/>
					)}
				>
					{/* {mapped.map((item) => (
						<MenuItem value={item}>{item}</MenuItem>
					))} */}
				</Autocomplete>
			</FormControl>
		);
	}

	function renderFormField(name, path, type, jsonProperty, generics) {
		const titleCaseName = toTitleCase(name);
		const mapped = getMapped(type);
		switch (type) {
			case "kotlin.String":
			case "me.omega.mythstom.rpg.attribute.component.AttributeValue":
			case "kotlin.Int":
				return (
					<TextField
						required={true}
						id={name}
						label={titleCaseName}
						multiline={type === "String"}
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
				return renderSelect(
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
				return renderSelect(name, path, mapped, jsonProperty);
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
