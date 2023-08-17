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


(function() {
    // Add event listener
    document.addEventListener("mousemove", parallax);
    const elem = document.querySelector("#parallax");
    // Magic happens here
    function parallax(e) {
        let _w = window.innerWidth/2;
        let _h = window.innerHeight/2;
        let _mouseX = e.clientX;
        let _mouseY = e.clientY;
        let _depth1 = `${50 - (_mouseX - _w) * 0.003}% ${50 - (_mouseY - _h) * 0.01}%`;
        let _depth2 = `${50 - (_mouseX - _w) * 0.006}% ${50 - (_mouseY - _h) * 0.02}%`;
        let _depth3 = `${50 - (_mouseX - _w) * 0.009}% ${50 - (_mouseY - _h) * 0.03}%`;
	let _depth4 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.005}%`;
	let _depth5 = `${50 - (_mouseX - _w) * 0.06}% ${50 - (_mouseY - _h) * 0.007}%`;
	let _depth6 = `${50 - (_mouseX - _w) * 0.010}% ${50 - (_mouseY - _h) * 0.009}%`;
	let _depth7 = `${50 - (_mouseX - _w) * 0.022}% ${50 - (_mouseY - _h) * 0.012}%`;
	let _depth8 = `${50 - (_mouseX - _w) * 0.015}% ${50 - (_mouseY - _h) * 0.013}%`;
	let _depth9 = `${50 - (_mouseX - _w) * 0.016}% ${50 - (_mouseY - _h) * 0.016}%`;
	let _depth10 = `${50 - (_mouseX - _w) * 0.022}% ${50 - (_mouseY - _h) * 0.019}%`;
	let _depth11 = `${50 - (_mouseX - _w) * 0.029}% ${50 - (_mouseY - _h) * 0.022}%`;
	let _depth13 = `${50 - (_mouseX - _w) * 0.036}% ${50 - (_mouseY - _h) * 0.025}%`;
		
        let x = `${_depth13}, ${_depth11}, ${_depth10}, ${_depth9}, ${_depth8}, ${_depth7}, ${_depth6}, ${_depth5}, ${_depth4}, ${_depth3}, ${_depth2}, ${_depth1}`;
        console.log(x);
        elem.style.backgroundPosition = x;
    }

})();
