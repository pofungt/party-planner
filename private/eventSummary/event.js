import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';
import { loadEventDetails } from './loadEvent.js';

window.addEventListener('load', () => {
	addNavbar();
	loadName();
	loadEventDetails();
	document.body.style.display = 'block';
});

document.querySelector('#datetime-form').addEventListener('submit', async function (e) {
	e.preventDefault();
	const form = e.target;
	const startTime = form.datetime - start.value ? new Date(form.datetime - start.value).toISOString() : null;
	const endTime = form.datetime - end.value ? new Date(form.datetime - end.value).toISOString() : null;
	const startTimeValue = new Date(startTime).getTime();
	const endTimeValue = new Date(endTime).getTime();

	let dataPass = true;

	if (startTimeValue && endTimeValue) {
		if (startTimeValue >= endTimeValue) {
			dataPass = false;
			alert('Start time cannot equals or later than end time!');
		}
	} else if (!!startTimeValue + !!endTimeValue) {
		dataPass = false;
		alert('You cannot only leave 1 time blank!');
	}

	if (dataPass) {
		const formObj = {
			startTime,
			endTime
		};
		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const res = await fetch(`/events/detail/datetime/${eventId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});

		const eventsResult = await res.json();
		if (eventsResult.status) {
			alert('Date & Time successfully updated!');
			const myModal = bootstrap.Modal.getInstance(document.getElementById('datetime-modal'));
			myModal.hide();
			loadEventDetails();
		} else {
			alert('Unable to update.');
		}
	}
});

document.querySelector('#venue-form').addEventListener('submit', async function (e) {
	e.preventDefault();
	const form = e.target;
	const venue = form.venue.value;

	let dataPass = true;

	if (!venue) {
		dataPass = false;
		alert('Please enter new venue to update!');
	}

	if (dataPass) {
		const formObj = {
			venue
		};
		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const res = await fetch(`/events/detail/venue/${eventId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});

		const eventsResult = await res.json();
		if (eventsResult.status) {
			alert('Venue successfully updated!');
			const myModal = bootstrap.Modal.getInstance(document.getElementById('venue-modal'));
			myModal.hide();
			loadEventDetails();
		} else {
			alert('Unable to update.');
		}
	}
});
