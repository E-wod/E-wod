const hamburger = document.querySelector(".hamburger");
const navBar = document.querySelector(".navBar");

navBar.addEventListener("click", hamburger);
navBar.forEach(n => n.addEventListener("click", hamburger));

function navBar() {
    hamburger.classList.toggle("active");
    navBar.classList.toggle("active");
}

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}
