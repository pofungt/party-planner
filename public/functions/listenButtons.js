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
            loadCreateEvents(page);
        } else {
            if (onlyNumbers(params.get('createPage'))) {
                if (parseInt(params.get('createPage')) >= 2) {
                    page = (parseInt(params.get('createPage')) - 1).toString();
                    page = await loadCreateEvents(page);
                } else {
                    page = "1";
                    loadCreateEvents(page);
                }
            } else {
                page = "1";
                loadCreateEvents(page);
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
            loadParticipateEvents(page);
        } else {
            if (onlyNumbers(params.get('participatePage'))) {
                if (parseInt(params.get('participatePage')) >= 1) {
                    page = (parseInt(params.get('participatePage')) + 1).toString();
                    page = await loadParticipateEvents(page);
                } else {
                    page = "1";
                    loadParticipateEvents(page);
                }
            } else {
                page = "1";
                loadParticipateEvents(page);
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
            loadParticipateEvents(page);
        } else {
            if (onlyNumbers(params.get('participatePage'))) {
                if (parseInt(params.get('participatePage')) >= 2) {
                    page = (parseInt(params.get('participatePage')) - 1).toString();
                    page = await loadParticipateEvents(page);
                } else {
                    page = "1";
                    loadParticipateEvents(page);
                }
            } else {
                page = "1";
                loadParticipateEvents(page);
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
    const editButtons = document.querySelectorAll("[class^='detail_']");
    
    for (let editButton of editButtons) {
        editButton.addEventListener('click', () => {
            const className = editButton.className;
            const eventId = className.replace("detail_","");
            window.location.replace(`/eventSummary/event.html/${eventId}`);
        });
    }

}