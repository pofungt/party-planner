export async function fetchPendingItems() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const resShopList = await (
        await fetch(`/items/pendingItems?eventID=${eventId}`)
    ).json();
    if (resShopList.status) {
        let listItems = "";

        for (const items of resShopList.itemObj["food"]) {
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
        document.querySelector(`#shopping-list-update`).innerHTML = listItems;
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

async function fetchItem() {
    const res = await (await fetch(`/items?eventID=${eventId}`)).json();
    if (res.status) {
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