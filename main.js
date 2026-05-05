document.addEventListener("DOMContentLoaded", () => {
  applyImageReady();
  startImageWheels();
  initExternalScrollAnimation();
  initLoopToTopOnBottom();
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
      console.warn("External scroll animation failed.");
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

function getExternalAnimationParts(root) {
  const firstSection =
    root.querySelector(".external-panel-start") ||
    root.querySelector(":scope > section:first-of-type");

  const secondSection = root.querySelector(":scope > section:nth-of-type(2)");

  const articles = secondSection
    ? Array.from(secondSection.querySelectorAll(":scope > article"))
    : Array.from(root.querySelectorAll("article"));

  return { firstSection, secondSection, articles };
}

function runExternalScrollAnimation(root) {
  if (!window.gsap || !window.ScrollTrigger) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  const { firstSection, articles } = getExternalAnimationParts(root);

  if (!firstSection || !articles.length) return;

  root.querySelectorAll(".filler").forEach((el) => el.classList.add("is-active"));

  gsap.set(root, {
    opacity: 1,
    backgroundColor: "#000"
  });

  gsap.set(root.querySelectorAll(".fixed"), {
    position: "fixed",
    inset: 0,
    opacity: 0,
    zIndex: 1
  });

  gsap.set(root.querySelectorAll(".fixed img"), {
    opacity: 1,
    visibility: "visible",
    zIndex: 2,
    transformOrigin: "50% 50%"
  });

  gsap.set(root.querySelectorAll(".static"), {
    position: "absolute",
    inset: 0,
    zIndex: 6
  });

  animateExternalStartPanel(gsap, firstSection);
  animateExternalArticles(gsap, articles);

  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.refresh(true);
}

function animateExternalStartPanel(gsap, section) {
  const fixed = section.querySelector(".fixed");
  const textItems = Array.from(section.querySelectorAll(".content h1, .content h2, .content h3, .content > p"));

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 1,
    zIndex: 5,
    transformOrigin: "50% 0%",
    scaleX: 1,
    scaleY: 1,
    yPercent: 0
  });

  gsap.set(textItems, {
    opacity: 1,
    yPercent: 0,
    filter: "blur(0rem)"
  });

  textItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0rem)"
      },
      {
        opacity: 0,
        yPercent: -95 - index * 10,
        filter: "blur(4rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom 25%",
          scrub: 0.5
        }
      }
    );
  });

  gsap.fromTo(
    fixed,
    { opacity: 1 },
    {
      opacity: 0,
      overwrite: "auto",
      immediateRender: false,
      scrollTrigger: {
        trigger: section,
        start: "bottom 78%",
        end: "bottom 20%",
        scrub: 0.5
      }
    }
  );
}

function animateExternalArticles(gsap, articles) {
  articles.forEach((article, index) => {
    animateArticleFixedLayer(gsap, article, index);
    animateArticleImage(gsap, article, index);
    animateArticleTitle(gsap, article, index);
  });

  animateArticleThreeTextBlocks(gsap, articles[2]);
  animateFinalArticle(gsap, articles[articles.length - 1]);
}

function animateArticleFixedLayer(gsap, article, index) {
  const fixed = article.querySelector(".fixed");

  if (!fixed) return;

  if (index === 0) {
    gsap.set(fixed, {
      opacity: 0,
      clipPath: "ellipse(220% 200% at 50% 300%)",
      zIndex: 4
    });

    gsap.fromTo(
      fixed,
      {
        opacity: 0,
        clipPath: "ellipse(220% 200% at 50% 300%)"
      },
      {
        opacity: 1,
        clipPath: "ellipse(220% 200% at 50% 175%)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "top 75%",
          end: "top top",
          scrub: 0.5
        }
      }
    );

    gsap.fromTo(
      fixed,
      { opacity: 1 },
      {
        opacity: 0,
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "bottom 80%",
          end: "bottom 45%",
          scrub: 0.5
        }
      }
    );

    return;
  }

  gsap.set(fixed, {
    opacity: 0,
    zIndex: 4
  });

  gsap.fromTo(
    fixed,
    { opacity: 0 },
    {
      opacity: 1,
      overwrite: "auto",
      immediateRender: false,
      scrollTrigger: {
        trigger: article,
        start: "top 80%",
        end: "top top",
        scrub: 0.5
      }
    }
  );

  gsap.fromTo(
    fixed,
    { opacity: 1 },
    {
      opacity: 0,
      overwrite: "auto",
      immediateRender: false,
      scrollTrigger: {
        trigger: article,
        start: "bottom 80%",
        end: "bottom 45%",
        scrub: 0.5
      }
    }
  );
}

