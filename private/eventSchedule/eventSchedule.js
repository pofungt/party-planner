import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
    addNavbar();
    loadName();
    getEventSchedule();

    document.body.style.display = "block";
});

function getPresetTimeBlock(startHour, endHour) {
    let rundown = document.querySelector("#rundown")

    //generate time block for 24 hours
    for (let i = 0; i < 24; i++) {
        rundown.innerHTML +=
            `
                <div class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp-${i}" class="time-stamp">${i}:00</div>
                    </span>
                    <span id="time-block-${i}" class="time-block col-10"></span>
                </div>    
            `
    }

    //change color for the event time
    for (let s = startHour; s < endHour; s++) {
        document.querySelector(`#time-block-${s}`).style.backgroundColor = "#f2965985"
        if (s === startHour) {
            document.querySelector(`#time-block-${s}`).innerHTML = "Event Start Time"
        } else if (s === endHour-1){
            document.querySelector(`#time-block-${s}`).innerHTML = `Event End Time` 
        }
    }

    //set scroll bar top
    const scrollBarDiv = document.querySelector("#rundown-container")
    scrollBarDiv.scrollTop = document.querySelector(`#time-block-${startHour}`).offsetTop

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
            getMemo(startHour, endHour)
        }
    });
}



function getMemo(startHour, endHour) {
    const timeBlocks = document.querySelectorAll(".time-block")
    const memoContainer = document.querySelector("#time-block-memo-container")

    timeBlocks.forEach((block) => {
        block.addEventListener("click", (e) => {
            const blockNum = block.getAttribute("id").match(/(\d+)/)[0]
            console.log(blockNum)
            resetTimeBlockColor(timeBlocks, startHour, endHour)
            block.style.backgroundColor = "#EFEFD0"
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
            `
        })
    })
}

function hideAllDivClass(divId) {
    const creatorDiv = document.querySelectorAll(divId)
    creatorDiv.forEach((div) => {
        div.style.display = "none";
    })
} 

function resetTimeBlockColor(timeBlocks, startHour, endHour) {
    timeBlocks.forEach((block) => {
        console.log(parseInt(block.id.match(/(\d+)/)[0]))
        if (parseInt(block.id.match(/(\d+)/)[0]) >= startHour && parseInt(block.id.match(/(\d+)/)[0]) < endHour) {
            block.style.backgroundColor = "#f2965985"
        } else {
            block.style.backgroundColor = "rgba(181, 180, 180, 0.625)"
        }
    })
}

async function getEventSchedule() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const isCreator = params.get('is-creator');

    const res = await fetch(`/eventSchedule/?event-id=${eventId}&is-creator=${isCreator}`);

    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }

    const result = await res.json()

    const eventName = result.detail.name
    const startDateTime = (new Date(result.detail.start_datetime)).toLocaleString('en-US', { hour12: false, }).replace(', ', ' ').slice(0, -3)
    const endDateTime = (new Date(result.detail.end_datetime)).toLocaleString('en-US', { hour12: false, }).replace(', ', ' ').slice(0, -3)

    const startTime = startDateTime.slice(-5)
    const endTime = endDateTime.slice(-5)
    // const startDate = startDateTime.slice(0,10)
    // const endDate = endDateTime.slice(0,10)
    const startHour = parseInt(startTime.slice(0, 2))
    const endHour = parseInt(endTime.slice(0, 2))
    console.log(startHour, endHour)

    let pageTitle = document.querySelector("#event-name")
    pageTitle.innerHTML = eventName

    getPresetTimeBlock(startHour, endHour)
    getMemo(startHour, endHour)

    if (isCreator) {
        hideAllDivClass(".creator-function")
    }

}


async function createTimeBlock {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const isCreator = params.get('is-creator');

    const res = await fetch(`/eventSchedule/?event-id=${eventId}&is-creator=${isCreator}`);

    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }
}