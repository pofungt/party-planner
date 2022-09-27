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
		eventsContainer.innerHTML += `
        <tr id="table-header">
            <th scope="col">${event.ID}</th>
            <th scope="col">${event.name}</th>
            <th scope="col">${event.address}</th>
            <th scope="col">${event.date}</th>
            <th scope="col">${event.time}</th>
            <th scope="col">${event.status}</th>
        </tr>
        `;
    }
}