(function() {
    const el = document.querySelector("#toggle-navbar");
    const navbarEl = document.querySelector("#navbar-menu");

    if (!el) {
        console.error("Navbar menu toggle not found - website might not function properly.");
        return;
    }

    if (!navbarEl) {
        console.error("Navbar menu not found - website might not function properly.");
        return;
    }
    el.addEventListener("click", ev => {
        ev.preventDefault();
        navbarEl.classList.toggle("navbar__list--shown");
    })
})();