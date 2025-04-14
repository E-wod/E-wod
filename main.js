// Hambuurger
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
hamburger.classList.toggle("active");
navMenu.classList.toggle("active");
}
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
hamburger.classList.remove("active");
navMenu.classList.remove("active");
}
// GOTO TOP BUTTON
var scrollToTopBtn = document.getElementById("scrollToTopBtn");
var rootElement = document.documentElement;
scrollToTopBtn.addEventListener("click", scrollToTop);
function scrollToTop() {
  // Scroll to top logic
  rootElement.scrollTo({
    top: 0,
    behavior: "smooth"
  });
// Splash
npm install @lottiefiles/dotlottie-react
