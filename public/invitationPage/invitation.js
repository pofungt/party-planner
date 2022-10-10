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
		document.querySelector('.event-name-container').innerHTML = `
			<div>
				🎉 ${result.eventDetail.name}
			</div>
		`;

		let dateString = "";
		if (result.eventDetail.start_datetime === "") {
			dateString += "To Be Confirmed";
		} else {
			dateString += `
				<div class="subtitle">
					Start
				</div>
				<div>
					${new Date(result.eventDetail.start_datetime)
						.toLocaleString('en-US', { hour12: false })
						.replace(', ', ' ')
						.slice(0,-3)}
				</div>
				<div class="subtitle">
					End
				</div>
				<div>
					${new Date(result.eventDetail.end_datetime)
						.toLocaleString('en-US', { hour12: false })
						.replace(', ', ' ')
						.slice(0,-3)}
				</div>
			`;
		}
		document.querySelector('.datetime-container').innerHTML = `
			<div class="title">
				Date & Time
			</div>
			<div>
				${dateString}
			</div>
		`;

		document.querySelector('.venue-container').innerHTML = `
			<div class="title">
				Venue
			</div>
			<div>
				${result.eventDetail.venue === "" 
					? "To Be Confirmed" 
					: result.eventDetail.venue}
			</div>
		`;

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