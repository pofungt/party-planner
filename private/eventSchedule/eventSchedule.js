import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
    getTimeBlock();
    addNavbar();
    loadName();
    getMemo ();
    getEventSchedule();

    document.body.style.display = "block";
});

function getTimeBlock() {
    let rundown = document.querySelector("#rundown")
    for (let i = 0; i < 24; i++) {
        rundown.innerHTML +=
            `
                <div class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp_${i}" class="time-stamp">${i}:00</div>
                    </span>
                    <span name="time-block_${i}" class="time-block col-10">title</span>
                </div>    
            `
    }
}

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
        getMemo ()
    }
});

function getMemo () {
    const timeBlocks = document.querySelectorAll(".time-block")
    const memoContainer = document.querySelector("#time-block-memo-container")
    timeBlocks.forEach((block)=>{
        block.addEventListener("click", (e)=>{
            const blockNum = block.getAttribute("name").match(/(\d+)/)[0]
            console.log(blockNum)
            resetTimeBlockColor(timeBlocks)
            block.style.backgroundColor = "#EFEFD0"
            memoContainer.innerHTML = `
            <label for="memo" id="memo-tag">${blockNum}:00 to :00</label>
            <div name="memo" id="memo" class="time-block-memo">
                <div id="memo-item-cluster">
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="activity">ACTIVITY DETAIL:</label>
                        <div class="modal-footer" id="separator"></div>
                        <div name="activity" id="activity-detail">here put activity detail</div>
                    </div> 
                    
                    <div class="memo-item-container">
                        <label class="memo-item-label" for="item">ITEM DETAIL:</label>
                        <div class="modal-footer" id="separator"></div>
                        <div name="item" id="item-detail">here put items detail</div>
                    </div> 

                    <div class="memo-item-container">
                        <label class="memo-item-label" for="remark">REMARKs:</label>
                        <div class="modal-footer" id="separator"></div>
                        <div name="remark" id="remark">here put remarks</div>
                    </div> 
                </div> 

            </div>
            `
        })
    })
}

function resetTimeBlockColor(timeBlocks){
    timeBlocks.forEach((block)=>{
        block.style.backgroundColor = "rgba(181, 180, 180, 0.625)"
    })
}

async function getEventSchedule() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event_id');
    const isCreator = params.get('is_creator');

    const res = await fetch(`/eventSchedule/?event_id=${eventId}&is_creator=${isCreator}`);

    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }

    const result = await res.json()
    console.log(result)

}