function animateArticleImage(gsap, article, index) {
  const img = article.querySelector(".fixed img");

  if (!img) return;

  const startScale = index === 0 ? 1.95 : 1.25;

  gsap.set(img, {
    opacity: 1,
    visibility: "visible",
    zIndex: 2,
    scale: startScale,
    transformOrigin: "50% 50%"
  });

  gsap.fromTo(
    img,
    {
      scale: startScale,
      opacity: 1
    },
    {
      scale: 1,
      opacity: 1,
      overwrite: "auto",
      immediateRender: false,
      scrollTrigger: {
        trigger: article,
        start: "top bottom",
        end: "top top",
        scrub: 0.5
      }
    }
  );
}

function animateArticleTitle(gsap, article, index) {
  if (index === 2) return;

  animateTextGroup(gsap, article, {
    enterStart: "top 72%",
    enterEnd: "top 34%",
    exitStart: "bottom 76%",
    exitEnd: "bottom 42%"
  });
}

function animateTextGroup(gsap, scope, timing) {
  const textItems = Array.from(
    scope.querySelectorAll("h1, h2, h3, .content > p, .content p")
  ).filter((item) => !item.closest(".text-blocks") && !item.closest(".filler"));

  if (!textItems.length) return;

  textItems.forEach((textItem, index) => {
    gsap.set(textItem, {
      opacity: 1,
      yPercent: 0,
      filter: "blur(0rem)"
    });

    gsap.fromTo(
      textItem,
      {
        yPercent: 80,
        opacity: 0,
        filter: "blur(1.75rem)"
      },
      {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: scope,
          start: timing.enterStart,
          end: timing.enterEnd,
          scrub: 0.5
        }
      }
    );

    gsap.fromTo(
      textItem,
      {
        opacity: 1,
        filter: "blur(0rem)",
        yPercent: 0
      },
      {
        opacity: 0,
        filter: "blur(4rem)",
        yPercent: -34 - index * 6,
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: scope,
          start: timing.exitStart,
          end: timing.exitEnd,
          scrub: 0.5
        }
      }
    );
  });
}

function animateArticleThreeTextBlocks(gsap, article) {
  if (!article) return;

  const mainTitle = article.querySelector(".article-three-title");
  const lines = Array.from(article.querySelectorAll(".text-blocks p"));
  const textBlocks = article.querySelector(".text-blocks");
  const filler = article.querySelector(".filler");
  const fillerText = filler ? filler.querySelector(".animate-text, h1, h2, h3, p") : null;

  gsap.set(article, {
    height: "300vh"
  });

  if (mainTitle) {
    gsap.set(mainTitle, {
      opacity: 0,
      yPercent: -22,
      filter: "blur(1.5rem)"
    });

    gsap.fromTo(
      mainTitle,
      {
        opacity: 0,
        yPercent: -22,
        filter: "blur(1.5rem)"
      },
      {
        opacity: 1,
        yPercent: -8,
        filter: "blur(0rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "top 120%",
          end: "top 76%",
          scrub: 0.5
        }
      }
    );

    gsap.fromTo(
      mainTitle,
      {
        opacity: 1,
        yPercent: -8,
        filter: "blur(0rem)"
      },
      {
        opacity: 0,
        yPercent: -72,
        filter: "blur(4rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "top -=82%",
          end: "top -=124%",
          scrub: 0.5
        }
      }
    );
  }

  if (lines.length) {
    lines.forEach((line, index) => {
      gsap.set(line, {
        opacity: 0,
        yPercent: 72,
        filter: "blur(1.5rem)"
      });

      gsap.fromTo(
        line,
        {
          opacity: 0,
          yPercent: 72,
          filter: "blur(1.5rem)"
        },
        {
          opacity: 1,
          yPercent: 0,
          filter: "blur(0rem)",
          overwrite: "auto",
          immediateRender: false,
          scrollTrigger: {
            trigger: article,
            start: `top -=${38 + index * 8}%`,
            end: `top -=${52 + index * 8}%`,
            scrub: 0.5
          }
        }
      );

      gsap.fromTo(
        line,
        {
          opacity: 1,
          yPercent: 0,
          filter: "blur(0rem)"
        },
        {
          opacity: 0,
          yPercent: -76,
          filter: "blur(4rem)",
          overwrite: "auto",
          immediateRender: false,
          scrollTrigger: {
            trigger: article,
            start: `top -=${154 + index * 9}%`,
            end: `top -=${188 + index * 9}%`,
            scrub: 0.5
          }
        }
      );
    });
  }

  if (textBlocks) {
    gsap.set(textBlocks, {
      opacity: 1,
      yPercent: 0,
      filter: "blur(0rem)"
    });

    gsap.fromTo(
      textBlocks,
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0rem)"
      },
      {
        opacity: 0,
        yPercent: -28,
        filter: "blur(4rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "top -=205%",
          end: "top -=245%",
          scrub: 0.5
        }
      }
    );
  }

  if (filler) {
    gsap.set(filler, {
      opacity: 0,
      yPercent: 22,
      filter: "blur(1.25rem)"
    });

    if (fillerText) {
      gsap.set(fillerText, {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0rem)"
      });
    }

    gsap.fromTo(
      filler,
      {
        opacity: 0,
        yPercent: 22,
        filter: "blur(1.25rem)"
      },
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "top -=218%",
          end: "top -=248%",
          scrub: 0.5
        }
      }
    );

    gsap.fromTo(
      filler,
      {
        opacity: 1,
        yPercent: 0,
        filter: "blur(0rem)"
      },
      {
        opacity: 0,
        yPercent: -48,
        filter: "blur(4rem)",
        overwrite: "auto",
        immediateRender: false,
        scrollTrigger: {
          trigger: article,
          start: "top -=278%",
          end: "top -=318%",
          scrub: 0.5
        }
      }
    );
  }
}

