document.addEventListener("DOMContentLoaded", () => {
  applyImageReady();
  startImageWheels();
  initExternalScrollAnimation();
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

    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    lastTime = performance.now();
    animationId = requestAnimationFrame(animateWheels);
  };

  window.addEventListener(
    "wheel",
    () => {
      scrollBoost = 2.2;
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;

        if (Math.abs(currentWidth - lastWindowWidth) < 40) return;

        lastWindowWidth = currentWidth;
        restartWheels();
      }, 450);
    },
    { passive: true }
  );

  restartWheels();
}

/* EXTERNAL SCROLL ANIMATION - JS ONLY */
function initExternalScrollAnimation() {
  const root = document.querySelector(".external-scroll-animation");

  if (!root) return;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js")
    .then(() => loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/ScrollTrigger.min.js"))
    .then(() => runExternalScrollFallback(root))
    .catch(() => {
      console.warn("External scroll animation fallback failed to load.");
    });
}

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      if (existing.dataset.loaded === "true" || existing.readyState === "complete") {
        resolve();
      } else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.loaded = "false";

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    script.onerror = reject;

    document.head.appendChild(script);
  });
}

function runExternalScrollFallback(root) {
  if (!window.gsap || !window.ScrollTrigger) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const firstSection =
    root.querySelector(".external-panel-start") ||
    root.querySelector(":scope > section:first-of-type");

  const secondSection = root.querySelector(":scope > section:nth-of-type(2)");
  const articles = secondSection
    ? Array.from(secondSection.querySelectorAll(":scope > article"))
    : Array.from(root.querySelectorAll("article"));

  if (!firstSection || !articles.length) return;

  root.querySelectorAll(".filler").forEach((el) => el.classList.add("is-active"));

  gsap.set(root.querySelectorAll(".fixed"), {
    position: "fixed",
    inset: 0,
    opacity: 0,
    zIndex: 1
  });

  gsap.set(root.querySelectorAll(".static"), {
    position: "absolute",
    inset: 0,
    zIndex: 6
  });

  animateExternalStartPanel(gsap, firstSection);
  animateExternalArticles(gsap, articles);

  ScrollTrigger.refresh();
}

function animateExternalStartPanel(gsap, section) {
  const fixed = section.querySelector(".fixed");

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 1,
    zIndex: 5,
    transformOrigin: "50% 0%"
  });

  gsap.to(fixed, {
    scaleX: 0.35,
    scaleY: 0.5,
    yPercent: -10,
    opacity: 0,
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom 50%",
      scrub: 0.5
    }
  });
}

function animateExternalArticles(gsap, articles) {
  articles.forEach((article, index) => {
    animateArticleFixedLayer(gsap, article, index);
    animateArticleImage(gsap, article, index);
    animateArticleTitle(gsap, article, index);
  });

  animateTextBlocks(gsap, articles[2]);
  animateFinalArticle(gsap, articles[articles.length - 1]);
}

function animateArticleFixedLayer(gsap, article, index) {
  const fixed = article.querySelector(".fixed");

  if (!fixed) return;

  if (index === 0) {
    gsap.set(fixed, {
      opacity: 0,
      clipPath: "ellipse(220% 200% at 50% 300%)",
      zIndex: 3
    });

    gsap.to(fixed, {
      opacity: 1,
      clipPath: "ellipse(220% 200% at 50% 175%)",
      scrollTrigger: {
        trigger: article,
        start: "top bottom",
        end: "top top",
        scrub: 0.5
      }
    });

    gsap.to(fixed, {
      opacity: 0,
      scrollTrigger: {
        trigger: article,
        start: "bottom 80%",
        end: "bottom 45%",
        scrub: 0.5
      }
    });

    return;
  }

  gsap.set(fixed, {
    opacity: 0,
    zIndex: 3
  });

  gsap.to(fixed, {
    opacity: 1,
    scrollTrigger: {
      trigger: article,
      start: "top 80%",
      end: "top top",
      scrub: 0.5
    }
  });

  gsap.to(fixed, {
    opacity: 0,
    scrollTrigger: {
      trigger: article,
      start: "bottom 80%",
      end: "bottom 45%",
      scrub: 0.5
    }
  });
}

