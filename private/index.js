import { loadEvents } from "./loadEvent.js";

loadEvents()

window.addEventListener('load', () => {
	loadEvents();
});