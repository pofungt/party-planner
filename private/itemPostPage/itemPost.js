import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

let editingType = null;
let itemData = null;

window.addEventListener("load", async () => {
  itemData = await (await fetch(`/items?eventID=1`)).json();
  addNavbar();
  loadName();
  fetchItem(itemData);
  document.body.style.display = "block";
});

document.querySelectorAll(".category-edit").forEach((button) => {
  button.addEventListener("click", function (e) {
    editingType = button.attributes.itemType.value;
    fetchEditItem(itemData);
    fetchParticipant();
  });
});

document.querySelectorAll(".delete-btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    async function itemDelete() {
      const res = await fetch("/items/:id", {
        method: "DELETE",
      });
      if ((await res.json()).status === true) {
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

async function fetchItem(data) {
  const res = data;
  if (res.status === true) {
    const typeName = ["food", "drink", "decoration", "other"];

    for (const tableName of typeName) {
      for (const items of res.itemObj[tableName]) {
        document.querySelector(`#${tableName}-table`).innerHTML += `
            <tr>
                <td>${items.name}</td>
            </tr>
            `;
      }
    }
  }
}

async function fetchEditItem(data) {
  const resEditItem = data;
  if (resEditItem.status === true) {
    for (const itemsData of resEditItem.itemObj[editingType]) {
      document.querySelector(`#edit-item-list`).innerHTML = `
            <tr id="${itemsData.id}">
                <td>${itemsData.name}</td>
                <td>${itemsData.quantity}</td>
                <td>${itemsData.price}</td>
                <td>${itemsData.user_id}</td>
                <td><button itemDelete="button" class="delete-btn"><i
                        class="bi bi-trash"></i></button>
                </td>
            </tr>
            `;
    }
  }
}

async function fetchParticipant() {
  const resParticipant = await (await fetch(`/items/participated`)).json();
  if (resParticipant.status === true) {
    for (const participantData of resParticipant.user) {
      document.querySelector(`#select-participant`).innerHTML = `
                <option selected>Select</option>
                <option id="all-participant">${participantData.first_name} + ${participantData.last_name}</option>
            `;
    }
  }
}
