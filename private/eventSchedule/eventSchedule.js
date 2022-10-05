import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
    addTimeBlock();
    addNavbar();
    loadName();
    showMemo ();

    document.body.style.display = "block";
});

function addTimeBlock() {

    let rundown = document.querySelector("#rundown")

    for (let i = 0; i < 24; i++) {
        rundown.innerHTML +=
            `
                <div class="individual-time-block row">
                    <span id="time-stamp-box" class="time-stamp-container col-2">
                        <div id="stamp_${i}" class="time-stamp">${i}:00</div>
                    </span>
                    <span name="time-block_${i}" class="time-block col-10"></span>
                </div>    
            `

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
        }
    });

}

function showMemo () {
    const timeBlocks = document.querySelectorAll(".time-block")
    const memoContainer = document.querySelector("#time-block-memo-container")
    timeBlocks.forEach((block)=>{
        block.addEventListener("click", (e)=>{
            resetTimeBlockColor(timeBlocks)
            block.style.backgroundColor = "#EFEFD0"
            memoContainer.innerHTML = `
            <label for="memo" id="memo-tag">This is memo label</label>
            <div name="memo" id="memo" class="time-block-memo"></div>
            `
            // const memo = document.querySelector("#memo")

            // const x1 = getOffset(block).left
            // const y1 = getOffset(block).top
            // const x2 = getOffset(memo).left
            // const y2 = getOffset(memo).top

            // console.log (x1,x2,y1,y2)

            // const lineContainer = document.querySelector("#line-container")

            // lineContainer.innerHTML += `
            // <svg id="line" width="100%" height="100%"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black"/></svg>
            // `
        })
    })

}

function resetTimeBlockColor(timeBlocks){
    timeBlocks.forEach((block)=>{
        block.style.backgroundColor = "rgba(181, 180, 180, 0.625)"
    })
}

async function addEventSchedule(eventId) {
    const res = await fetch(`schedule/event?event_id=${eventId}`);
    const result = await res.json()

    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }

}