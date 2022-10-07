import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadName.js";

window.addEventListener("load", async () => {
    addNavbar();
    loadName();
    await getEventSchedule();
    deleteRedundantDiv()


    document.body.style.display = "block";
});

const trashCans = document.querySelectorAll(".fa-solid")
trashCans.forEach((trashcan) => {
    trashcan.addEventListener("click", async (e) => {
        e.preventDefault()

        const id = e.target.getElementsByTagName[`value`];
        const res = await fetch(`/eventSchedule/timeBlock/?event-id=${eventId}&is-creator=${isCreator}&id=${id}`, {
            method: 'DELETE'
        })
        if (res.status !== 200){
            alert("Unable to delete time block")
        } else {
            alert("Delete successful!")
        }
    });
})


function getPresetTimeBlock(startTime, endTime) {
    let rundown = document.querySelector("#rundown")

    //generate time block for 24 hours
    for (let i = 0; i < 24; i++) {
        let start = i * 60
        let end = (i + 1) * 60
        const timeString = minToTimeString(start)
        const height = end - start
        rundown.innerHTML +=
            `
                <div id="time-block-container-${start}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${start}" class="time-stamp">${timeString}</div>
                    </span>
                    <span id="time-block-${start}" start="${start}" end="${end}" class="time-block col-10"></span>
                </div>    
            `
        document.querySelector(`#time-block-${start}`).style.height = `${height}px`
    }


    //change color for the event time
    for (let s = Math.floor(startTime / 60); s < Math.floor(endTime / 60); s++) {
        document.querySelector(`#time-block-${s * 60}`).classList.add("event-schedule")
        if (s === Math.floor(startTime / 60)) {
            document.querySelector(`#time-block-${s * 60}`).innerHTML = "Event Start Time"
        }
    }

    //set scroll bar top
    const scrollBarDiv = document.querySelector("#rundown-container")
    scrollBarDiv.scrollTop = document.querySelector(`#time-block-${startTime}`).offsetTop

    //loop the scroll
    let rundownContainer = document.querySelector("#rundown-container")
    rundownContainer.addEventListener("scroll", function () {
        let max_scroll = this.scrollHeight - this.clientHeight;
        let current_scroll = this.scrollTop;
        let bottom = 100;
        if (current_scroll + bottom >= max_scroll) {
            let outerDiv = document.querySelectorAll(".rundown")[0]
            let current = parseInt(outerDiv.dataset.current, 10);
            let timeBlock = document.querySelectorAll(".individual-time-block")[current]
            let new_div = timeBlock.cloneNode(true);
            outerDiv.appendChild(new_div);
            outerDiv.dataset.current = current + 1;
        }
    });
}

async function getSavedTimeBlocks(activitiesArr) {
    activitiesArr.forEach((activity) => {
        const start = activity.start_time
        const end = activity.end_time
        const title = activity.title
        const startTimeInMin = toMin(activity.start_time)
        const endTimeInMin = toMin(activity.end_time)
        const startId = start.slice(0, 2)
        const startMin = start.slice(3, 5)
        const endId = end.slice(0, 2)
        const endMin = end.slice(3, 5)
        const divHeight = endTimeInMin - startTimeInMin
        const id = activity.id

        document.querySelector(`#time-block-container-${parseInt(startId) * 60}`).innerHTML = `
                <span id="time-stamp-box" class="time-stamp-container col-2">
                    <i value="${id}" type="button" class="btn fa-solid fa-trash"></i>
                    <div id="stamp-${startTimeInMin}" class="time-stamp">${start}</div>
                </span>
                <span id="time-block-${startTimeInMin}" start="${startTimeInMin}" end="${endTimeInMin}" class="time-block save-time-block col-10">
                </span>
        `
        document.querySelector(`#time-block-${startTimeInMin}`).innerHTML = title

        //adjust div height
        document.querySelector(`#time-block-${startTimeInMin}`).style.height = `${divHeight}px`
    })
}



function toMin(timeInput) {
    const hourInMin = parseInt(timeInput.slice(0, 2)) * 60
    const min = parseInt(timeInput.slice(3, 5))
    return hourInMin + min
}


