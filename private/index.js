import { loadCreateEvents, loadParticipateEvents } from "./loadEvent.js";

window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);

  if (!params.has('createPage')) {
    loadCreateEvents("1");
  } else {
    const page = params.get('createPage');
    loadCreateEvents(page);
  }
  
  if (!params.has('participatePage')) {
    loadParticipateEvents("1");
  } else {
    const page = params.get('participatePage');
    loadParticipateEvents(page);
  }
});