function animateFinalArticle(gsap, article) {
  if (!article) return;

  const fixed = article.querySelector(".fixed");

  if (!fixed) return;

  gsap.set(fixed, {
    opacity: 0,
    clipPath: "ellipse(220% 200% at 50% 300%)",
    zIndex: 6
  });

  gsap.fromTo(
    fixed,
    {
      opacity: 0,
      clipPath: "ellipse(220% 200% at 50% 300%)"
    },
    {
      opacity: 1,
      clipPath: "ellipse(220% 200% at 50% 175%)",
      overwrite: "auto",
      immediateRender: false,
      scrollTrigger: {
        trigger: article,
        start: "top 80%",
        end: "top 20%",
        scrub: 0.5
      }
    }
  );
}

/* LOOP TO TOP WHEN BOTTOM IS REACHED */
function initLoopToTopOnBottom() {
  const root = document.querySelector(".external-scroll-animation");
  if (!root) return;

  let isLooping = false;

  window.addEventListener(
    "scroll",
    () => {
      if (isLooping) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );

      const bottomReached = scrollTop + viewportHeight >= pageHeight - 10;

      if (!bottomReached) return;

      isLooping = true;
      root.classList.add("is-looping-out");

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto"
        });

        if (window.ScrollTrigger) {
          window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        }

        resetExternalAnimationState(root);

        setTimeout(() => {
          runExternalScrollAnimation(root);

          if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh(true);
            window.ScrollTrigger.update();
          }

          root.classList.remove("is-looping-out");
          root.classList.add("is-looping-in");

          setTimeout(() => {
            root.classList.remove("is-looping-in");
            isLooping = false;
          }, 520);
        }, 100);
      }, 420);
    },
    { passive: true }
  );
}

function resetExternalAnimationState(root) {
  if (!window.gsap) return;

  const gsap = window.gsap;

  gsap.set(root, {
    opacity: 1,
    backgroundColor: "#000"
  });

  gsap.set(root.querySelectorAll(".fixed"), {
    opacity: 0,
    zIndex: 1
  });

  gsap.set(root.querySelectorAll(".fixed img"), {
    opacity: 1,
    visibility: "visible",
    scale: 1,
    zIndex: 2
  });

  gsap.set(
    root.querySelectorAll(
      "h1, h2, h3, p, .text-blocks, .text-blocks p, .filler, .filler h2, .filler h3, .filler p"
    ),
    {
      opacity: 1,
      yPercent: 0,
      filter: "blur(0rem)"
    }
  );

  const firstFixed =
    root.querySelector(".external-panel-start .fixed") ||
    root.querySelector(":scope > section:first-of-type .fixed");

  if (firstFixed) {
    gsap.set(firstFixed, {
      opacity: 1,
      zIndex: 5,
      scaleX: 1,
      scaleY: 1,
      yPercent: 0
    });
  }
}
