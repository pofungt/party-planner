import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadName.js";

let editingType = null;
let itemData = null;
let eventID = null;

window.addEventListener("load", async () => {
    const query = new URLSearchParams(window.location.search);
    eventID = query.get("event-id");
    itemData = await (await fetch(`/items?eventID=${eventID}`)).json();
    addNavbar();
    await loadName();
    fetchItem();
    fetchParticipant(eventID);
    fetchPendingItems('food');
    document.body.style.display = "block";
});

document.querySelectorAll(".category-edit").forEach((button) => {
    button.addEventListener("click", function (e) {
        editingType = button.attributes.itemType.value;
        fetchEditItem(itemData);
    });
});

document
    .querySelector("#from-container")
    .addEventListener("submit", async function (e) {
        const query = new URLSearchParams(window.location.search);
        const eventID = query.get("event-id");
        e.preventDefault();
        const form = e.target;
        const typeName = editingType;
        const itemName = form.item_name.value;
        const itemQuantity = form.item_quantity.value;
        const itemPrice = form.item_price.value || null;
        const user_id = form.item_user.value || null;

        let formObj = {
            typeName,
            itemName,
            itemQuantity,
            itemPrice,
            user_id,
        };

        let dataPass = true;

        if (dataPass) {
            const res = await fetch(`/items/eventId/${eventID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formObj),
            });

            const eventsResult = await res.json();
            if (eventsResult.status === true) {
                const itemData = await (
                    await fetch(`/items?eventID=${eventID}`)
                ).json();
                fetchEditItem(itemData);
            }
        }
        form.reset();
        fetchItem();
        fetchPendingItems();
    });

// category items JS
async function fetchItem() {
    const res = await (await fetch(`/items?eventID=${eventID}`)).json();
    if (res.status === true) {
        const typeName = ["food", "drink", "decoration", "other"];
        for (const tableName of typeName) {
            let itemsList = "";
            for (const items of res.itemObj[tableName]) {
                itemsList += `
                  <tr>
                      <td>${items.name}</td>
                  </tr>
                `;
            }
            document.querySelector(`#${tableName}-table`).innerHTML = itemsList;
        }
    }
}

// category model list JS
async function fetchEditItem() {
    const resEditItem = await (await fetch(`/items?eventID=${eventID}`)).json();
    if (resEditItem.status === true) {
        let items = "";
        for (const itemsData of resEditItem.itemObj[editingType]) {
            items += `
            <tr id="item-row-${itemsData.id}">
                <td>${itemsData.name}</td>
                <td>${itemsData.quantity}</td>
                <td>${itemsData.price}</td>
                <td>${itemsData.first_name} ${itemsData.last_name}</td>
                <td>
                   <button id="item-${itemsData.id}" itemDelete="button" class="delete-btn">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }
        document.querySelector(`#edit-item-list`).innerHTML = items;
        addDeleteEventListener();
    }
}

function addDeleteEventListener() {
    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async function (e) {
            const itemID = e.currentTarget.id.slice(5);
            const res = await fetch(`/items/${itemID}`, {
                method: "DELETE",
            });
            if ((await res.json()).status === true) {
                const deleteResult = document.querySelector(
                    "#item-row-" + itemID
                );
                deleteResult.remove();
                fetchItem();
                fetchPendingItems();
            }
        });
    });
}

// modal participants select
async function fetchParticipant(eventID) {
    const resParticipant = await (
        await fetch(`/items/participated?eventID=${eventID}`)
    ).json();
    if (resParticipant.status === true) {
        for (const participantData of resParticipant.user) {
            document.querySelector(`#select-participant`).innerHTML += `
                <option value="${participantData.id}">${participantData.first_name} ${participantData.last_name}
                </option>
            `;
        }
    }
}

// shopping list JS
async function fetchPendingItems(selectType) {
    const resShopList = await (
        await fetch(`/items/pendingItems?eventID=${eventID}`)
    ).json();
    if (resShopList.status === true) {
        let listItems = "";
        for (const items of resShopList.itemObj[selectType]) {
            listItems += `
				<tr id="list-item-${items.id}">
					<td>
						<div class="pending-item">
							${items.name}
							<button id="checking-${items.id}" class="check-btn">
								<i class="bi bi-check-circle"></i>
							</button>
						</div>
					</td>
				</tr>
          `;
        }
        document.querySelector(`#shipping-list-update`).innerHTML = listItems;
        checkShoppingListItem();
        fetchItem();
    }
}

function checkShoppingListItem() {
    document.querySelectorAll(`.check-btn`).forEach((button) => {
        button.addEventListener("click", async function (e) {
            const itemID = e.currentTarget.id.slice(9);
            const res = await fetch(`/items/pendingItems/${itemID}`, {
                method: "PUT",
            });
            if ((await res.json()).status === true) {
                const updateOnTheList = document.querySelector(
                    "#list-item-" + itemID
                );
                updateOnTheList.remove();
            }
        });
    });
}

document
    .querySelector(`#back-page`)
    .addEventListener("click", function () {
		const params = new URLSearchParams(window.location.search);
		const eventId = params.get('event-id');
		const isCreator = params.get('is-creator');
        window.location= `/eventSummary/event.html?event-id=${eventId}&is-creator=${isCreator}`
    });

document.querySelectorAll(`.dropdown-item`).forEach((dropdown) => {
    dropdown.addEventListener("click", function(e) {
        const selectType =  e.currentTarget.innerHTML.toLowerCase();
        fetchPendingItems(selectType);
    })
})
