export async function getEventSchedule() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const isCreator = params.get('is-creator');

    const res = await fetch(`/events/?event-id=${eventId}&is-creator=${isCreator}`);

    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }

    const result = await res.json();

    if (result.status) {
        const option = {
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }

        const startDateTime = (new Date(result.detail.start_datetime)).toLocaleString('en-US', option).replace(', ', ' ').slice(0, -3)
        const endDateTime = (new Date(result.detail.end_datetime)).toLocaleString('en-US', option).replace(', ', ' ').slice(0, -3)
        const activitiesArr = result.activities
        const startTime = startDateTime.slice(-5)
        const endTime = endDateTime.slice(-5)
        const startDate = startDateTime.slice(0, 10)
        const endDate = endDateTime.slice(0, 10)
        const startYear = startDateTime.slice(6, 10)
        const endYear = endDateTime.slice(6, 10)
        const startMonth = startDateTime.slice(0, 2)
        const endMonth = endDateTime.slice(0, 2)
        const startDay = startDateTime.slice(3, 5)
        const endDay = endDateTime.slice(3, 5)

        const date = `${startYear}${startMonth}${startDay}`

        let startTimeInMin = toMin(startTime)
        let endTimeInMin = toMin(endTime)

        const dayDifference = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000 / 60 / 60 / 24


        if (dayDifference > 0 && date !== `${startYear}${startMonth}${startDay}` && date !== `${endYear}${endMonth}${endDay}`) {
            startTimeInMin = 0
            endTimeInMin = 1440
        }

        if (dayDifference > 0 && date === `${startYear}${startMonth}${startDay}`) {
            endTimeInMin = 1440

        }

        if (dayDifference > 0 && date === `${endYear}${endMonth}${endDay}`) {
            startTimeInMin = 0
        }

        await getPresetTimeBlock(startTimeInMin)
        await getSavedTimeBlocks(activitiesArr)
        await correctDiv(startTimeInMin, endTimeInMin)
        setGlobalHeight(2)

    }
}

async function getPresetTimeBlock(startTime) {
    let rundown = document.querySelector('#rundown');

    //generate time block for 24 hours
    for (let i = 0; i < 96; i++) {
        let start = i * 15
        let end = (i + 1) * 15
        const timeString = minToTimeString(start)
        const height = end - start
        rundown.innerHTML +=
            `
                    <div id="time-block-container-${start}" start="${start}" end="${end}" class="individual-time-block row">
                        <span id="time-stamp-box" class="time-stamp-container col-sm-2">
                            <div id="stamp-${start}" class="time-stamp">${timeString}</div>
                        </span>
                        <span id="time-block-${start}" start="${start}" end="${end}" class="time-block col-sm-10"></span>
                    </div>    
                `;
        document.querySelector(`#time-block-${start}`).style.height = `${height}px`;
    }

    //set scroll bar top
    document.querySelector(`#time-block-${startTime}`).innerHTML = "Event Start Time"
    const scrollBarDiv = document.querySelector("#rundown-container")
    scrollBarDiv.scrollTop = document.querySelector(`#time-block-${startTime}`).offsetTop

}

async function getSavedTimeBlocks(activitiesArr) {
    activitiesArr.forEach(async (activity) => {
        const start = activity.start_time
        const title = activity.title
        const startTimeInMin = toMin(activity.start_time)
        const endTimeInMin = toMin(activity.end_time)
        const divHeight = endTimeInMin - startTimeInMin
        const id = activity.id
        const presetColor = "#f29659"
        let color = activity.color

        if (activity.color === null || undefined) {
            color = presetColor
        }

        document.querySelector(`#time-block-container-${startTimeInMin}`).innerHTML = `
                <span id="time-stamp-box" class="time-stamp-container col-2">
                    <div id="stamp-${startTimeInMin}" class="time-stamp">${start}</div>
                </span>
                <span value="${id}" type="button" id="time-block-${startTimeInMin}" start="${startTimeInMin}" end="${endTimeInMin}" class="time-block save-time-block col-10">
                </span>
                
        `
        document.querySelector(`#time-block-${startTimeInMin}`).innerHTML = title
        document.querySelector(`#time-block-${startTimeInMin}`).style.height = `${divHeight}px`
        document.querySelector(`#time-block-${startTimeInMin}`).style.backgroundColor = `${color}`

    })
}



async function fixDivHeight(x) {
    if (x > 0) {
        const divCluster = document.querySelectorAll('.time-block');
        divCluster.forEach((div) => {
            let nextDiv;
            if (div.parentElement.nextElementSibling?.childNodes) {
                nextDiv = div.parentElement.nextElementSibling.childNodes[3];
            }
            const height = parseInt(div.getAttribute('end')) - parseInt(div.getAttribute('start'));
            if (!!div.parentElement.nextElementSibling?.childNodes) {
                if (nextDiv) {
                    if (div.classList === nextDiv.classList && !div.classList.contains('save-time-block')) {
                        div.style.height = newHeight;
                        const newHeight = parseInt(nextDiv.getAttribute('end')) - parseInt(div.getAttribute('start'));
                        div.setAttribute(`start`, `${nextDiv.getAttribute('end')}`);
                        nextDiv.parentElement.innerHTML = '';
                    } else if (height > 60 && !div.classList.contains('save-time-block')) {
                        div.style.height = '60px';
                        const redundantHeight = height - 60;
                        nextDiv.setAttribute(`start`, `${parseInt(nextDiv.getAttribute('start')) + redundantHeight}`);
                    } else {
                        div.style.height = `${height}px`;
                    }
                }
            }
        });
        fixDivHeight(x - 1);
    } else {
        return;
    }
}

