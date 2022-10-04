import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
    await loadInfo()
    addNavbar();
    loadName();
    document.body.style.display = "block";
});

async function loadInfo() {

    const res = await fetch(`/personalPage`);


    const firstName = document.querySelector("#first_name")
    const lastName = document.querySelector("#last_name")
    const email = document.querySelector("#email")
    const phone = document.querySelector("#phone")


    const result = await res.json()

    console.log(result)

    firstName.value = result.first_name
    lastName.value = result.last_name
    email.value = result.email
    phone.value = result.phone
}


document.querySelector('#personal-page-form').addEventListener('submit', async function updateInfo(event) {
    event.preventDefault()


    const form = event.target;
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    const phoneRegex = /^\d{3}\-\d{3}\-\d{4}$/;

    const lastName = form.last_name.value
    const firstName = form.first_name.value
    const phone = form.phone.value
    const email = form.email.value
    const currentPassword = form.current_password.value
    const newPassword = form.new_password.value
    const newConfirmedPassword = form.new_confirmed_password.value


    let dataPass = true;

    if (newPassword || newConfirmedPassword) {
        if (newPassword.length < 8 || newPassword.length > 20) {
            dataPass = false;
            alert("Password length must be 8-20 characters!");
        } else if (!passwordRegex.test(newPassword)) {
            dataPass = false;
            alert("Invalid password format!");
        } else if (!(newPassword === newConfirmedPassword)) {
            dataPass = false;
            alert("Password and confirm password do not match!");
        }
    }
    if (!lastName || !firstName || !phone) {
        dataPass = false;
        alert("Please check if fields are inputted correctly!");
    } else if (!currentPassword) {
        alert("Please input your password again if you wish to update your person info");
    } else if (!phoneRegex.test(phone) && !!phone) {
        dataPass = false;
        alert("Invalid phone format!");
    }

    if (dataPass) {

        const formObject = {}
        formObject['first_name'] = firstName
        formObject['last_name'] = lastName
        formObject['email'] = email
        formObject['phone'] = phone
        formObject['current_password'] = currentPassword
        if (newPassword) {
            formObject['password'] = newPassword
        } else {
            formObject['password'] = currentPassword
        }

        const res = await fetch(`/personalPage`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        })

        console.log(res.status)
        if (res.status === 400) {
            window.alert("Incorrect Password Input!")
        } else {
            const result = await res.json()
            alert("Update successful!")
            location.reload()
        }
    }
})