export function registerButtons() {
    document.querySelector('.register-form')
        .addEventListener('submit', async function(e) {
            e.preventDefault();

            const form = e.target;
            let formObj = {
                'first_name': form.first_name.value,
                'last_name': form.last_name.value,
                'email': form.email.value,
                'phone': form.phone.value,
                'password': form.password.value,
                'confirm_password': form.confirm_password.value
            }

            const res = await fetch('/register', {
                method: 'POST',
                headers: {
					'Content-Type': 'application/json'
				},
                body: JSON.stringify(formObj)
            });
            const registerResult = await res.json();
            if (registerResult.duplicate) {
                form.reset();
                alert("Registered already!");
            } else if (registerResult.passwordNotMatch) {
                form.reset();
                alert("Password not match!");
            } else if (!registerResult.status) {
                form.reset();
                alert("Unable to Register, please try again!");
            } else {
                window.location.href = "./landing-page.html";
            }
        })   
}