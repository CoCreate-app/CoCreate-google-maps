import Observer from "@cocreate/observer";

const name = "google-maps";
const GOOGLE_API_KEY = "AIzaSyCXRaA3liul4_0D5MXLybx9s3s_o_Q2opI";
let scriptLoaded = false;

// Track already loaded libraries
const loadedLibraries = new Set();

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
	if (loadedLibraries.has(library)) {
		console.log(`Library "${library}" is already loaded.`);
		return; // Skip if already loaded
	}

	try {
		await window.google.maps.importLibrary(library);
		loadedLibraries.add(library);
		console.log(`Loaded library: ${library}`);
	} catch (error) {
		console.error(`Failed to load library "${library}":`, error);
	}
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
				CoCreate.api.setData({ name, method, form }, data);
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
	observe: ["addedNodes"],
	selector: name,
	callback: function (mutation) {
		initElements(mutation.target);
	}
});

init();

export default { init };
