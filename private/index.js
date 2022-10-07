import {
  loadName,
  loadCreateEvents,
  loadParticipateEvents,
} from "/functions/loadEvent.js";
import { addNavbar } from "/functions/addNavbar.js";

function onlyNumbers(str) {
  return /^[0-9]+$/.test(str);
}

window.addEventListener("load", async () => {
  addNavbar();
  loadName();
  const params = new URLSearchParams(window.location.search);
  let createPage = "1";
  let participatePage = "1";

  if (!params.has("create-page")) {
    loadCreateEvents(createPage);
  } else {
    if (onlyNumbers(params.get("create-page"))) {
      if (parseInt(params.get("create-page")) >= 1) {
        createPage = params.get("create-page");
        createPage = await loadCreateEvents(createPage);
      } else {
        loadCreateEvents(createPage);
      }
    } else {
      loadCreateEvents(createPage);
    }
  }

  if (!params.has("participate-page")) {
    loadParticipateEvents(participatePage);
  } else {
    if (onlyNumbers(params.get("participate-page"))) {
      if (parseInt(params.get("participate-page")) >= 1) {
        participatePage = params.get("participate-page");
        participatePage = await loadParticipateEvents(participatePage);
      } else {
        loadParticipateEvents(participatePage);
      }
    } else {
      loadParticipateEvents(participatePage);
    }
  }

  history.pushState(
    {},
    "Dashboard",
    `http://localhost:8080/index.html?create-page=${createPage}&participate-page=${participatePage}`
  );

  document.body.style.display = "block";
});
