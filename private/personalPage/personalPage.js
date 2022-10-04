
window.addEventListener('load', loadInfo())

let userID = ""

async function getUserID (req, res) {
    const res = await fetch ('/')
    const result = res.json();
    userID = result
}

async function loadInfo() {

    const res = await fetch(`/personalPage`);
    
    if (res.status !== 200) {
        const data = await res.json();
        alert(data.msg);
        return;
    }

    const firstName = document.querySelector("#first_name")
    const lastName = document.querySelector("#last_name")
    const email = document.querySelector("#email")
    const phone = document.querySelector("#phone")


    const result = await res.json()
    firstName.value = result.firstName
    lastName.value = result.lastName
    email.value = result.email
    email.readonly = true
    phone.value = result.phone
}


document.querySelector('.update').addEventListener('submit', async function updateInfo(event) {

    const form = event.target;
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    const phoneRegex = /^\d{3}\-\d{3}\-\d{4}$/;

    const lastName = form.last_name.value
    const firstName = form.first_name.value
    const currentPassword = form.current_password.value
    const newPassword = form.new_password.value
    const confirmedNewPassword = form.confirm_new_password.value


    let dataPass = true;

    if (!lastName || !firstName || !currentPassword || !newPassword) {
        dataPass = false;
        alert("Please check if fields are inputted correctly!");
    } else if (!phoneRegex.test(phone) && !!phone) {
        dataPass = false;
        alert("Invalid phone format!");
    } else if (!(newPassword === confirmedNewPassword)) {
        dataPass = false;
        alert("Password and confirm password do not match!");
    } else if (newPassword.length < 8 || newPassword.length > 20) {
        dataPass = false;
        alert("Password length must be 8-20 characters!");
    } else if (!passwordRegex.test(newPassword)) {
        dataPass = false;
        alert("Invalid password format!");
    }

    if (dataPass) {
        const formObject = {}
        formObject['first_name'] = firstName
        formObject['last_name'] = lastName
        formObject['email'] = email
        formObject['phone'] = phone
        formObject['password'] = newPassword
        formObject['current_password'] = currentPassword

        const res = await fetch(`/personalPage/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        })
    }

    if (res.status = 400) {
        window.alert("Your current password is incorrect!")
    } else {
        const result = await res.json()
    }
})
