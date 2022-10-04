import { addNavbar } from "/functions/addNavbar.js";
import { loadName } from "/functions/loadEvent.js";
import { addLoginNavbar } from "/functions/addLoginNavbar.js";

window.addEventListener('load', async () => {
  const res = await fetch("/login");
  const result = await res.json();
  
  if (result.status) {
    addNavbar();
    loadName();
  } else {
    addLoginNavbar();
  }

  setTimeout(()=>{document.body.style.display = "block";},100)
})

document
  .querySelector("#login-form-submit")
  .addEventListener("click", async function (event) {
    const userEmail = document.querySelector("#user-email").value;
    const userPassword = document.querySelector("#user-password").value;
    if (userEmail !== "" && userPassword !== "") {
      const formObj = {
        email: userEmail,
        password: userPassword,
      };
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(formObj),
      });
      const loginResult = await res.json();
      if (loginResult.status === true) {
        window.location = "/index.html";
      }
    }
  });

document
  .querySelector(".register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const emailRegex = /\S+@\S+\.\S+/;
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    const phoneRegex = /^\d{3}\-\d{3}\-\d{4}$/;

    const first_name = form.first_name.value;
    const last_name = form.last_name.value;
    const email = form.email.value;
    const phone = form.phone.value;
    const password = form.password.value;
    const confirm_password = form.confirm_password.value;

    let formObj = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
      password: password,
    };
    let dataPass = true;

    // Checking data validity
    if (!first_name || !last_name || !email || !password || !confirm_password) {
      dataPass = false;
      alert("Please fill in all necessary fields!");
    } else if (!emailRegex.test(email)) {
      dataPass = false;
      alert("Invalid email format!");
    } else if (!phoneRegex.test(phone) && !!phone) {
      dataPass = false;
      alert("Invalid phone format!");
    } else if (!(password === confirm_password)) {
      dataPass = false;
      alert("Password and confirm password do not match!");
    } else if (password.length < 8 || password.length > 20) {
      dataPass = false;
      alert("Password length must be 8-20 characters!");
    } else if (!passwordRegex.test(password)) {
      dataPass = false;
      alert("Invalid password format!");
    }

    if (dataPass) {
      const res = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObj),
      });
      const registerResult = await res.json();
      form.reset();
      if (registerResult.duplicate) {
        alert("Registered already!");
      } else if (registerResult.passwordNotMatch) {
        alert("Password not match!");
      } else if (!registerResult.status) {
        alert("Unable to Register, please try again!");
      } else {
        const myModal = bootstrap.Modal.getInstance(
          document.getElementById("register-modal")
        );
        myModal.hide();
      }
    }
  });
