export function addNavbar() {
	document.querySelector('head').innerHTML += `
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400&family=Pacifico&display=swap"
        rel="stylesheet" />
        <link rel="stylesheet" href="/addNavbar.css" />
    `;

	document.querySelector('.navbar-container').innerHTML = `
        <div class="row">
            <div class="col-12 header-nav">
                <nav class="navbar">
                    <a class="navbar-brand" href="/index.html">
                        <img src="/asset/party_icon.jpg" width="54" height="54" class="d-inline-block align-top">
                        <div class="navbar-logo-text">
                            Party Planner
                        </div>
                    </a>
                </nav>
                <div class="login-part">
                    <div class="user-login dropdown">
                        <button type="button" class="btn landing-Page-login-btn dropdown-toggle"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-person-circle"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/personalPage/personalPage.html">Edit Profile</a></li>
                            <li><a class="dropdown-item" href="/comment/comment.html">Comments</a></li>
                            <li><a class="dropdown-item logout">Log out</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

	document.querySelector('.logout').addEventListener('click', async () => {
		const res = await fetch('/login/logout', {
			method: 'POST'
		});

		if (res.status !== 200) {
			const data = await res.json();
			alert(data.msg);
			return;
		}

		const result = await res.json();

		if (result.status) {
			window.location.href = '/';
		} else {
			alert('Unable to log out!');
		}
	});
}
