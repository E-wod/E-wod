document.addEventListener("DOMContentLoaded", () => {
  applyImageReady();
  startImageWheels();
  initExternalScrollAnimation();
  initLoopToTopOnBottom();
});

/* IMAGE READY */
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

/* IMAGE WHEELS (unchanged core) */
function startImageWheels() {
  const wheelRows = Array.from(document.querySelectorAll(".wheel-row"));
  if (!wheelRows.length) return;

  const wheelState = [];
  let animationId = null;
  let lastTime = performance.now();
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

    while (track.scrollWidth < targetWidth) {
      originals.forEach((card) => track.appendChild(card.cloneNode(true)));
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

      wheelState.push({
        ...built,
        speed,
        direction,
        offset: direction === 1 ? -built.cycleWidth : 0
      });
    });
  };

  const animateWheels = (now) => {
    const delta = now - lastTime;
    lastTime = now;

    scrollBoost += (1 - scrollBoost) * 0.05;

    wheelState.forEach((item) => {
      const movement = item.direction * item.speed * scrollBoost * delta;
      item.offset += movement;

      if (item.direction < 0 && item.offset <= -item.cycleWidth) {
        item.offset += item.cycleWidth;
      }
      if (item.direction > 0 && item.offset >= 0) {
        item.offset -= item.cycleWidth;
      }

      item.track.style.transform = `translate3d(${item.offset}px,0,0)`;
    });

    animationId = requestAnimationFrame(animateWheels);
  };

  window.addEventListener("wheel", () => (scrollBoost = 2.2), { passive: true });

  initializeWheels();
  animationId = requestAnimationFrame(animateWheels);
}

/* SCROLL DIRECTION TRACKING */
let lastScroll = 0;
let scrollDirection = 1;

window.addEventListener("scroll", () => {
  const current = window.scrollY;
  scrollDirection = current > lastScroll ? 1 : -1;
  lastScroll = current;
});

/* EXTERNAL ANIMATION */
function initExternalScrollAnimation() {
  const root = document.querySelector(".external-scroll-animation");
  if (!root) return;

  loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js")
    .then(() => loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/ScrollTrigger.min.js"))
    .then(() => runExternalScrollFallback(root));
}

function loadExternalScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();

    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function runExternalScrollFallback(root) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const articles = Array.from(root.querySelectorAll("article"));

  articles.forEach((article, index) => {
    animateArticleImage(gsap, article, index);
    animateArticleText(gsap, article, index);
  });

  ScrollTrigger.refresh();
}

/* IMAGE ANIMATION */
function animateArticleImage(gsap, article, index) {
  const img = article.querySelector(".fixed img");
  if (!img) return;

  gsap.fromTo(
    img,
    { scale: index === 0 ? 1.3 : 1.15 },
    {
      scale: 1,
      scrollTrigger: {
        trigger: article,
        start: "top bottom",
        end: "top top",
        scrub: 0.6
      }
    }
  );
}

/* TEXT ANIMATION WITH DIRECTIONAL BLUR */
function animateArticleText(gsap, article, index) {
  const elements = article.querySelectorAll("h1, h2, h3, p");

  elements.forEach((el, i) => {
    gsap.fromTo(
      el,
      {
        yPercent: 80,
        opacity: 0,
        filter: "blur(2rem)"
      },
      {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0rem)",
        scrollTrigger: {
          trigger: article,
          start: index === 2 ? "top 90%" : "top 70%",
          end: index === 2 ? "top 55%" : "top 35%",
          scrub: 0.5
        }
      }
    );

    gsap.to(el, {
      opacity: 0,
      filter: "blur(4rem)",
      yPercent: () => (scrollDirection === 1 ? -20 : 20),
      scrollTrigger: {
        trigger: article,
        start: index === 2 ? "bottom 70%" : "bottom 75%",
        end: "bottom 40%",
        scrub: 0.5
      }
    });
  });
}

/* TRUE LOOP (SMOOTH) */
function initLoopToTopOnBottom() {
  let looping = false;

  window.addEventListener("scroll", () => {
    if (looping) return;

    const bottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 5;

    if (!bottom) return;

    looping = true;

    window.scrollTo({
      top: 2,
      behavior: "auto"
    });

    setTimeout(() => {
      looping = false;
    }, 150);
  });
}
