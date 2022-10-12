import { addNavbar } from '/functions/addNavbar.js';
import { loadName } from '/functions/loadName.js';
import { addLoginNavbar } from '/functions/addLoginNavbar.js';

window.addEventListener('load', async () => {
	const res = await fetch('/login/name');
	if (res.status === 200) {
		addNavbar();
		loadName();
	} else {
		addLoginNavbar();
	}

	document.body.style.display = 'block';
});

document.querySelector('#login-form-submit').addEventListener('click', async function (event) {
	const userEmail = document.querySelector('#user-email').value;
	const userPassword = document.querySelector('#user-password').value;
	if (userEmail !== '' && userPassword !== '') {
		const formObj = {
			email: userEmail,
			password: userPassword
		};
		const res = await fetch('/login', {
			method: 'POST',
			headers: {
				'content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});
		const loginResult = await res.json();
		if (loginResult.status) {
			const params = new URLSearchParams(window.location.search);
			if (params.has('event-id') && params.has('token')) {
				const eventId = params.get('event-id');
				const token = params.get('token');
				window.location.href = `/invitationPage/invitation.html?event-id=${eventId}&token=${token}`;
			} else {
				window.location.href = '/index.html';
			}
		} else {
			alert('Unable to login!');
		}
	}
});

document.querySelector('.register-form').addEventListener('submit', async function (e) {
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
		password: password
	};
	let dataPass = true;

	// Checking data validity
	if (!first_name || !last_name || !email || !password || !confirm_password || !phone) {
		dataPass = false;
		alert('Please fill in all necessary fields!');
	} else if (!emailRegex.test(email)) {
		dataPass = false;
		alert('Invalid email format!');
	} else if (!phoneRegex.test(phone)) {
		dataPass = false;
		alert('Invalid phone format!');
	} else if (!(password === confirm_password)) {
		dataPass = false;
		alert('Password and confirm password do not match!');
	} else if (password.length < 8 || password.length > 20) {
		dataPass = false;
		alert('Password length must be 8-20 characters!');
	} else if (!passwordRegex.test(password)) {
		dataPass = false;
		alert('Invalid password format!');
	}

	if (dataPass) {
		const res = await fetch('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(formObj)
		});

		const registerResult = await res.json();
		form.reset();
		if (registerResult.duplicate) {
			alert('Registered already!');
		} else if (registerResult.passwordNotMatch) {
			alert('Password not match!');
		} else if (!registerResult.status) {
			alert('Unable to Register, please try again!');
		} else {
			const params = new URLSearchParams(window.location.search);
			if (params.has('event-id') && params.has('token')) {
				alert('Successfully registered! Please login now to join the event.');
				const myModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
				myModal.hide();
			} else {
				alert('Successfully registered!');
				const myModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
				myModal.hide();
			}
		}
	}
});
