import { loadName, loadCreateEvents, loadParticipateEvents } from "./loadEvent.js";

function onlyNumbers(str) {
  return /^[0-9]+$/.test(str);
}

window.addEventListener("load", () => {
  loadName();
  const params = new URLSearchParams(window.location.search);
  let createPage = "1";
  let participatePage = "1";

  if (!params.has('createPage')) {
    loadCreateEvents(createPage);
  } else {
    if (onlyNumbers(params.get('createPage'))) {
      if (parseInt(params.get('createPage')) >= 1) {
        createPage = params.get('createPage');
        loadCreateEvents(createPage);
      } else {
          loadCreateEvents(createPage);
      }
    } else {
        loadCreateEvents(createPage);
    }
  }
  
  if (!params.has('participatePage')) {
    loadParticipateEvents(participatePage);
  } else {
    if (onlyNumbers(params.get('participatePage'))) {
      if (parseInt(params.get('participatePage')) >= 1) {
        participatePage = params.get('participatePage');
        loadParticipateEvents(participatePage);
      } else {
        loadParticipateEvents(participatePage);
      }
    } else {
      loadParticipateEvents(participatePage);
    }
  }

  history.pushState({}, "Dashboard", `http://localhost:8080/index.html?createPage=${createPage}&participatePage=${participatePage}`);
});