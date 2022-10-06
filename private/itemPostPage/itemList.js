const res = (await fetch (`/items`)).json();
if(res.status === true) {
 res.itemObj
}

const typeName = ["food", "drink","decoration","other"]
for ( tableName of typeName ) {
    for ( itemArr of itemObj){
        document.querySelector(`#${tableName}-table`).innerHTML = `
        <tr>
        <td>${itemArr}</td>
        </tr>
        `
    }
}

