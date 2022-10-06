import { loadCreateEvents, loadParticipateEvents } from "/functions/loadEvent.js";

function onlyNumbers(str) {
    return /^[0-9]+$/.test(str);
}

export function listenCreateButtons() {
    document.querySelector(".create .next-round").addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        let page = "2";
      
        if (!params.has('createPage')) {
            await loadCreateEvents(page);
        } else {
            if (onlyNumbers(params.get('createPage'))) {
                if (parseInt(params.get('createPage')) >= 1) {
                    page = (parseInt(params.get('createPage')) + 1).toString();
                    page = await loadCreateEvents(page);
                } else {
                    page = "1";
                    await loadCreateEvents(page);
                }
            } else {
                page = "1";
                await loadCreateEvents(page);
            }
        }
        
        if (!params.has('participatePage')) {
          history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${page}`);
        } else {
          const participatePage = params.get('participatePage');
          history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${page}&participatePage=${participatePage}`);
        }

        listenCreateButtons();
      });

    document.querySelector(".create .previous-round").addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        let page = "1";

        if (!params.has('createPage')) {
            await loadCreateEvents(page);
        } else {
            if (onlyNumbers(params.get('createPage'))) {
                if (parseInt(params.get('createPage')) >= 2) {
                    page = (parseInt(params.get('createPage')) - 1).toString();
                    page = await loadCreateEvents(page);
                } else {
                    page = "1";
                    await loadCreateEvents(page);
                }
            } else {
                page = "1";
                await loadCreateEvents(page);
            }
        }
        
        if (!params.has('participatePage')) {
            history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${page}`);
        } else {
            const participatePage = params.get('participatePage');
            history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${page}&participatePage=${participatePage}`);
        }

        listenCreateButtons();
    });
}

export function listenParticipateButtons() {
    document.querySelector(".participate .next-round").addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        let page = "2";
      
        if (!params.has('participatePage')) {
            await loadParticipateEvents(page);
        } else {
            if (onlyNumbers(params.get('participatePage'))) {
                if (parseInt(params.get('participatePage')) >= 1) {
                    page = (parseInt(params.get('participatePage')) + 1).toString();
                    page = await loadParticipateEvents(page);
                } else {
                    page = "1";
                    await loadParticipateEvents(page);
                }
            } else {
                page = "1";
                await loadParticipateEvents(page);
            }
        }
        
        if (!params.has('createPage')) {
          history.pushState({}, "Dashboard", `http://localhost:8080/index.html?participatePage=${page}`);
        } else {
          const createPage = params.get('createPage');
          history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${createPage}&participatePage=${page}`);
        }

        listenParticipateButtons();
      });

    document.querySelector(".participate .previous-round").addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        let page = "1";

        if (!params.has('participatePage')) {
            await loadParticipateEvents(page);
        } else {
            if (onlyNumbers(params.get('participatePage'))) {
                if (parseInt(params.get('participatePage')) >= 2) {
                    page = (parseInt(params.get('participatePage')) - 1).toString();
                    page = await loadParticipateEvents(page);
                } else {
                    page = "1";
                    await loadParticipateEvents(page);
                }
            } else {
                page = "1";
                await loadParticipateEvents(page);
            }
        }
        
        if (!params.has('createPage')) {
            history.pushState({}, "Dashboard", `http://localhost:8080/index.html?participatePage=${page}`);
        } else {
            const createPage = params.get('createPage');
            history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${createPage}&participatePage=${page}`);
        }

        listenParticipateButtons();
    });
}

export function listenEditButtons() {
    const editCreatedButtons = document.querySelectorAll("[class^='created_detail_']");
    for (let editButton of editCreatedButtons) {
        editButton.addEventListener('click', async () => {
            const className = editButton.className;
            const eventId = className.replace("created_detail_","");
            window.location.replace(`/eventSummary/event.html?event-id=${eventId}&is-creator=1`);
        });
    }

    const editParticipatedButtons = document.querySelectorAll("[class^='participated_detail_']");
    for (let editButton of editParticipatedButtons) {
        editButton.addEventListener('click', async () => {
            const className = editButton.className;
            const eventId = className.replace("participated_detail_","");
            window.location.replace(`/eventSummary/event.html?event-id=${eventId}&is-creator=0`);
        });
    }

}

export function listenToSchedulePage() {
    const toScheduleDiv = document.querySelector("#frame-content-container")
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id')
    const isCreator = params.get('is-creator');
    toScheduleDiv.addEventListener("click", ()=>{
        window.location.replace(`/eventSchedule/eventSchedule.html?event-id=${eventId}&is-creator=${isCreator}`)
    })

}