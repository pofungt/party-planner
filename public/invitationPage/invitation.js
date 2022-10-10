import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
	await checkInvitationValidity();
});

async function checkInvitationValidity() {
	const params = new URLSearchParams(window.location.search);
	const eventId = params.get('event-id');
	const token = params.get('token');
	const res = await fetch(`/events/detail/participation/${eventId}/${token}`, {
		method: "POST"
	});
	const result = await res.json();
	if (result.status) {
		addNavbar();
		await loadName();
		
		// Load invitation page content

		document.body.style.display = 'block';
	} else {
		if (result.login) {
			alert('Invitation link is invalid or expired!');
			window.location.href = '/index.html';
		} else {
			alert('Please log in or register to join event!');
			window.location.href = `/?event-id=${eventId}&token=${token}`;
		}
	}
}