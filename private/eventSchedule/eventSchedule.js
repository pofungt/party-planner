import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener("load", async () => {
    addNavbar();
    loadName();

    await getEventSchedule();
    deleteTimeBlock()
    hideCreatorDivClass()


    document.body.style.display = "block";
});



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

    let pageTitle = document.querySelector('#event-name');
    pageTitle.innerHTML = eventName + '  ' + `( ${startTime} - ${endTime} )`;

    addTimeInput(startHour, startMin, endHour, endMin)
    await getPresetTimeBlock(startTimeInMin)
    await getSavedTimeBlocks(activitiesArr)
    await correctDiv(startTimeInMin, endTimeInMin)
    await getMemo(activitiesArr)
}

async function getMemo(activitiesArr) {
    const timeBlocks = document.querySelectorAll('.save-time-block');
    const memoContainer = document.querySelector('#time-block-memo-container');

    timeBlocks.forEach((block) => {
        const startTimeString = minToTimeString(parseInt(block.getAttribute('start')))
        const endTimeString = minToTimeString(parseInt(block.getAttribute('end')))

        block.addEventListener("click", (event) => {
            const activityName = event.target.innerHTML

            let targetActivity = ""

            activitiesArr.forEach((activity) => {
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



async function addTimeInput(startHour, startMin, endHour, endMin) {
   
    //restrict time input according to the event start and end time

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

async function getPresetTimeBlock(startTime) {
    let rundown = document.querySelector("#rundown")

    //generate time block for 24 hours
    for (let i = 0; i < 96; i++) {
        let start = i * 15
        let end = (i + 1) * 15
        const timeString = minToTimeString(start)
        const height = end - start
        rundown.innerHTML +=
            `
                <div id="time-block-container-${start}" start="${start}" end="${end}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${start}" class="time-stamp">${timeString}</div>
                    </span>
                    <span id="time-block-${start}" start="${start}" end="${end}" class="time-block col-10"></span>
                </div>    
            `
        document.querySelector(`#time-block-${start}`).style.height = `${height}px`
    }

    //set scroll bar top
    document.querySelector(`#time-block-${startTime}`).innerHTML = "Event Start Time"
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

        document.querySelector(`#time-block-container-${startTimeInMin}`).innerHTML = `
                <span id="time-stamp-box" class="time-stamp-container col-2">
                    <i value="${id}" id="trash-can" type="button" class="btn fa-solid fa-trash"></i>
                    <div id="stamp-${startTimeInMin}" class="time-stamp">${start}</div>
                </span>
                <span id="time-block-${startTimeInMin}" start="${startTimeInMin}" end="${endTimeInMin}" class="time-block save-time-block col-10">
                </span>
        `
        document.querySelector(`#time-block-${startTimeInMin}`).innerHTML = title
        document.querySelector(`#time-block-${startTimeInMin}`).style.height = `${divHeight}px`
    })
}

async function fixTimeStamp() {
    const timeStampDiv = document.querySelectorAll(".time-stamp")
    timeStampDiv.forEach((stamp) => {
        let nextTimeBlock;
        let placeholder = stamp.parentElement.nextElementSibling;

        while (placeholder) {
            if (placeholder.classList.contains('time-block')) {
                nextTimeBlock = placeholder;
                break;
            }
            placeholder = placeholder.nextElementSibling;
        }
        const time = minToTimeString(parseInt(nextTimeBlock.getAttribute("start")))
        stamp.innerHTML = time
    })
}

async function deleteRedundantDiv(x) {
    const divCluster = document.querySelectorAll(`.time-block`)
    if (x > 0) {
        for (let i = 0; i < divCluster.length; i++) {
            if (!!divCluster[i + 1]) {
                const endTime = parseInt(divCluster[i].getAttribute('end'))
                const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'))
                if (endTime > nextStartTime) {
                    divCluster[i + 1].parentElement.remove()
                } else if (endTime < nextStartTime) {
                    divCluster[i + 1].setAttribute(`start`, `${endTime}`)
                }
            }
        }
        deleteRedundantDiv(x - 1)
        console.log(`checked ${x} times from top to bottom`)
    }
    return
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
                    <span type="button" id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block event-schedule col-10" data-bs-toggle="modal" data-bs-target="#create-time-block-modal"></span>
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

        if (startTime >= eventStartTimeInMin && startTime < eventEndTimeInMin && !(divCluster[i].classList.contains("save-time-block"))) {
            divCluster[i].classList.add('event-schedule')
            divCluster[i].setAttribute(`data-bs-target`, `#create-time-block-modal`)
            divCluster[i].setAttribute(`type`,"button") 
            divCluster[i].setAttribute(`data-bs-toggle`, `modal`)
        }

    }
    const saveTimeBlocks = document.querySelectorAll(".save-time-block")
    saveTimeBlocks.forEach((block) => {
        block.style.backgroundColor = "#f2965985"
    })
    deleteRedundantDiv(10)
    fixTimeStamp()
    fixDivHeight(10)
}

const blankTimeBlocks = document.querySelectorAll(".event-schedule")
    blankTimeBlocks.forEach((blankTimeBlock)=>{
        blankTimeBlock.addEventListener("click", (e)=>{
            console.log (e.target)
        })
    })

function  passTimeToForm (e) {
    let formStartTime = document.querySelector("#start-time")
    let formEndTime = document.querySelector("#end-time")
    console.log(e.start)

    if(!!e.start) {
        formStartTime.value = minToTimeString(this.start)
        formEndTime.value = minToTimeString(this.end)
    }
}



document.querySelector("#activity-form").addEventListener("submit", async function formSubmit(e) {
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

async function fixDivHeight(x) {
    if (x > 0) {
        const divCluster = document.querySelectorAll(".time-block")
        divCluster.forEach((div) => {
            let nextDiv
            if (div.parentElement.nextElementSibling?.childNodes !== null) {
                nextDiv = div.parentElement.nextElementSibling.childNodes[3]
            }
            const height = parseInt(div.getAttribute("end")) - parseInt(div.getAttribute("start"))
            if (!!(div.parentElement.nextElementSibling.childNodes)) {
                if (nextDiv) {
                    if (div.classList === nextDiv.classList && !(div.classList.contains("save-time-block"))) {
                        div.style.height = newHeight
                        const newHeight = parseInt(nextDiv.getAttribute("end")) - parseInt(div.getAttribute("start"))
                        div.setAttribute(`start`, `${nextDiv.getAttribute("end")}`)
                        nextDiv.parentElement.innerHTML = ""
                    } else if (height > 60 && !(div.classList.contains("save-time-block"))) {
                        div.style.height = "60px"
                        const redundantHeight = height - 60
                        nextDiv.setAttribute(`start`, `${parseInt(nextDiv.getAttribute("start")) + redundantHeight}`)
                    } else {
                        div.style.height = `${height}px`
                    }
                }
            }
        })
        console.log (`list has been fixed ${x} times`)
        fixDivHeight(x - 1)
    } else {
        return console.log("fix finished")
    }
}

async function deleteTimeBlock() {
    const trashCans = document.querySelectorAll("#trash-can")
    trashCans.forEach((trashcan) => {
        trashcan.addEventListener("click", async (e) => {
            e.preventDefault()

            if (!window.confirm("Do you really want to delete?")) {
                return
            }

            const params = new URLSearchParams(window.location.search);
            const eventId = params.get('event-id');
            const isCreator = params.get('is-creator');

            const id = e.target.getAttribute(`value`);
            console.log("target ID =" + id)

            const res = await fetch(`/eventSchedule/timeBlock/?event-id=${eventId}&is-creator=${isCreator}&id=${id}`, {
                method: 'DELETE'
            })
            if (res.status !== 200) {
                alert("Unable to delete time block")
                const data = await res.json();
                alert(data.msg);
                return;
            } else {
                const result = await res.json();
                location.reload()
            }
        });
    })
}

function hideCreatorDivClass() {
    const params = new URLSearchParams(window.location.search)
    const isCreator = params.get("is-creator");
    const creatorDiv = document.querySelectorAll(".creator-function");

    if (!isCreator) {
        creatorDiv.forEach((div) => {
            div.style.display = "none";
        });
    }
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

function toMin(timeInput) {
    const hourInMin = parseInt(timeInput.slice(0, 2)) * 60
    const min = parseInt(timeInput.slice(3, 5))
    return hourInMin + min
}

async function creatorCheck() {
    const params = new URLSearchParams(window.location.search);
    const isCreator = params.get('is-creator');
    return isCreator
}

function adjustHeightProportion(height){
    return height * 1.5
}
