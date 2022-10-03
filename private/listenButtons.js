import { loadCreateEvents, loadParticipateEvents } from "./loadEvent.js";

function onlyNumbers(str) {
    return /^[0-9]+$/.test(str);
}

export function listenCreateButtons() {
    document.querySelector(".create .next-round").addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        let page = "2";
      
        if (!params.has('createPage')) {
          loadCreateEvents(page);
        } else {
            if (onlyNumbers(params.get('createPage'))) {
                if (parseInt(params.get('createPage')) >= 1) {
                    page = (parseInt(params.get('createPage')) + 1).toString();
                    loadCreateEvents(page);
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

    document.querySelector(".create .previous-round").addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        let page = "1";

        if (!params.has('createPage')) {
            loadCreateEvents(page);
        } else {
            if (onlyNumbers(params.get('createPage'))) {
                if (parseInt(params.get('createPage')) >= 2) {
                    page = (parseInt(params.get('createPage')) - 1).toString();
                    loadCreateEvents(page);
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
    document.querySelector(".participate .next-round").addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        let page = "2";
      
        if (!params.has('participatePage')) {
            loadParticipateEvents(page);
        } else {
            if (onlyNumbers(params.get('participatePage'))) {
                if (parseInt(params.get('participatePage')) >= 1) {
                    page = (parseInt(params.get('participatePage')) + 1).toString();
                    loadParticipateEvents(page);
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

    document.querySelector(".participate .previous-round").addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        let page = "1";

        if (!params.has('participatePage')) {
            loadParticipateEvents(page);
        } else {
            if (onlyNumbers(params.get('participatePage'))) {
                if (parseInt(params.get('participatePage')) >= 2) {
                    page = (parseInt(params.get('participatePage')) - 1).toString();
                    loadParticipateEvents(page);
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