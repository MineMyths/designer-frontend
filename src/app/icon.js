import api, { secret } from "./api";

export default async function fetchIcon(type, subtype, material) {
	let iconPromise = null;
	switch (type) {
		case "me.omega.mythstom.rpg.item.items.WeaponItem":
			switch (subtype.split("-").pop().toUpperCase()) {
				case "DAGGER":
				case "MACE":
				case "GREATSWORD":
				case "GREATAXE":
				case "GAUNTLET":
				case "SPEAR":
				case "SCYTHE":
				case "SWORD":
					iconPromise = fetch("wooden_sword");
					break;

				case "BOW":
				case "LONG_BOW":
				case "PISTOL":
				case "RIFLE":
					iconPromise = fetch("iron_sword");
					break;

				case "WAND":
				case "STAFF":
				case "TOME":
					iconPromise = fetch("shears");
					break;

				default:
					iconPromise = fetch("wooden_sword");
					break;
			}
			break;
		default:
			console.log("default");
			iconPromise = fetch(material.replace("minecraft:", ""));
			break;
	}
	return iconPromise;
}

async function fetch(texture) {
	try {
		const response = await api.get(`/${secret}/texture/${texture}`);
		return response;
	} catch (error) {
		console.error("Error fetching icon: ", error);
	}
}
