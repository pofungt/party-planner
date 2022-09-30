export async function loadEvents() {
	const res = await fetch('/events');

	if (res.status !== 200) {
		const data = await res.json();
		alert(data.msg);
		return;
	}
	const events = await res.json();

	const eventsCreateContainer = document.querySelector('.create #events-container');

	eventsCreateContainer.innerHTML = '';

	for (let event of events) {
		const date = new Date();
		const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                date.getUTCDate(), date.getUTCHours(),
                date.getUTCMinutes(), date.getUTCSeconds());
		const eventDate = new Date(event.date);
		let status = ""
		if (today > eventDate) {
			status = "Completed"
		} else {
			status = "In Progress"
		}
		eventsCreateContainer.innerHTML += `
        <tr id="table-header">
            <th scope="col" id="ID_${event.id}">${event.id}</th>
            <th scope="col" id="name_${event.id}">${event.name}</th>
            <th scope="col" id="address_${event.id}">${event.venue}</th>
            <th scope="col" id="date_${event.id}">${eventDate.toDateString().slice(4)}</th>
            <th scope="col" id="start_time_${event.id}">${event.start_time.slice(0,5)}</th>
			<th scope="col" id="end_time_${event.id}">${event.end_time.slice(0,5)}</th>
            <th scope="col" id="event_status_${event.id}">${status}</th>
        </tr>
        `;
    }
}