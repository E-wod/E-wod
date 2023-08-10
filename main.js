const hamburger = document.querySelector(".hamburger");
const navBar = document.querySelector(".navBar");
const navLink = document.querySelectorAll(".navLnk");

hamburger.addEventListener("click", hamburger);
navBar.forEach(n => n.addEventListener("click", navBar));

function navBar() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}
