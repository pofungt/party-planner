import { addNavbar } from "/functions/addNavbar.js";
import { loadName, loadEventDetails } from "/functions/loadEvent.js";

window.addEventListener("load", () => {
    addNavbar();
    loadName();
    loadEventDetails();
    document.body.style.display = "block";
});