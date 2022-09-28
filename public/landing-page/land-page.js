document
    .querySelector("#login-form-submit")
    .addEventListener('click', async function (event) {
        const userEmail = document.querySelector("#user-email").value
        const userPassword = document.querySelector("#user-password").value
    if (userEmail !== "" && userPassword !== ""){
        const res = await fetch ('/login', {
            method: 'POST',
        })
        const result = await res.
    }
import { registerButtons } from "./registerButtons.js";

document.querySelector(".login-button").addEventListener('click', function(event){
    
});

registerButtons();