async function getMemo(activitiesArr) {

    const timeBlocks = document.querySelectorAll(".save-time-block")
    const memoContainer = document.querySelector("#time-block-memo-container")

    timeBlocks.forEach((block) => {
        const startTimeString = minToTimeString(parseInt(block.getAttribute('start')))
        const endTimeString = minToTimeString(parseInt(block.getAttribute('end')))

        block.addEventListener("click", (event) => {
            const blockNum = block.getAttribute("id").match(/(\d+)/)[0]
            const activityName = event.target.innerHTML

            let targetActivity = ""

            activitiesArr.forEach((activity) => {
                console.log(activity.title)
                if (activity.title === activityName) {
                    return targetActivity = activity
                }
            })

            const description = targetActivity.description
            const remark = targetActivity.remark

            memoContainer.innerHTML = `
            <label for="memo" id="memo-tag">${startTimeString} to ${endTimeString}</label>
            <div name="memo" id="memo" class="time-block-memo">
                <div id="memo-item-cluster">
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="activity">ACTIVITY DETAIL:</label>
                        <a class="btn creator-function" id="edit-activity-detail">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div name="activity" id="activity-detail">${description}</div>
                        <div id="submit-user"></div>
                    </div> 
                    
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="item">ITEM DETAIL:</label>
                        <a class="btn creator-function" id="edit-show-item">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div name="item" id="item-detail">here put items detail</div>
                    </div> 

                    <div class="memo-item-container">
                        <label class="memo-item-label" for="remark">REMARKS:</label>
                        <a class="btn creator-function" id="edit-remarks">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </a>
                        <div class="modal-footer" id="separator"></div>
                        <div name="remark" id="remark">${remark}</div>
                        <div id="submit-user"></div>
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
            <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:0${startMin}" max="${endHour}:${endMin}" step="900" required>
        </div>
        <div class="input-panel mb-3">
            <div class="form-header">End Time *</div>
            <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:0${startMin}" max="${endHour}:${endMin}" step="900" required>
        </div>
            `
    }

    if (startMin === 0 && endMin === 0) {
        timeContainer.innerHTML = `
        <div class="input-panel mb-3">
            <div class="form-header">Start Time *</div>
            <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:0${startMin}" max="${endHour}:0${endMin}" step="900" required>
        </div>
        <div class="input-panel mb-3">
            <div class="form-header">End Time *</div>
            <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:0${startMin}" max="${endHour}:0${endMin}" step="900" required>
        </div>
            `
    }

    if (startMin !== 0 && endMin !== 0) {
        timeContainer.innerHTML = `
        <div class="input-panel mb-3">
            <div class="form-header">Start Time *</div>
            <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:${startMin}" max="${endHour}:${endMin}" step="900" required>
        </div>
        <div class="input-panel mb-3">
            <div class="form-header">End Time *</div>
            <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:${startMin}" max="${endHour}:${endMin}" step="900" required>
        </div>
            `
    }

    if (startMin !== 0 && endMin === 0) {
        timeContainer.innerHTML = `
        <div class="input-panel mb-3">
            <div class="form-header">Start Time *</div>
            <input type="time" name="start" class="form-control" id="start-time" name="start-time" min="${startHour}:${startMin}" max="${endHour}:0${endMin}" step="900" required>
        </div>
        <div class="input-panel mb-3">
            <div class="form-header">End Time *</div>
            <input type="time" name="end" class="form-control" id="end-time" name="end-time" min="${startHour}:${startMin}" max="${endHour}:0${endMin}" step="900" required>
        </div>
            `
    }
}

function hideAllDivClass(divId) {
    const creatorDiv = document.querySelectorAll(divId);
    creatorDiv.forEach((div) => {
        div.style.display = "none";
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

    const eventName = result.detail.name
    const startDateTime = (new Date(result.detail.start_datetime)).toLocaleString('en-US', { hour12: false, }).replace(', ', ' ').slice(0, -3)
    const endDateTime = (new Date(result.detail.end_datetime)).toLocaleString('en-US', { hour12: false, }).replace(', ', ' ').slice(0, -3)
    const activitiesArr = result.activities
    const activityDetail = activitiesArr.description
    const remark = activitiesArr.remark
    const startTime = startDateTime.slice(-5)
    const endTime = endDateTime.slice(-5)
    // const startDate = startDateTime.slice(0,10)
    // const endDate = endDateTime.slice(0,10)
    const startHour = parseInt(startTime.slice(0, 2))
    const endHour = parseInt(endTime.slice(0, 2))
    const startMin = parseInt(startTime.slice(3, 5))
    const endMin = parseInt(endTime.slice(3, 5))
    const startTimeInMin = toMin(startTime)
    const endTimeInMin = toMin(endTime)


    let pageTitle = document.querySelector("#event-name")
    pageTitle.innerHTML = eventName + "  " + `( ${startTime} - ${endTime} )`

    getPresetTimeBlock(startTimeInMin, endTimeInMin)

    addTimeInput(startHour, startMin, endHour, endMin)
    await getSavedTimeBlocks(activitiesArr)
    if (isCreator) {
        hideAllDivClass(".creator-function")
    }

    await correctDiv(startTimeInMin, endTimeInMin)
    await getMemo(activitiesArr)
    deleteRedundantDiv()
    fixTimeStamp()
}

function fixTimeStamp() {
    const timeStampDiv = document.querySelectorAll(".time-stamp")
    timeStampDiv.forEach((stamp) => {
        const time = minToTimeString(parseInt(stamp.getAttribute("id").match(/(\d+)/)[0]))
        stamp.innerHTML = time
    })
}


function deleteRedundantDiv() {
    const divCluster = document.querySelectorAll(`.time-block`)
    for (let i = 0; i < divCluster.length; i++) {
        if (!!divCluster[i + 1]) {
            const endTime = parseInt(divCluster[i].getAttribute('end'))
            const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'))
            if (endTime > nextStartTime) {
                divCluster[i + 1].parentElement.remove()
            }
        }
    }
}

async function correctDiv(eventStartTimeInMin, eventEndTimeInMin) {
    const divCluster = document.querySelectorAll(`.time-block`)

    for (let i = 0; i < divCluster.length; i++) {
        const startTime = parseInt(divCluster[i].getAttribute('start'))
        const endTime = parseInt(divCluster[i].getAttribute('end'))
        const height = endTime - startTime
        const timeString = minToTimeString(startTime)

        if (!!divCluster[i + 1]) {

            divCluster[i].style.height = `${height}px`
            const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'))
            const nextEndTime = parseInt(divCluster[i + 1].getAttribute('end'))
            const newDivHeight = nextStartTime - endTime
            const nextStartTimeFormat = minToTimeString(nextStartTime)

            if (endTime < nextStartTime && startTime >= eventStartTimeInMin && startTime < eventEndTimeInMin) {

                divCluster[i].parentNode.insertAdjacentHTML('afterend',
                    `
                <div id="time-block-container-${endTime}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${endTime}" class="time-stamp">${nextStartTimeFormat}</div>
                    </span>
                    <span id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block event-schedule col-10"></span>
                </div>    
                `
                );
                document.querySelector(`#time-block-${endTime}`).style.height = `${newDivHeight}px`
            } else if (endTime < nextStartTime) {

                divCluster[i].parentNode.insertAdjacentHTML('afterend',
                    `
                <div id="time-block-container-${endTime}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${endTime}" class="time-stamp">${nextStartTimeFormat}</div>
                    </span>
                    <span id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block col-10"></span>
                </div>    
                `
                );
                document.querySelector(`#time-block-${endTime}`).style.height = `${newDivHeight}px`
            }

            document.querySelector(`#stamp-${startTime}`).innerHTML = timeString
            divCluster[i].style.height = `${height}`
        }

        if (startTime >= eventStartTimeInMin && startTime < eventEndTimeInMin) {
            divCluster[i].style.backgroundColor = "#EFEFD0"
        }

    }
    const saveTimeBlocks = document.querySelectorAll(".save-time-block")
    saveTimeBlocks.forEach((block) => {
        block.style.backgroundColor = "#f2965985"
    })
    deleteRedundantDiv()
    fixTimeStamp()
}

function minToTimeString(timeInMin) {
    if (timeInMin < 10) {
        return `00:0${timeInMin}`
    } else if (timeInMin < 60) {
        return `00:${timeInMin}`
    } else if (Math.floor(timeInMin / 60) < 10 && (timeInMin % 60) < 10) {
        const hour = Math.floor(timeInMin / 60)
        const min = timeInMin % 60
        return `0${hour}:0${min}`
    } else if (Math.floor(timeInMin / 60) >= 10 && (timeInMin % 60) < 10) {
        const hour = Math.floor(timeInMin / 60)
        const min = timeInMin % 60
        return `${hour}:0${min}`
    } else if (Math.floor(timeInMin / 60) >= 10 && (timeInMin % 60) >= 10) {
        const hour = Math.floor(timeInMin / 60)
        const min = timeInMin % 60
        return `${hour}:${min}`
    } else if (Math.floor(timeInMin / 60) < 10 && (timeInMin % 60) >= 10) {
        const hour = Math.floor(timeInMin / 60)
        const min = timeInMin % 60
        return `0${hour}:${min}`
    }
}

document
    .querySelector("#activity-form")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('event-id');
        const isCreator = params.get('is-creator');

        const form = e.target
        const title = form["activity-name"].value
        const description = form.description.value
        const remark = form.remark.value
        const startTime = form.start.value
        const endTime = form.end.value
        const startHour = parseInt(startTime.slice(0, 2))
        const startMin = parseInt(startTime.slice(3, 5))
        const endHour = parseInt(endTime.slice(0, 2))
        const endMin = parseInt(endTime.slice(3, 5))

        let dataPass = true

        const startTimeInMin = (startHour * 60) + startMin
        const endTimeInMin = (endHour * 60) + endMin

        if (endTimeInMin <= startTimeInMin) {
            dataPass = false
            alert("Activity End Time is Smaller than Start Time")
            return;
        }

        if (!title) {
            dataPass = false
            alert("Title Field is Mandatory")
            return;
        }

        if (dataPass) {
            let formObj = {
                title,
                description,
                remark,
                startTime,
                endTime,
            };

            const res = await fetch(`/eventSchedule/activity/?event-id=${eventId}&is-creator=${isCreator}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj)
            });

            if (res.status !== 200) {
                const data = await res.json();
                alert(data.msg);
                return;
            }

            const result = await res.json();
            if (result.status === true) {
                alert("Activity successfully added!")
                location.reload()
            }
        }
    })

function recoverEventColor(eventStart, eventEnd) {
    const timeBlocks = document.querySelectorAll(".time-block")
    timeBlocks.forEach((timeBlock) => {
        const start = parseInt(timeBlock.getElementsByTagName["start"])
        const end = parseInt(timeBlock.getElementsByTagName['end'])
        if (start > eventStart && end < eventEnd) {
            timeBlock.classList.add("event-schedule")
        }
    })
}
