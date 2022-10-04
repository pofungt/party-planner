export function addLoginNavbar() {
    
    document.querySelector("head").innerHTML += `
        <link rel="stylesheet" href="/addNavbar.css" />
    `;

    document.querySelector(".navbar-container").innerHTML = `
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
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}