function animateArticleImage(gsap, article, index) {
  const img = article.querySelector("img");

  if (!img) return;

  gsap.from(img, {
    scale: index === 0 ? 5 : 1.3,
    scrollTrigger: {
      trigger: article,
      start: "top bottom",
      end: "top top",
      scrub: 0.5
    }
  });
}

function animateArticleTitle(gsap, article, index) {
  const title = article.querySelector("h2");
  if (!title) return;

  const fadeStart = index === 0 ? "top 35%" : "bottom 95%";
  const fadeEnd = index === 0 ? "top 5%" : "bottom 75%";

  gsap.from(title, {
    yPercent: 65,
    opacity: 0,
    scrollTrigger: {
      trigger: article,
      start: "top 75%",
      end: "top 38%",
      scrub: 0.45
    }
  });

  gsap.to(title, {
    opacity: 0,
    filter: "blur(2.5rem)",
    yPercent: -18,
    scrollTrigger: {
      trigger: article,
      start: fadeStart,
      end: fadeEnd,
      scrub: 0.45
    }
  });
}

function animateTextBlocks(gsap, article) {
  if (!article) return;

  const lines = article.querySelectorAll(".text-blocks p");
  const textBlocks = article.querySelector(".text-blocks");
  const fillerTitle = article.querySelector(".filler h2");

  gsap.set(article, { height: "360vh" });

  lines.forEach((line, index) => {
    gsap.fromTo(
      line,
      { yPercent: 120, opacity: 0, filter: "blur(1rem)" },
      {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0)",
        scrollTrigger: {
          trigger: article,
          start: `top -=${45 + index * 26}%`,
          end: `top -=${62 + index * 26}%`,
          scrub: 0.45
        }
      }
    );

    gsap.to(line, {
      opacity: 0,
      yPercent: -70,
      filter: "blur(2rem)",
      scrollTrigger: {
        trigger: article,
        start: `top -=${70 + index * 26}%`,
        end: `top -=${84 + index * 26}%`,
        scrub: 0.45
      }
    });
  });

  if (textBlocks) {
    gsap.to(textBlocks, {
      opacity: 0,
      filter: "blur(2rem)",
      scrollTrigger: {
        trigger: article,
        start: "bottom 145%",
        end: "bottom 125%",
        scrub: 0.45
      }
    });
  }

  if (fillerTitle) {
    gsap.fromTo(
      fillerTitle,
      { opacity: 0, yPercent: 90, filter: "blur(1rem)" },
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0)",
        scrollTrigger: {
          trigger: article,
          start: "bottom 145%",
          end: "bottom 125%",
          scrub: 0.45
        }
      }
    );

    gsap.to(fillerTitle, {
      opacity: 0,
      yPercent: -60,
      filter: "blur(2.5rem)",
      scrollTrigger: {
        trigger: article,
        start: "bottom 118%",
        end: "bottom 102%",
        scrub: 0.45
      }
    });
  }
}

function animateFinalArticle(gsap, article) {
  if (!article) return;

  const fixed = article.querySelector(".fixed");
  const title = article.querySelector("h2");

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 0,
    clipPath: "ellipse(180% 120% at 50% 155%)",
    zIndex: 5
  });

  gsap.to(fixed, {
    opacity: 1,
    clipPath: "ellipse(180% 120% at 50% 75%)",
    scrollTrigger: {
      trigger: article,
      start: "top 88%",
      end: "top 32%",
      scrub: 0.45
    }
  });

  if (title) {
    gsap.from(title, {
      yPercent: 80,
      opacity: 0,
      scrollTrigger: {
        trigger: article,
        start: "top 72%",
        end: "top 38%",
        scrub: 0.45
      }
    });
  }
}
