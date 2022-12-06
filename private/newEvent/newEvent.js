import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

function onlyNumbers(str) {
	return /^[0-9]+$/.test(str);
}

window.addEventListener('load', () => {
	addNavbar();
	loadName();
	document.body.style.display = 'block';
});

document.querySelector('#from-container').addEventListener('submit', async function (e) {
	e.preventDefault();

	const form = e.target;
	const eventName = form.event_name.value;
	const eventVenue = form.event_venue.value || null;
	const startTime = form.event_date_start.value ? new Date(form.event_date_start.value).toISOString() : null;
	const endTime = form.event_date_end.value ? new Date(form.event_date_end.value).toISOString() : null;

	let dataPass = true;

	if (!eventName) {
		dataPass = false;
		alert('Please fill in the event name!');
	}

	const nowTimeValue = new Date().getTime();
	const startTimeValue = new Date(startTime).getTime();
	const endTimeValue = new Date(endTime).getTime();

	// check time validity
	if (startTimeValue && endTimeValue) {
		if (startTimeValue <= nowTimeValue) {
			dataPass = false;
			alert('Start time must be later than time now!');
		} else if (startTimeValue >= endTimeValue) {
			dataPass = false;
			alert('Start time cannot equals or later than end time!');
		}
	} else if (!!startTimeValue + !!endTimeValue) {
		dataPass = false;
		alert('You cannot only leave 1 time blank!');
	}

	if (dataPass) {
		let formObj = {
			eventName,
			eventVenue,
			startTime,
			endTime
		};

		const res = await fetch('/events', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});

		const eventsResult = await res.json();
		if (eventsResult.msg === 'Posted to DB') {
			window.location.href = '/index.html'; //
		}
	}
});
