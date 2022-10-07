import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";

window.addEventListener("load", async () => {
  await loadInfo();
  await hideInfo();
  addNavbar();
  loadName();

  document.body.style.display = "block";
});

async function isGoogleUser(password) {
  if (password.substring(0, 11) === "google_user") {
    return true;
  } else {
    return false;
  }
}

async function hideInfo() {
  const res = await fetch(`/personalPage`);
  const result = await res.json();
  const divCluster = document.querySelectorAll(".google-user");

  if (await isGoogleUser(result.password)) {
    divCluster.forEach((div) => {
      div.style.display = "none";
    });
  } else {
    divCluster.forEach((div) => {
      div.style.display = "block";
    });
  }
}

async function loadInfo() {
  const res = await fetch(`/personalPage`);
  const result = await res.json();

  const firstName = document.querySelector("#first_name");
  const lastName = document.querySelector("#last_name");
  const email = document.querySelector("#email");
  const phone = document.querySelector("#phone");
  const currentPassword = document.querySelector("#current_password");
  const newPassword = document.querySelector("#new_password");
  const newConfirmedPassword = document.querySelector(
    "#new_confirmed_password"
  );

  firstName.value = result.first_name;
  lastName.value = result.last_name;
  email.value = result.email;
  phone.value = result.phone;
  currentPassword.value = "";
  newPassword.value = "";
  newConfirmedPassword.value = "";
}

document
  .querySelector("#personal-page-form")
  .addEventListener("submit", async function updateInfo(event) {
    event.preventDefault();

    const form = event.target;
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    const phoneRegex = /^\d{3}\-\d{3}\-\d{4}$/;

    const lastName = form.last_name.value;
    const firstName = form.first_name.value;
    const phone = form.phone.value;
    const email = form.email.value;
    const currentPassword = form.current_password.value;
    const newPassword = form.new_password.value;
    const newConfirmedPassword = form.new_confirmed_password.value;

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
      } else if (newPassword === currentPassword) {
        dataPass = false;
        alert("Your current password and the new password are the same!");
      } else if (!currentPassword) {
        dataPass = false;
        alert(
          "Please input your current password if you wish to update your password"
        );
      }
    }

    if (!lastName || !firstName || !phone) {
      dataPass = false;
      alert("Please check if fields are inputted correctly!");
    } else if (!phoneRegex.test(phone) && !!phone) {
      dataPass = false;
      alert("Invalid phone format!");
    }

    if (dataPass) {
      const formObject = {};
      formObject["first_name"] = firstName;
      formObject["last_name"] = lastName;
      formObject["email"] = email;
      formObject["phone"] = phone;
      formObject["current_password"] = currentPassword;
      formObject["new_password"] = newPassword;
      if (newPassword) {
        formObject["password"] = newPassword;
      } else {
        formObject["password"] = currentPassword;
      }

      const res = await fetch(`/personalPage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });
      const result = await res.json();
      console.log(result);

      if (res.status === 400) {
        alert("Something wrong, please check if you have the correct password");
      } else {
        alert("Update successful!");
        location.reload();
      }
    }
  });
