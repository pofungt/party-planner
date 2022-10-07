import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
  addNavbar();
  loadName();
  getEventSchedule();

  document.body.style.display = "block";
});

function getPresetTimeBlock(startHour, endHour) {
  let rundown = document.querySelector("#rundown");

  //generate time block for 24 hours
  for (let i = 0; i < 24; i++) {
    rundown.innerHTML += `
                <div id="time-block-container-${i}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${i}" class="time-stamp">${i}:00</div>
                    </span>
                    <span id="time-block-${i}" class="time-block col-10"></span>
                </div>    
            `;
  }

  //change color for the event time
  for (let s = startHour; s < endHour; s++) {
    document.querySelector(`#time-block-${s}`).style.backgroundColor =
      "#f2965985";
    if (s === startHour) {
      document.querySelector(`#time-block-${s}`).innerHTML = "Event Start Time";
    } else if (s === endHour - 1) {
      document.querySelector(`#time-block-${s}`).innerHTML = `Event End Time`;
    }
  }

  //set scroll bar top
  const scrollBarDiv = document.querySelector("#rundown-container");
  scrollBarDiv.scrollTop = document.querySelector(
    `#time-block-${startHour}`
  ).offsetTop;

  //loop the scroll
  let rundownContainer = document.querySelector("#rundown-container");
  rundownContainer.addEventListener("scroll", function () {
    let max_scroll = this.scrollHeight - this.clientHeight;
    let current_scroll = this.scrollTop;
    let bottom = 100;
    if (current_scroll + bottom >= max_scroll) {
      let outerDiv = document.querySelectorAll(".rundown")[0];
      let current = parseInt(outerDiv.dataset.current, 10);
      let timeBlock = document.querySelectorAll(".individual-time-block")[
        current
      ];
      let new_div = timeBlock.cloneNode(true);
      outerDiv.appendChild(new_div);
      outerDiv.dataset.current = current + 1;
    }
  });
}

function getSavedTimeBlocks(activitiesArr) {
  activitiesArr.forEach((activity) => {
    const start = activity.start_time;
    const end = activity.end_time;
    const title = activity.title;
    const startId = start.slice(0, 2);
    const endId = end.slice(0, 2);

    document.querySelector(`#time-block-${startId}`).innerHTML = title;

    document.querySelector(`time-block-container-${startId}`).innerHTML = `
                <span id="time-stamp-box" class="time-stamp-container col-2">
                    <div id="stamp-${startId}" class="time-stamp">${startId}:00</div>
                </span>
                <span id="time-block-${startId}" class="time-block save-time-block col-10"></span>
        `;
    //adjust div height

    //delete redundant div
    for (let i = startId + 1; i < endId; i++) {
      document.querySelector(`time-block-container-${i}`).innerHTML = "";
    }
  });
}

function getMemo(startHour, endHour) {
  const timeBlocks = document.querySelectorAll(".save-time-block");
  const memoContainer = document.querySelector("#time-block-memo-container");

  timeBlocks.forEach((block) => {
    block.addEventListener("click", (e) => {
      const blockNum = block.getAttribute("id").match(/(\d+)/)[0];
      console.log(blockNum);
      resetTimeBlockColor(timeBlocks, startHour, endHour);
      block.style.backgroundColor = "#EFEFD0";
      memoContainer.innerHTML = `
            <label for="memo" id="memo-tag">${blockNum}:00 to :00</label>
            <div name="memo" id="memo" class="time-block-memo">
                <div id="memo-item-cluster">
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="activity">ACTIVITY DETAIL:</label>
                        <a class="creator-function btn" id="edit-activity-detail">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div name="activity" id="activity-detail">here put activity detail</div>
                    </div> 
                    
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="item">ITEM DETAIL:</label>
                        <a class="creator-function btn" id="edit-show-item">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div name="item" id="item-detail">here put items detail</div>
                    </div> 

                    <div class="memo-item-container">
                        <label class="memo-item-label" for="remark">REMARKS:</label>
                        <a class="creator-function btn" id="edit-remarks">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div name="remark" id="remark">here put remarks</div>
                    </div> 
                </div> 

            </div>
            `;
    });
  });
}

