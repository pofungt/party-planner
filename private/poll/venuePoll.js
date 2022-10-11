import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
	addNavbar();
	await loadName();
    await loadOptions();
	document.body.style.display = 'block';
});

async function loadOptions() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const res = await fetch(`/events/poll/venue/${eventId}`);
    const result = await res.json();
    
}