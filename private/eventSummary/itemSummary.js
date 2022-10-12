export async function fetchPendingItems(selectType) {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event-id');
    const resShopList = await (
        await fetch(`/items/pendingItems?eventID=${eventId}`)
    ).json();
    if (resShopList.status) {
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
        document.querySelector(`#shopping-list-update`).innerHTML = listItems;
        checkShoppingListItem();

        document.querySelectorAll(`.dropdown-item`).forEach((dropdown) => {
            dropdown.addEventListener("click", function (e) {
                const selectType = e.currentTarget.innerHTML.toLowerCase();
                fetchPendingItems(selectType);
            });
        });
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