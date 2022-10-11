import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';

window.addEventListener('load', async () => {
    addNavbar();
    loadName();
    getComment ()
  
    document.body.style.display = "block";
});

async function getComment () {
    const res = await fetch(`/comment/`);

    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }

    const result = await res.json();
    console.log (result)
}

async function postComment (result) {
    


    document.querySelector("#comment-form").addEventListener("submit", (e)=>{
        e.preventDefault()

        const form = e.target
        const comment = form["comment"].value
        const category = form['category'].value
    })

}
