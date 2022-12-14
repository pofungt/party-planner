export function addLoginNavbar() {
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
                        Party Planner
                    </a>
                </nav>
                <div class="login-part">
                    <div class="user-login">
                        <button type="button" class="btn landing-Page-login-btn" data-bs-toggle="modal" data-bs-target="#login-modal">
                            <i class="bi bi-person-circle"></i>    
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
