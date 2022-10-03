import {listenCreateButtons, listenParticipateButtons} from "./listenButtons.js";

export async function loadCreateEvents(page) {
  const res = await fetch(`/events/created?page=${page}`);

  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const events = await res.json();

  const eventsCreateContainer = document.querySelector(
    ".create #events-container"
  );
  const pageCreateContainer = document.querySelector(".create .turn-page-button-container");

  eventsCreateContainer.innerHTML = "";

  for (let event of events) {
    const today = (new Date()).getTime();
    const eventStartDate = (new Date(event.start_datetime)).getTime();
    let status = "";
    if (today > eventStartDate) {
      status = "Completed";
    } else {
      status = "In Progress";
    }
    eventsCreateContainer.innerHTML += `
        <tr id="table-header">
            <th scope="col" id="ID_${event.id}">${event.id}</th>
            <th scope="col" id="name_${event.id}">${event.name}</th>
            <th scope="col" id="address_${event.id}">${event.venue}</th>
            <th scope="col" id="start_datetime_${event.id}">${(new Date(event.start_datetime)).toLocaleString('en-US', {hour12: false,})}</th>
			      <th scope="col" id="end_datetime_${event.id}">${(new Date(event.end_datetime)).toLocaleString('en-US', {hour12: false,})}</th>
            <th scope="col" id="event_status_${event.id}">${status}</th>
        </tr>
        `;
  }
  pageCreateContainer.innerHTML = `
    <button type="button" class="previous-round btn btn-light">&lt;</button>
    <button type="button" class="next-round btn btn-light">&gt;</button>
    Page ${page}
  `;
  listenCreateButtons();
}

export async function loadParticipateEvents(page) {
  const res = await fetch(`/events/participated?page=${page}`);

  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const events = await res.json();

  const eventsParticipateContainer = document.querySelector(
    ".participate #events-container"
  );
  const pageParticipateContainer = document.querySelector(".participate .turn-page-button-container");

  eventsParticipateContainer.innerHTML = "";

  for (let event of events) {
    const today = (new Date()).getTime();
    const eventStartDate = (new Date(event.start_datetime)).getTime();
    let status = "";
    if (today > eventStartDate) {
      status = "Completed";
    } else {
      status = "In Progress";
    }
    eventsParticipateContainer.innerHTML += `
        <tr id="table-header">
            <th scope="col" id="ID_${event.id}">${event.id}</th>
            <th scope="col" id="name_${event.id}">${event.name}</th>
            <th scope="col" id="address_${event.id}">${event.venue}</th>
            <th scope="col" id="start_datetime_${event.id}">${(new Date(event.start_datetime)).toLocaleString('en-US', {hour12: false,})}</th>
			      <th scope="col" id="end_datetime_${event.id}">${(new Date(event.end_datetime)).toLocaleString('en-US', {hour12: false,})}</th>
            <th scope="col" id="event_status_${event.id}">${status}</th>
        </tr>
        `;
  }
  pageParticipateContainer.innerHTML = `
    <button type="button" class="previous-round btn btn-light">&lt;</button>
    <button type="button" class="next-round btn btn-light">&gt;</button>
    Page ${page}
  `;
  listenParticipateButtons();
}
