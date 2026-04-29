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

  clearScopedFilters(root);

  root.querySelectorAll(".filler").forEach((el) => el.classList.add("is-active"));

  gsap.set(root.querySelectorAll(".fixed"), {
    position: "fixed",
    inset: 0,
    opacity: 0,
    zIndex: 1,
    filter: "none"
  });

  gsap.set(root.querySelectorAll(".static"), {
    position: "absolute",
    inset: 0,
    zIndex: 6,
    filter: "none"
  });

  gsap.set(root.querySelectorAll("h1, h2, .text-blocks p, .filler h2"), {
    filter: "none",
    textShadow: "none"
  });

  animateExternalStartPanel(gsap, firstSection);
  animateExternalArticles(gsap, articles);

  ScrollTrigger.refresh();
}

function clearScopedFilters(root) {
  root.querySelectorAll(
    ".fixed, .static, .content, .text-wrap, .loud-wrap, .chat-container, .text-blocks, .text-blocks p, .filler, .filler h2, h1, h2"
  ).forEach((el) => {
    el.style.filter = "none";
  });
}

function animateExternalStartPanel(gsap, section) {
  const fixed = section.querySelector(".fixed");
  const title = section.querySelector("h1, h2");

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 1,
    zIndex: 5,
    transformOrigin: "50% 0%",
    filter: "none"
  });

  if (title) {
    gsap.set(title, {
      opacity: 1,
      scale: 1,
      filter: "none"
    });
  }

  gsap.to(fixed, {
    scaleX: 0.35,
    scaleY: 0.5,
    yPercent: -10,
    opacity: 0,
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom 50%",
      scrub: 0.5,
      onUpdate: () => {
        fixed.style.filter = "none";
        if (title) title.style.filter = "none";
      }
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
      zIndex: 3,
      filter: "none"
    });

    gsap.to(fixed, {
      opacity: 1,
      clipPath: "ellipse(220% 200% at 50% 175%)",
      scrollTrigger: {
        trigger: article,
        start: "top bottom",
        end: "top top",
        scrub: 0.5,
        onUpdate: () => fixed.style.filter = "none"
      }
    });

    gsap.to(fixed, {
      opacity: 0,
      scrollTrigger: {
        trigger: article,
        start: "bottom 80%",
        end: "bottom 45%",
        scrub: 0.5,
        onUpdate: () => fixed.style.filter = "none"
      }
    });

    return;
  }

  gsap.set(fixed, {
    opacity: 0,
    zIndex: 3,
    filter: "none"
  });

  gsap.to(fixed, {
    opacity: 1,
    scrollTrigger: {
      trigger: article,
      start: "top 80%",
      end: "top top",
      scrub: 0.5,
      onUpdate: () => fixed.style.filter = "none"
    }
  });

  gsap.to(fixed, {
    opacity: 0,
    scrollTrigger: {
      trigger: article,
      start: "bottom 80%",
      end: "bottom 45%",
      scrub: 0.5,
      onUpdate: () => fixed.style.filter = "none"
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

function animateArticleTitle(gsap, article) {
  const title = article.querySelector("h2");

  if (!title) return;

  gsap.set(title, {
    filter: "none",
    textShadow: "none"
  });

  gsap.from(title, {
    yPercent: 80,
    opacity: 0,
    scrollTrigger: {
      trigger: article,
      start: "top 70%",
      end: "top 30%",
      scrub: 0.5,
      onUpdate: () => {
        title.style.filter = "none";
      }
    }
  });

  gsap.to(title, {
    opacity: 0,
    yPercent: -40,
    scrollTrigger: {
      trigger: article,
      start: "bottom 70%",
      end: "bottom 45%",
      scrub: 0.5,
      onUpdate: () => {
        title.style.filter = "none";
      }
    }
  });
}

function animateTextBlocks(gsap, article) {
  if (!article) return;

  const lines = article.querySelectorAll(".text-blocks p");
  const textBlocks = article.querySelector(".text-blocks");
  const fillerTitle = article.querySelector(".filler h2");

  if (lines.length) {
    gsap.set(article, {
      height: "400vh"
    });

    gsap.set(lines, {
      filter: "none",
      textShadow: "none"
    });

    lines.forEach((line, index) => {
      gsap.from(line, {
        yPercent: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: article,
          start: `top -=${90 + index * 10}%`,
          end: `top -=${100 + index * 10}%`,
          scrub: 0.5,
          onUpdate: () => {
            line.style.filter = "none";
          }
        }
      });
    });
  }

  if (textBlocks) {
    gsap.to(textBlocks, {
      opacity: 0,
      scrollTrigger: {
        trigger: article,
        start: "bottom 130%",
        end: "bottom 110%",
        scrub: 0.5,
        onUpdate: () => {
          textBlocks.style.filter = "none";
        }
      }
    });
  }

  if (fillerTitle) {
    gsap.set(fillerTitle, {
      filter: "none",
      textShadow: "none"
    });

    gsap.to(fillerTitle, {
      opacity: 0,
      yPercent: -40,
      scrollTrigger: {
        trigger: article,
        start: "bottom 55%",
        end: "bottom 30%",
        scrub: 0.5,
        onUpdate: () => {
          fillerTitle.style.filter = "none";
        }
      }
    });
  }
}

function animateFinalArticle(gsap, article) {
  if (!article) return;

  const fixed = article.querySelector(".fixed");

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 0,
    clipPath: "ellipse(220% 200% at 50% 300%)",
    zIndex: 5,
    filter: "none"
  });

  gsap.to(fixed, {
    opacity: 1,
    clipPath: "ellipse(220% 200% at 50% 175%)",
    scrollTrigger: {
      trigger: article,
      start: "top 80%",
      end: "top 20%",
      scrub: 0.5,
      onUpdate: () => {
        fixed.style.filter = "none";
      }
    }
  });
}
