const res = await (await fetch(`/items?eventID=1`)).json();
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

