import { loadCreateEvents, loadParticipateEvents } from "./loadEvent.js";

window.addEventListener('load', () => {
	loadCreateEvents();
	loadParticipateEvents();
});