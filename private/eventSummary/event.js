import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';
import { loadEventDetails } from '../loadEvent.js';
import { deletedParticipantsList } from '../listenButtons.js';

window.addEventListener('load', () => {
	addNavbar();
	loadName();
	loadEventDetails();
	document.body.style.display = 'block';
});

// Submit datetime form
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

// Submit venue form
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

// Submit participants form

document.querySelector('#participants-submit').addEventListener('click', async ()=> {
  const params = new URLSearchParams(window.location.search);
	const eventId = parseInt(params.get('event-id'));
    const reqBodyObj = {
      eventId,
      deletedParticipantsList
    }
  	const res = await fetch(`/events/participants/${eventId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(reqBodyObj)
	});
  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const result = await res.json();
  if (result.status) {
    if (result.notDeletable.length) {
      let warnText = "Unable to remove following participant(s):";
      for (let each of result.notDeletable) {
        warnText += `
    # ${each.deletedParticipant.id} ${each.deletedParticipant.first_name} ${each.deletedParticipant.last_name}
    Unsettled Item(s):`;
        for (let i = 0; i < each.itemInCharge.length; i++) {
          warnText += `
          [${each.itemInCharge[i].type_name}] ${each.itemInCharge[i].name}`;
        }
        warnText += `

        `;
      }
      alert(warnText);
      deletedParticipantsList.splice(0,deletedParticipantsList.length);
      loadEventDetails();
      //Warn
    } else {
      deletedParticipantsList.splice(0,deletedParticipantsList.length);
      loadEventDetails();
      alert("Successfully deleted all selected participants!");
    }
  } else {
    alert("Unable to delete selected participants!");
  }
})


