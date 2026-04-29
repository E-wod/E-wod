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

/* EXTERNAL SCROLL ANIMATION */
function initExternalScrollAnimation() {
  const root = document.querySelector(".external-scroll-animation");

  if (!root) return;
  if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/gsap.min.js")
    .then(() => loadExternalScript("https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/ScrollTrigger.min.js"))
    .then(() => runExternalScrollAnimation(root))
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

function runExternalScrollAnimation(root) {
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

  killBadBlur(root);
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

  animateExternalStartPanel(gsap, firstSection);
  animateExternalArticles(gsap, articles);

  ScrollTrigger.refresh();
}

function killBadBlur(root) {
  root.querySelectorAll("*").forEach((el) => {
    el.style.filter = "none";
  });
}

function animateExternalStartPanel(gsap, section) {
  const fixed = section.querySelector(".fixed");
  const content = section.querySelector(".content");
  const title = section.querySelector("h1, h2");
  const textBox = section.querySelector(".content > p");
  const img = section.querySelector(".fixed img");

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 1,
    zIndex: 5,
    transformOrigin: "50% 50%",
    filter: "none"
  });

  if (img) {
    gsap.set(img, {
      width: "100%",
      left: 0,
      xPercent: 0,
      scale: 1,
      filter: "brightness(0.5) saturate(0.9)"
    });

    gsap.to(img, {
      scale: 1.08,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom 50%",
        scrub: 0.5
      }
    });
  }

  if (content) {
    gsap.set(content, {
      xPercent: 0,
      yPercent: 0,
      scale: 1,
      opacity: 1,
      filter: "none"
    });
  }

  if (title) {
    gsap.set(title, {
      scale: 0.82,
      opacity: 1,
      filter: "none"
    });
  }

  if (textBox) {
    gsap.set(textBox, {
      xPercent: 0,
      yPercent: 0,
      opacity: 1,
      filter: "none"
    });
  }

  gsap.to(fixed, {
    scaleX: 0.42,
    scaleY: 0.58,
    yPercent: -8,
    opacity: 0,
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom 55%",
      scrub: 0.5,
      onUpdate: () => {
        fixed.style.filter = "none";
        if (content) content.style.filter = "none";
        if (title) title.style.filter = "none";
        if (textBox) textBox.style.filter = "none";
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

  gsap.fromTo(
    img,
    {
      scale: index === 0 ? 2.5 : 1.18
    },
    {
      scale: 1,
      scrollTrigger: {
        trigger: article,
        start: "top bottom",
        end: "top top",
        scrub: 0.5
      }
    }
  );
}

function animateArticleTitle(gsap, article) {
  const title = article.querySelector("h2");

  if (!title) return;

  gsap.set(title, {
    filter: "none",
    scale: 0.9
  });

  gsap.fromTo(
    title,
    {
      yPercent: 55,
      opacity: 0,
      scale: 0.82
    },
    {
      yPercent: 0,
      opacity: 1,
      scale: 0.9,
      scrollTrigger: {
        trigger: article,
        start: "top 72%",
        end: "top 34%",
        scrub: 0.5,
        onUpdate: () => title.style.filter = "none"
      }
    }
  );

  gsap.to(title, {
    opacity: 0,
    yPercent: -40,
    scale: 0.82,
    scrollTrigger: {
      trigger: article,
      start: "bottom 72%",
      end: "bottom 48%",
      scrub: 0.5,
      onUpdate: () => title.style.filter = "none"
    }
  });
}

function animateTextBlocks(gsap, article) {
  if (!article) return;

  const lines = Array.from(article.querySelectorAll(".text-blocks p"));
  const textBlocks = article.querySelector(".text-blocks");
  const filler = article.querySelector(".filler");
  const fillerTitle = article.querySelector(".filler h2");

  if (lines.length) {
    gsap.set(article, {
      height: "280vh"
    });

    gsap.set(lines, {
      opacity: 0,
      yPercent: 70,
      scale: 0.96,
      filter: "none"
    });

    lines.forEach((line, index) => {
      const start = 10 + index * 9;
      const hold = start + 7;
      const exit = hold + 8;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: article,
          start: `top -=${start}%`,
          end: `top -=${exit}%`,
          scrub: 0.45,
          onUpdate: () => {
            line.style.filter = "none";
          }
        }
      });

      tl.to(line, {
        opacity: 1,
        yPercent: 0,
        scale: 1,
        duration: 0.35,
        ease: "power2.out"
      });

      tl.to(line, {
        opacity: 1,
        yPercent: -8,
        scale: 1,
        duration: 0.28,
        ease: "none"
      });

      tl.to(line, {
        opacity: 0,
        yPercent: -55,
        scale: 0.94,
        duration: 0.37,
        ease: "power2.in"
      });
    });
  }

  if (textBlocks) {
    gsap.to(textBlocks, {
      opacity: 0,
      yPercent: -18,
      scrollTrigger: {
        trigger: article,
        start: "bottom 138%",
        end: "bottom 115%",
        scrub: 0.5,
        onUpdate: () => textBlocks.style.filter = "none"
      }
    });
  }

  if (filler) {
    gsap.set(filler, {
      opacity: 0,
      yPercent: 18,
      filter: "none"
    });

    gsap.to(filler, {
      opacity: 1,
      yPercent: 0,
      scrollTrigger: {
        trigger: article,
        start: "bottom 165%",
        end: "bottom 135%",
        scrub: 0.5,
        onUpdate: () => filler.style.filter = "none"
      }
    });

    gsap.to(filler, {
      opacity: 0,
      yPercent: -35,
      scrollTrigger: {
        trigger: article,
        start: "bottom 95%",
        end: "bottom 70%",
        scrub: 0.5,
        onUpdate: () => filler.style.filter = "none"
      }
    });
  }

  if (fillerTitle) {
    gsap.set(fillerTitle, {
      filter: "none",
      scale: 0.9
    });

    gsap.to(fillerTitle, {
      scale: 1,
      scrollTrigger: {
        trigger: article,
        start: "bottom 165%",
        end: "bottom 135%",
        scrub: 0.5,
        onUpdate: () => fillerTitle.style.filter = "none"
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
      onUpdate: () => fixed.style.filter = "none"
    }
  });
}
