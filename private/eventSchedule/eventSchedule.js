import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
    addNavbar();
    loadName();

    document.body.style.display = "block";
});