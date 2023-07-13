const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLink = document.querySelectorAll(".nav-link");

hamburger.addEventListener("click", mobileMenu);
navLink.forEach(n => n.addEventListener("click", closeMenu));

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}


  // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
  // Please acknowledge use of this code by including this header.

  var rotateComplete = function(e) {
    with(target.style) {
      webkitAnimationName = MozAnimationName = msAnimationName = animationName = "";
    }
    target.insertBefore(arr[arr.length-1], arr[0]);
    setTimeout(function(el) {
      with(el.style) {
        webkitAnimationName = MozAnimationName = msAnimationName = animationName = "rotator";
      }
    }, 0, target);
  };

  var target = document.getElementById("rotator");
  var arr = target.getElementsByTagName("a");

  target.addEventListener("webkitAnimationEnd", rotateComplete, false);
  target.addEventListener("animationend", rotateComplete, false);
  target.addEventListener("MSAnimationEnd", rotateComplete, false);
  window.addEventListener("DOMContentLoaded", function(e) {

    var rotateComplete = function(e) {
      target.style.webkitAnimationName = "";
      target.insertBefore(arr[arr.length-1], arr[0]);
      setTimeout(function(el) {
        el.style.webkitAnimationName = "rotator";
      }, 0, target);
    };

    var target = document.getElementById("rotator");
    var arr = target.getElementsByTagName("a");

    target.addEventListener("webkitAnimationEnd", rotateComplete, false);

  }, false);
