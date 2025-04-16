import Observer from "@cocreate/observer";
import Actions from "@cocreate/actions";
import Api from "@cocreate/api";

const name = "google-maps";
const GOOGLE_API_KEY = "AIzaSyCXRaA3liul4_0D5MXLybx9s3s_o_Q2opI";
let scriptLoaded = false;

// Track already loaded libraries
const loadedLibraries = new Map();

async function init() {
	await loadGoogleMaps(); // Load core script
	initElements(); // Initialize elements after loading core
}

// Load Google Maps script initially (core only)
function loadGoogleMaps() {
	return new Promise((resolve, reject) => {
		if (scriptLoaded) {
			resolve(window.google.maps);
			return;
		}

		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}`;
		script.async = true;
		script.defer = true;

		script.onload = () => {
			scriptLoaded = true;
			console.log("Google Maps core script loaded successfully.");
			resolve(window.google.maps);
		};

		script.onerror = () =>
			reject(new Error("Failed to load Google Maps core script."));

		document.head.appendChild(script);
	});
}

// Load additional libraries dynamically using importLibrary
async function loadLibrary(library) {
	// Check if the library's promise is already stored in the Map
	if (loadedLibraries.has(library)) {
		return loadedLibraries.get(library); // Return the existing promise
	}

	// Attempt to load the library using the `importLibrary`
	const libraryPromise = window.google.maps
		.importLibrary(library)
		.then(() => {
			console.log(
				`Google Maps library "${library}" loaded successfully.`
			);
			loadedLibraries.set(library, libraryPromise); // Confirm the library is loaded by storing the promise
			return window.google.maps[library]; // Return the loaded library instance if you need it
		})
		.catch((error) => {
			console.error(
				`Failed to load Google Maps library "${library}":`,
				error
			);
			loadedLibraries.delete(library); // Remove the library if loading failed
			throw error; // Rethrow the error for further handling
		});

	// Store the promise in the Map for caching
	loadedLibraries.set(library, libraryPromise);

	// Await the resolution of the library before returning
	const resolvedLibrary = await libraryPromise;
	return resolvedLibrary;
}

// Initialize Google Maps elements dynamically
function initElements(element) {
	if (
		element &&
		!(element instanceof HTMLCollection) &&
		!(element instanceof NodeList) &&
		!Array.isArray(element)
	)
		element = [element];
	else if (!element) {
		element = document.querySelectorAll(`[${name}]`);
	}

	if (!google || !google.maps) {
		console.error("Google Maps API not loaded properly.");
		return;
	}

	for (let i = 0; i < element.length; i++) {
		const method = element[i].getAttribute(name);
		const key = element[i].getAttribute(`${name}-key`);

		if (googleMapsHandlers[method]) {
			googleMapsHandlers[method](method, element[i], key);
		} else {
			console.warn(`No handler registered for ${name} type: ${method}`);
		}
	}
}

// Generic handler registry
const googleMapsHandlers = {
	places: async (method, element, key) => {
		await loadLibrary(method); // Ensure the Places library is loaded
		if (key === "autocomplete") {
			const autocomplete = new google.maps.places.Autocomplete(element);
			autocomplete.addListener("place_changed", () => {
				const data = { [name]: autocomplete.getPlace() };
				let form = element.closest("form");
				CoCreate.api.setData({ name, method, form, data });
			});
		}
	},
	maps: async (method, element, key) => {
		await loadLibrary("maps"); // Ensure the Maps library is loaded

		// Process only elements with google-maps-key="map"
		if (key === "map") {
			const form = element.closest("form");

			// Generate the options object from the form and element attributes
			const data = await CoCreate.api.getData({
				name,
				method,
				element,
				form
			});

			// Create the Google Map
			new google.maps.Map(element, data);
		} else {
			console.warn(
				`Element with key "${key}" is not eligible for Map rendering.`
			);
		}
	},
	roads: async (element) => {
		await loadLibrary("roads"); // Ensure the Roads library is loaded
		console.log("Initialize Roads API for:", element);
	}
};

googleMapsHandlers.geocoder = async (action) => {
	if (typeof action === "string") return;
	let { method, element, key } = action;

	await loadLibrary("geocoding"); // Ensure the Geocoding library is loaded

	const geocoder = new google.maps.Geocoder();

	// Fetch the data directly from the form or element
	const form = element.closest("form");
	const data = await CoCreate.api.getData({ name, method, element, form });

	// Directly pass the data to geocoder.geocode()
	geocoder.geocode(data, (response, status) => {
		if (status === "OK" && response[0]) {
			const data = {
				[name]: { response }
			};
			CoCreate.api.setData({
				name,
				method,
				form,
				data
			});
			dispatchEvent(action);
		} else {
			console.error(`Geocoding failed with status: ${status}`);
		}
	});
};

function dispatchEvent(action) {
	action.element.dispatchEvent(
		new CustomEvent(action.endEvent, {
			detail: {
				data: action
			}
		})
	);
}

function getOrCreateMap(element, options = {}) {
	// Check if this element already has a map instance
	if (element.googleMapInstance) {
		return element.googleMapInstance;
	}

	// Fallback: Find an existing map in the same form or document
	const form = element.closest("form");
	const mapElement =
		form?.querySelector('[google-maps="maps"][google-maps-key="map"]') ||
		document.querySelector('[google-maps="maps"][google-maps-key="map"]');

	if (mapElement?.googleMapInstance) {
		return mapElement.googleMapInstance;
	}

	// If no map exists, initialize a new one
	const map = new google.maps.Map(element, options);
	element.googleMapInstance = map; // Store the instance on the element
	console.log("New map instance created:", map);
	return map;
}

Observer.init({
	name: "CoCreateElementsChildList",
	types: ["addedNodes"],
	selector: name,
	callback: function (mutation) {
		initElements([mutation.target]);
	}
});

// Actions Integration
Actions.init([
	{
		name: "googlemaps",
		endEvent: "googlemaps",
		callback(action) {
			googleMapsHandlers[action.method](action);
		}
	}
]);

init();

export default { init };