function addTimeInput(startHour, startMin, endHour, endMin) {
  const timeContainer = document.querySelector("#time-container");

  if (startMin === 0 && endMin !== 0) {
    timeContainer.innerHTML = `
    <div class="input-panel mb-3">
        <div class="form-header">Start Time *</div>
        <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:0${startMin}" max="${endHour}:${endMin}" required>
    </div>
    <div class="input-panel mb-3">
        <div class="form-header">End Time *</div>
        <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:0${startMin}" max="${endHour}:${endMin}" required>
    </div>
        `;
  }

  if (startMin === 0 && endMin === 0) {
    timeContainer.innerHTML = `
    <div class="input-panel mb-3">
        <div class="form-header">Start Time *</div>
        <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:0${startMin}" max="${endHour}:0${endMin}" required>
    </div>
    <div class="input-panel mb-3">
        <div class="form-header">End Time *</div>
        <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:0${startMin}" max="${endHour}:0${endMin}" required>
    </div>
        `;
  }

  if (startMin !== 0 && endMin !== 0) {
    timeContainer.innerHTML = `
    <div class="input-panel mb-3">
        <div class="form-header">Start Time *</div>
        <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:${startMin}" max="${endHour}:${endMin}" required>
    </div>
    <div class="input-panel mb-3">
        <div class="form-header">End Time *</div>
        <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:${startMin}" max="${endHour}:${endMin}" required>
    </div>
        `;
  }

  if (startMin !== 0 && endMin === 0) {
    timeContainer.innerHTML = `
    <div class="input-panel mb-3">
        <div class="form-header">Start Time *</div>
        <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:${startMin}" max="${endHour}:0${endMin}" required>
    </div>
    <div class="input-panel mb-3">
        <div class="form-header">End Time *</div>
        <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:${startMin}" max="${endHour}:0${endMin}" required>
    </div>
        `;
  }
}

function hideAllDivClass(divId) {
  const creatorDiv = document.querySelectorAll(divId);
  creatorDiv.forEach((div) => {
    div.style.display = "none";
  });
}

function resetTimeBlockColor(timeBlocks, startHour, endHour) {
  timeBlocks.forEach((block) => {
    if (
      parseInt(block.id.match(/(\d+)/)[0]) >= startHour &&
      parseInt(block.id.match(/(\d+)/)[0]) < endHour
    ) {
      block.style.backgroundColor = "#f2965985";
    } else {
      block.style.backgroundColor = "rgba(181, 180, 180, 0.625)";
    }
  });
}

async function getEventSchedule() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event-id");
  const isCreator = params.get("is-creator");

  const res = await fetch(
    `/eventSchedule/?event-id=${eventId}&is-creator=${isCreator}`
  );

  if (res.status !== 200) {
    const data = await res.json();
    alert(data.msg);
    return;
  }

  const result = await res.json();

  const eventName = result.detail.name;
  const startDateTime = new Date(result.detail.start_datetime)
    .toLocaleString("en-US", { hour12: false })
    .replace(", ", " ")
    .slice(0, -3);
  const endDateTime = new Date(result.detail.end_datetime)
    .toLocaleString("en-US", { hour12: false })
    .replace(", ", " ")
    .slice(0, -3);
  const activitiesArr = result.activities;

  const startTime = startDateTime.slice(-5);
  const endTime = endDateTime.slice(-5);
  // const startDate = startDateTime.slice(0,10)
  // const endDate = endDateTime.slice(0,10)
  const startHour = parseInt(startTime.slice(0, 2));
  const endHour = parseInt(endTime.slice(0, 2));
  const startMin = parseInt(startTime.slice(3, 5));
  const endMin = parseInt(endTime.slice(3, 5));

  let pageTitle = document.querySelector("#event-name");
  pageTitle.innerHTML = eventName + "  " + `( ${startTime} - ${endTime} )`;

  getPresetTimeBlock(startHour, endHour);
  getMemo(startHour, endHour);
  addTimeInput(startHour, startMin, endHour, endMin);
  getSavedTimeBlocks(activitiesArr);
  if (isCreator) {
    hideAllDivClass(".creator-function");
  }
}

document
  .querySelector("#activity-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event-id");
    const isCreator = params.get("is-creator");

    const form = e.target;
    const title = form["activity-name"].value;
    const description = form.description.value;
    const remark = form.remark.value;
    const startTime = form.start.value;
    const endTime = form.end.value;

    let formObj = {
      title,
      description,
      remark,
      startTime,
      endTime,
    };

    console.log(formObj);

    const res = await fetch(
      `/eventSchedule/activity/?event-id=${eventId}&is-creator=${isCreator}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObj),
      }
    );

    if (res.status !== 200) {
      const data = await res.json();
      alert(data.msg);
      return;
    }

    const result = await res.json();
    if (result.status === true) {
      alert("Activity successfully added!");
      location.reload();
    }
  });
