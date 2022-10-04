import {listenCreateButtons, listenParticipateButtons} from "/functions/listenButtons.js";

export async function loadName() {
  const res = await fetch(`/login/name`);
  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const result = await res.json();
  if (result.status) {
    const nameHTML = document.querySelector(".user-login button");
    nameHTML.innerHTML = `<i class="bi bi-person-circle"></i>${result.user}`;
  }
}

export async function loadCreateEvents(page) {
  const res = await fetch(`/events/created?page=${page}`);

  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const result = await res.json();
  const events = result.object;
  const currentPage = result.currentPage;
  const totalPage = result.page;

  const eventsCreateContainer = document.querySelector(
    ".create .events-container"
  );
  const pageCreateContainer = document.querySelector(".create .turn-page-button-container");

  let eventsCreateHTML = "";

  for (let event of events) {
    const today = (new Date()).getTime();
    const eventStartDate = (new Date(event.start_datetime)).getTime();
    let status = "";
    let statusClass = "";
    if (today > eventStartDate) {
      status = "Completed";
      statusClass = "completedStatus"
    } else {
      status = "Processing";
      statusClass = "progressStatus"
    }
    eventsCreateHTML += `
    <tr class="table-content-row">
      <th scope="col" class="ID_${event.id}">
        <div>${event.id}</div>
      </th>
      <th scope="col" class="name_${event.id}">
        <div>${event.name}</div>
      </th>
      <th scope="col" class="address_${event.id}">
        <div>${event.venue}</div>
      </th>
      <th scope="col" class="start_datetime_${event.id}">
        <div>${(new Date(event.start_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
      </th>
      <th scope="col" class="end_datetime_${event.id}">
        <div>${(new Date(event.end_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
      </th>
      <th scope="col" class="event_status_${event.id}">
        <div><div class="${statusClass}">${status}</div></div>
      </th>
      <th scope="col" class="detail_${event.id}">
        <div>
          <div class="edit-button">
            <i class="fa-regular fa-pen-to-square"></i>
          </div>
        </div>
      </th>
    </tr>
`;
  }
  const pageHTML = !totalPage ? "" : `Showing ${currentPage} of ${totalPage}`;
  eventsCreateContainer.innerHTML = eventsCreateHTML;
  pageCreateContainer.innerHTML = `
    <div class="page-number">${pageHTML}</div>
    <button type="button" class="previous-round btn btn-light">
      <i class="fa-sharp fa-solid fa-less-than"></i>
    </button>
    <button type="button" class="next-round btn btn-light">
      <i class="fa-sharp fa-solid fa-greater-than"></i>
    </button>
  `;
  listenCreateButtons();
  return currentPage;
}

export async function loadParticipateEvents(page) {
  const res = await fetch(`/events/participated?page=${page}`);

  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const result = await res.json();
  const events = result.object;
  const currentPage = result.currentPage;
  const totalPage = result.page;

  const eventsParticipateContainer = document.querySelector(
    ".participate .events-container"
  );
  const pageParticipateContainer = document.querySelector(".participate .turn-page-button-container");

  let eventsParticipateHTML = "";

  for (let event of events) {
    const today = (new Date()).getTime();
    const eventStartDate = (new Date(event.start_datetime)).getTime();
    let status = "";
    let statusClass = "";
    if (today > eventStartDate) {
      status = "Completed";
      statusClass = "completedStatus"
    } else {
      status = "Processing";
      statusClass = "progressStatus"
    }
    eventsParticipateHTML += `
        <tr class="table-content-row">
            <th scope="col" class="ID_${event.id}">
              <div>${event.id}</div>
            </th>
            <th scope="col" class="name_${event.id}">
              <div>${event.name}</div>
            </th>
            <th scope="col" class="address_${event.id}">
              <div>${event.venue}</div>
            </th>
            <th scope="col" class="start_datetime_${event.id}">
              <div>${(new Date(event.start_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
            </th>
			      <th scope="col" class="end_datetime_${event.id}">
              <div>${(new Date(event.end_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
            </th>
            <th scope="col" class="event_status_${event.id}">
              <div><div class="${statusClass}">${status}</div></div>
            </th>
            <th scope="col" class="detail_${event.id}">
            <div>
              <div class="edit-button">
                <i class="fa-regular fa-pen-to-square"></i>
              </div>
            </div>
          </th>
        </tr>
        `;
  }
  const pageHTML = !totalPage ? "" : `Showing ${currentPage} of ${totalPage}`;
  eventsParticipateContainer.innerHTML = eventsParticipateHTML;
  pageParticipateContainer.innerHTML = `
    <div class="page-number">${pageHTML}</div>
    <button type="button" class="previous-round btn btn-light">
      <i class="fa-sharp fa-solid fa-less-than"></i>
    </button>
    <button type="button" class="next-round btn btn-light">
      <i class="fa-sharp fa-solid fa-greater-than"></i>
    </button>
  `;
  listenParticipateButtons();
  return currentPage;
}