const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navMenu");
const navLink = document.querySelectorAll(".navLink");
const btnBox = document.querySelector(".btnBox");
const socLnk = document.querySelector(".socLnk");


hamburger.addEventListener("click", mobileMenu);
navLink.forEach(n => n.addEventListener("click", closeMenu));

function mobileMenu() {
    hamburger.classList.toggle("active");
    navLink.classList.toggle("active");
}

function closeMenu() {
    hamburger.classList.remove("active");
    navLink.classList.remove("active");
}
