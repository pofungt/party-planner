export function addNavbar() {
    
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
                    <div class="user-login dropdown">
                        <button type="button" class="btn landing-Page-login-btn dropdown-toggle"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-person-circle"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/private/personalPage/personalPage.html">Edit Profile</a></li>
                            <li><a class="dropdown-item" href="/public/landingPage.html">Log out</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}