function toMin(timeInput) {
    const hourInMin = parseInt(timeInput.slice(0, 2)) * 60;
    const min = parseInt(timeInput.slice(3, 5));
    return hourInMin + min;
}

async function setGlobalHeight(input) {
    const allBlocks = document.querySelectorAll('.time-block');
    allBlocks.forEach((block) => {
        const originalHeight = parseInt(block.style.height.slice(0, -2));
        block.style.height = `${originalHeight * input}px`;
    });
}

async function fixTimeStamp() {
    const timeStampDiv = document.querySelectorAll('.time-stamp');
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
        const time = minToTimeString(parseInt(nextTimeBlock.getAttribute('start')));
        stamp.innerHTML = time;
    });
}

async function deleteRedundantDiv(x) {
    const divCluster = document.querySelectorAll(`.time-block`);
    if (x > 0) {
        for (let i = 0; i < divCluster.length; i++) {
            if (!!divCluster[i + 1]) {
                const endTime = parseInt(divCluster[i].getAttribute('end'));
                const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'));
                if (endTime > nextStartTime) {
                    divCluster[i + 1].parentElement.remove();
                } else if (endTime < nextStartTime) {
                    divCluster[i + 1].setAttribute(`start`, `${endTime}`);
                }
            }
        }
        deleteRedundantDiv(x - 1);
    }
    return;
}

async function correctDiv(eventStartTimeInMin, eventEndTimeInMin) {
    const divCluster = document.querySelectorAll(`.time-block`);
    const params = new URLSearchParams(window.location.search);
    const isCreator = params.get('is-creator');

    for (let i = 0; i < divCluster.length; i++) {
        const startTime = parseInt(divCluster[i].getAttribute('start'));
        const endTime = parseInt(divCluster[i].getAttribute('end'));
        const height = endTime - startTime;
        const timeString = minToTimeString(startTime);

        if (!!divCluster[i + 1]) {
            divCluster[i].style.height = `${height}px`;
            const nextStartTime = parseInt(divCluster[i + 1].getAttribute('start'));
            const nextEndTime = parseInt(divCluster[i + 1].getAttribute('end'));
            const newDivHeight = nextStartTime - endTime;
            const nextStartTimeFormat = minToTimeString(nextStartTime);

            if (endTime < nextStartTime && startTime >= eventStartTimeInMin && startTime < eventEndTimeInMin) {
                divCluster[i].parentNode.insertAdjacentHTML(
                    'afterend',
                    `
                <div id="time-block-container-${endTime}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${endTime}" class="time-stamp">${nextStartTimeFormat}</div>
                    </span>
                    <span type="button" id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block event-schedule col-10" data-bs-toggle="modal" data-bs-target="#create-time-block-modal"></span>
                </div>    
                `
                );
                document.querySelector(`#time-block-${endTime}`).style.height = `${newDivHeight}px`;
            } else if (endTime < nextStartTime) {
                divCluster[i].parentNode.insertAdjacentHTML(
                    'afterend',
                    `
                <div id="time-block-container-${endTime}" class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${endTime}" class="time-stamp">${nextStartTimeFormat}</div>
                    </span>
                    <span id="time-block-${endTime}" start="${endTime}" end="${nextStartTime}" class="time-block col-10"></span>
                </div>    
                `
                );
                document.querySelector(`#time-block-${endTime}`).style.height = `${newDivHeight}px`;
            }

            document.querySelector(`#stamp-${startTime}`).innerHTML = timeString;
            divCluster[i].style.height = `${height}`;
        }

        if (
            startTime >= eventStartTimeInMin &&
            startTime < eventEndTimeInMin &&
            !divCluster[i].classList.contains('save-time-block')
        ) {
            divCluster[i].classList.add('event-schedule');
            if (isCreator === '1') {
                divCluster[i].setAttribute(`data-bs-target`, `#create-time-block-modal`);
                divCluster[i].setAttribute(`type`, 'button');
                divCluster[i].setAttribute(`data-bs-toggle`, `modal`);
            }
        }
    }

    deleteRedundantDiv(100);
    fixTimeStamp();
    fixDivHeight(10);
}

function minToTimeString(timeInMin) {
    if (timeInMin < 10) {
        return `00:0${timeInMin}`;
    } else if (timeInMin < 60) {
        return `00:${timeInMin}`;
    } else if (Math.floor(timeInMin / 60) < 10 && timeInMin % 60 < 10) {
        const hour = Math.floor(timeInMin / 60);
        const min = timeInMin % 60;
        return `0${hour}:0${min}`;
    } else if (Math.floor(timeInMin / 60) >= 10 && timeInMin % 60 < 10) {
        const hour = Math.floor(timeInMin / 60);
        const min = timeInMin % 60;
        return `${hour}:0${min}`;
    } else if (Math.floor(timeInMin / 60) >= 10 && timeInMin % 60 >= 10) {
        const hour = Math.floor(timeInMin / 60);
        const min = timeInMin % 60;
        return `${hour}:${min}`;
    } else if (Math.floor(timeInMin / 60) < 10 && timeInMin % 60 >= 10) {
        const hour = Math.floor(timeInMin / 60);
        const min = timeInMin % 60;
        return `0${hour}:${min}`;
    }
}
