import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", () => {
    addNavbar();
    loadName();
    document.body.style.display = "block";
});

document
    .querySelector("#from-container")
    .addEventListener("submit", async function (e){
        e.preventDefault();
        const form = e.target;
        const itemName = form.item_name.value;
        const itemQuantity = form.item_quantity.value;
        const itemPrice = form.item_price.value || null ;

        let formObj = {
            itemName,
            itemQuantity,
            itemPrice,
        }

        let dataPass = true;

        console.log("123")

        if (dataPass) {
            const res = await fetch("/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj),
            });

            const eventsResult = await res.json();
            if (eventsResult.status === true) {
                window.location = "/";  //
            }
        }
    });