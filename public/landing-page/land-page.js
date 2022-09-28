document
    .querySelector("#login-form-submit")
    .addEventListener('click', async function (event) {
        const userEmail = document.querySelector("#user-email").value
        const userPassword = document.querySelector("#user-password").value
    if (userEmail !== "" && userPassword !== ""){
        const formObj = {
            'email' : userEmail,
            'password' : userPassword
        }
        const res = await fetch ('/login', {
            method: 'POST',
            headers: {
                'content-Type': 'application/json'
            },
            body: JSON.stringify(formObj)
        })
        const loginResult = await res.json();
        if(loginResult.status === true){
            window.location = "/"
        }
    }





import { registerButtons } from "./registerButtons.js";

registerButtons();