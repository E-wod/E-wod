document.addEventListener("DOMContentLoaded", () => {
  applyImageReady();
  startImageWheels();
  initExternalScrollAnimation();
  initLoopToTopOnBottom(); // ✅ LOOP ADDED
});

/* IMAGE READY / FADE-IN HANDLING */
function applyImageReady(scope = document) {
  scope.querySelectorAll("img").forEach((img) => {
    if (
      img.closest(".wallPaper") ||
      img.closest(".navLogo") ||
      img.closest(".beNook") ||
      img.closest(".wheel-card") ||
      img.closest(".external-scroll-animation")
    ) {
      img.classList.remove("fade-img");
      img.classList.add("loaded");
      img.style.opacity = "1";
      return;
    }

    img.classList.add("fade-img");

    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
      img.addEventListener("error", () => img.classList.add("loaded"), { once: true });
    }
  });
}

/* HOMEPAGE IMAGE WHEEL */
function startImageWheels() {
  const wheelRows = Array.from(document.querySelectorAll(".wheel-row"));
  if (!wheelRows.length) return;

  const wheelState = [];

  let animationId = null;
  let resizeTimer = null;
  let lastTime = performance.now();
  let lastWindowWidth = window.innerWidth;
  let scrollBoost = 1;

  const buildWheelTrack = (row) => {
    const track = row.querySelector(".wheel-track");
    if (!track) return null;

    if (!track.dataset.originalHtml) {
      track.dataset.originalHtml = track.innerHTML;
    }

    track.innerHTML = track.dataset.originalHtml;

    const originals = Array.from(track.children).map((card) => card.cloneNode(true));
    const targetWidth = row.offsetWidth * 3.5;

    let loops = 0;

    while (track.scrollWidth < targetWidth && loops < 24) {
      originals.forEach((card) => track.appendChild(card.cloneNode(true)));
      loops++;
    }

    const cycleWidth = track.scrollWidth;
    originals.forEach((card) => track.appendChild(card.cloneNode(true)));

    applyImageReady(track);

    return { row, track, cycleWidth };
  };

  const initializeWheels = () => {
    wheelState.length = 0;

    wheelRows.forEach((row) => {
      const built = buildWheelTrack(row);
      if (!built) return;

      const speed = parseFloat(built.track.dataset.speed || "0.04");
      const direction = built.track.dataset.direction === "right" ? 1 : -1;
      const startOffset = direction === 1 ? -built.cycleWidth : 0;

      built.track.style.transform = `translate3d(${startOffset}px, 0, 0)`;

      wheelState.push({
        row: built.row,
        track: built.track,
        cycleWidth: built.cycleWidth,
        speed,
        direction,
        offset: startOffset
      });
    });
  };

  const animateWheels = (now) => {
    const delta = Math.min(now - lastTime, 32);
    lastTime = now;

    scrollBoost += (1 - scrollBoost) * 0.035;

    wheelState.forEach((item) => {
      const paused = item.row.matches(":hover");
      const speed = paused ? 0 : item.speed * scrollBoost;
      const movement = item.direction * speed * delta;

      item.offset += movement;

      if (item.direction < 0 && item.offset <= -item.cycleWidth) {
        item.offset += item.cycleWidth;
      }

      if (item.direction > 0 && item.offset >= 0) {
        item.offset -= item.cycleWidth;
      }

      item.track.style.transform = `translate3d(${item.offset}px, 0, 0)`;
    });

    animationId = requestAnimationFrame(animateWheels);
  };

  const restartWheels = () => {
    initializeWheels();

    if (animationId) cancelAnimationFrame(animationId);

    lastTime = performance.now();
    animationId = requestAnimationFrame(animateWheels);
  };

  window.addEventListener("wheel", () => {
    scrollBoost = 2.2;
  }, { passive: true });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWindowWidth) < 40) return;

      lastWindowWidth = currentWidth;
      restartWheels();
    }, 450);
  }, { passive: true });

  restartWheels();
}

/* EXTERNAL SCROLL ANIMATION */
function initExternalScrollAnimation() {
  const root = document.querySelector(".external-scroll-animation");

  if (!root) return;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js")
    .then(() => loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/ScrollTrigger.min.js"))
    .then(() => runExternalScrollFallback(root));
}

/* --- KEEP YOUR EXISTING GSAP FUNCTIONS HERE (UNCHANGED) --- */

/* LOOP BACK TO TOP */
function initLoopToTopOnBottom() {
  let isLooping = false;

  window.addEventListener("scroll", () => {
    if (isLooping) return;

    const bottomReached =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    if (!bottomReached) return;

    isLooping = true;

    window.scrollTo(0, 0);

    setTimeout(() => {
      isLooping = false;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 80);
  }, { passive: true });
}
