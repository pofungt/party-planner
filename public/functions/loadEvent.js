import {listenCreateButtons, listenParticipateButtons, listenEditButtons, listenToSchedulePage} from "/functions/listenButtons.js";

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
    let status = "";
    let statusClass = "";
    // Check if start datetime is not null
    if (event.start_datetime) {
      const today = (new Date()).getTime();
      const eventStartDate = (new Date(event.start_datetime)).getTime();
      if (today > eventStartDate) {
        status = "Completed";
        statusClass = "completedStatus"
      } else {
        status = "Processing";
        statusClass = "progressStatus"
      }
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
        <div>${!event.venue ? "" : event.venue}</div>
      </th>
      <th scope="col" class="start_datetime_${event.id}">
        <div>${!event.start_datetime ? "" : (new Date(event.start_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
      </th>
      <th scope="col" class="end_datetime_${event.id}">
        <div>${!event.end_datetime ? "" : (new Date(event.end_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
      </th>
      <th scope="col" class="event_status_${event.id}">
        <div><div class="${statusClass}">${status}</div></div>
      </th>
      <th scope="col" class="created_detail_${event.id}">
        <div>
          <a class="edit-button">
            <i class="fa-regular fa-pen-to-square"></i>
          </a>
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
  listenEditButtons();
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
    let status = "";
    let statusClass = "";
    // Check if start datetime is not null
    if (event.start_datetime) {
      const today = (new Date()).getTime();
      const eventStartDate = (new Date(event.start_datetime)).getTime();
      if (today > eventStartDate) {
        status = "Completed";
        statusClass = "completedStatus"
      } else {
        status = "Processing";
        statusClass = "progressStatus"
      }
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
              <div>${!event.venue ? "" : event.venue}</div>
            </th>
            <th scope="col" class="start_datetime_${event.id}">
              <div>${!event.start_datetime ? "" : (new Date(event.start_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
            </th>
			      <th scope="col" class="end_datetime_${event.id}">
              <div>${!event.end_datetime ? "" : (new Date(event.end_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3)}</div>
            </th>
            <th scope="col" class="event_status_${event.id}">
              <div><div class="${statusClass}">${status}</div></div>
            </th>
            <th scope="col" class="participated_detail_${event.id}">
            <div>
              <a class="edit-button">
                <i class="fa-regular fa-pen-to-square"></i>
              </a>
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
  listenEditButtons();
  return currentPage;
}

export async function loadEventDetails() {
  const params = new URLSearchParams(window.location.search);
  const isCreator = parseInt(params.get('is-creator'));
  const eventId = params.get('event-id');
  const res = await fetch(`/events/detail/${isCreator ? "created" : "participated"}/${eventId}`);
  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }
  const result = await res.json();
  if (result.status) {
    // Load Event Name into Page
    const eventName = document.querySelector(".eventname .background-frame");
    eventName.innerHTML = `
      <div class="emoji">
        🎉
      </div>
      <div>
        ${result.detail.name}
      </div>
    `;

    // Load Date Time into Page
    let dateTimeString = "";
    if (result.detail.start_datetime) {
      dateTimeString = (new Date(result.detail.start_datetime)).toLocaleString('en-US', {hour12: false,}).replace(', ',' ').slice(0, -3);
    }
    const dateTime = document.querySelector(".date-time .background-frame");
    dateTime.innerHTML = `
      <div class="frame-title">
        Date & Time
      </div>

      <div class="frame-content">
        ${dateTimeString}
      </div>
    `;

    // Load Participants into Page
    let participantListHTML = "";
    if (result.participants.length) {
      const userList = result.participants;
      participantListHTML += "<div>";
      for (let user of userList) {
        participantListHTML += `
        <div class="user_${user.id}">
          <i class="fa-solid fa-user"></i>
          &nbsp; &nbsp;
          ${user.first_name} ${user.last_name}
        </div>
        `;
      }
      participantListHTML += "</div>";
    }
    const participant = document.querySelector(".participant .background-frame");
    participant.innerHTML = `
      <div class="frame-title-container">
        <div class="frame-title">
          Participants
        </div>
        <div id="number-of-participants">
          ${result.participants.length}
        </div>
      </div>

      <div class="frame-content-container">
        ${participantListHTML}
      </div>
    `;

    // Load Venue into Page
    const venue = document.querySelector(".venue .background-frame");
    venue.innerHTML = `
        <div class="frame-title-container">
          <div class="frame-title">
            Venue
          </div>
        </div>
        <div class="frame-content-container">
          <i class="fa-solid fa-location-dot"></i>
          &nbsp; &nbsp;
          <a href="https://www.google.com/maps/search/${result.detail.venue.replaceAll(" ","+")}/" target="_blank">
            ${result.detail.venue || ""}
          </a>
        </div>
    `;

      // Load schedule into Page
      const schedule = document.querySelector(".schedule .background-frame");
      schedule.innerHTML = `
          <div class="frame-title-container">
            <div id="frame-content-container" class="frame-title btn btn-primary">
              Schedule
            </div>
          </div>
          <div class="frame-content-container">

          </div>
      `;

      // Load item into Page
      const item = document.querySelector(".item .background-frame");
      item.innerHTML = `
          <div class="frame-title-container">
            <div class="frame-title">
              Item
            </div>
          </div>
          <div class="frame-content-container">

          </div>
      `;

      listenToSchedulePage()
    
  }
}