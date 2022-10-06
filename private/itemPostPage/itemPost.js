import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

let editingType = null;

window.addEventListener("load", () => {
    addNavbar();
    loadName();
    document.body.style.display = "block";
});

document.querySelectorAll(".category-edit").forEach((button) => {
    button.addEventListener("click", function (e) {
        editingType = button.attributes.itemType.value;
    });
});

document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
        async function itemDelete() {
            const res = await fetch("/items/:id", {
                method: "DELETE",
            });
            if ( (await res.json()).status === true) {
                const deleteResult = document.querySelector("#item-id");
                deleteResult.remove();
            } 
        }
    });
});

document
    .querySelector("#from-container")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const form = e.target;
        const typeName = editingType;
        const itemName = form.item_name.value;
        const itemQuantity = form.item_quantity.value;
        const itemPrice = form.item_price.value || null;
        const itemPIC = form.item_user.value || null;

        let formObj = {
            typeName,
            itemName,
            itemQuantity,
            itemPrice,
            itemPIC,
        };

        let dataPass = true;

        if (dataPass) {
            const res = await fetch("/items/eventId/:id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj),
            });

            const eventsResult = await res.json();
            if (eventsResult.status === true) {
                window.location = "/"; //
            }
        }
    });
