export async function loadEvents() {
	const res = await fetch('/events');

	if (res.status !== 200) {
		const data = await res.json();
		alert(data.msg);
		return;
	}
	const events = await res.json();

	const eventsContainer = document.querySelector('#events-container');

	eventsContainer.innerHTML = '';

	for (let event of events) {
		const today = new Date()
		let status = ""
		if (today > event.date) {
			status = "completed"
		} else {
			status = "In Progress"
		}
		eventsContainer.innerHTML += `
        <tr id="table-header">
            <th scope="col" id="ID_${event.ID}">${event.ID}</th>
            <th scope="col" id="name_${event.ID}">${event.name}</th>
            <th scope="col" id="address_${event.ID}">${event.address}</th>
            <th scope="col" id="date_${event.ID}">${event.date}</th>
            <th scope="col" id="start_time_${event.ID}">${event.start_time}</th>
			<th scope="col" id="end_time_${event.ID}">${event.end_time}</th>
            <th scope="col" id="event_status_${event.ID}">${status}</th>
        </tr>
        `;
    }
}