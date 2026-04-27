import gsap from "https://esm.sh/gsap@3.12.2";
import { ScrollTrigger } from "https://esm.sh/gsap@3.12.2/ScrollTrigger";

document.addEventListener("DOMContentLoaded", () => {
  const applyImageReady = (scope = document) => {
    scope.querySelectorAll("img").forEach((img) => {
      if (
        img.closest(".wallPaper") ||
        img.closest(".navLogo") ||
        img.closest(".beNook") ||
        img.closest(".wheel-card") ||
        img.closest(".services-scroll")
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
  };

  applyImageReady();

  /* HOMEPAGE CAROUSEL */
  const wheelRows = Array.from(document.querySelectorAll(".wheel-row"));
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
        offset: startOffset,
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

  const startWheels = () => {
    if (!wheelRows.length) return;

    initializeWheels();

    if (animationId) cancelAnimationFrame(animationId);

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
        startWheels();
      }, 450);
    },
    { passive: true }
  );

  startWheels();

  /* SERVICES SCROLL ANIMATION FALLBACK */
  const servicesScroll = document.querySelector(".services-scroll");

  if (
    servicesScroll &&
    !CSS.supports("animation-timeline: view()") &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  ) {
    gsap.registerPlugin(ScrollTrigger);

    const heroPanel = servicesScroll.querySelector(".service-hero-panel");
    const panels = servicesScroll.querySelector(".service-animation-panels");
    const articles = panels ? Array.from(panels.querySelectorAll("article")) : [];

    if (!heroPanel || articles.length < 4) return;

    gsap.set(servicesScroll.querySelectorAll(".service-fixed"), {
      position: "fixed",
      inset: 0,
    });

    gsap.set(servicesScroll.querySelectorAll(".service-static"), {
      position: "absolute",
      inset: 0,
      zIndex: 6,
    });

    gsap.set(heroPanel.querySelector(".service-fixed"), {
      transformOrigin: "50% 0%",
    });

    gsap.to(heroPanel.querySelector(".service-fixed"), {
      scaleX: 0.35,
      scaleY: 0.5,
      yPercent: -10,
      scrollTrigger: {
        scrub: 0.5,
        trigger: heroPanel,
        start: "top top",
        end: "bottom 50%",
      },
    });

    gsap.to(heroPanel.querySelector(".service-fixed"), {
      opacity: 0,
      scrollTrigger: {
        scrub: 0.5,
        trigger: heroPanel,
        start: "top top",
        end: "bottom 75%",
      },
    });

    const articleOne = articles[0];
    const articleTwo = articles[1];
    const articleThree = articles[2];
    const articleFour = articles[3];

    gsap.set(articleOne.querySelector(".service-fixed"), {
      clipPath: "ellipse(220% 200% at 50% 300%)",
      zIndex: 3,
    });

    gsap.to(articleOne.querySelector(".service-fixed"), {
      clipPath: "ellipse(220% 200% at 50% 175%)",
      scrollTrigger: {
        scrub: 0.5,
        trigger: articleOne,
        start: "top bottom",
        end: "top top",
      },
    });

    gsap.from(articleOne.querySelector("img"), {
      scale: 5,
      scrollTrigger: {
        scrub: 0.5,
        trigger: articleOne,
        start: "top bottom",
        end: "top top",
      },
    });

    const loudWrap = articleOne.querySelector(".service-loud-wrap");
    const textWrap = articleOne.querySelector(".service-text-wrap");

    if (loudWrap) {
      gsap.set(loudWrap, {
        clipPath: "inset(0 0 0 0)",
        mask: "linear-gradient(white 50%, transparent) 0 100% / 100% 200% no-repeat",
      });

      gsap.to(loudWrap, {
        maskPosition: "0 0",
        scrollTrigger: {
          scrub: 0.5,
          trigger: articleOne,
          start: "top 50%",
          end: "top 0%",
        },
      });
    }

    if (textWrap) {
      gsap.set(textWrap, {
        position: "sticky",
        bottom: "4rem",
        transformOrigin: "50% 0",
      });

      gsap.to(textWrap, {
        filter: "blur(4rem)",
        opacity: 0,
        scrollTrigger: {
          scrub: 0.5,
          trigger: articleOne,
          start: "bottom 60%",
          end: "bottom 25%",
        },
      });
    }

    gsap.from(articleOne.querySelector("h2"), {
      yPercent: 100,
      scrollTrigger: {
        scrub: 0.5,
        trigger: articleOne,
        start: "top 50%",
        end: "top 0%",
      },
    });

    gsap.set(articleTwo.querySelector(".service-fixed"), {
      zIndex: 3,
    });

    gsap.from(articleTwo.querySelector(".service-fixed"), {
      opacity: 0,
      scrollTrigger: {
        scrub: 0.5,
        trigger: articleTwo,
        start: "top 50%",
        end: "top -30%",
      },
    });

    gsap.from(articleTwo.querySelector("h2"), {
      yPercent: 100,
      opacity: 0,
      scrollTrigger: {
        scrub: 0.5,
        trigger: articleTwo,
        start: "top 50%",
        end: "top 25%",
      },
    });

    gsap.to(articleTwo.querySelector("h2"), {
      filter: "blur(4rem)",
      color: "transparent",
      scrollTrigger: {
        scrub: 0.5,
        trigger: articleTwo,
        start: "bottom bottom",
        end: "bottom 50%",
      },
    });

    const filler = articleThree.querySelector(".service-filler");
    if (filler) {
      gsap.set(filler, {
        display: "block",
        position: "absolute",
        bottom: "30vh",
        padding: "1rem",
      });
    }

    gsap.set(articleThree, {
      height: "400vh",
    });

    gsap.set(articleThree.querySelector(".service-fixed"), {
      zIndex: 3,
    });

    gsap.set(articleThree.querySelector("h2"), {
      marginTop: "80vh",
    });

    gsap.from(articleThree.querySelector(".service-fixed"), {
      opacity: 0,
      scrollTrigger: {
        trigger: articleThree,
        scrub: 0.5,
        start: "top 80%",
        end: "top top",
      },
    });

    const articleThreeImage = articleThree.querySelector("img");
    if (articleThreeImage) {
      gsap.to(articleThreeImage, {
        opacity: 0,
        scrollTrigger: {
          trigger: articleThree,
          scrub: 0.5,
          start: "bottom bottom",
          end: "bottom 85%",
        },
      });
    }

    const serviceLines = articleThree.querySelectorAll(".service-text-blocks p");

    serviceLines.forEach((line, index) => {
      gsap.from(line, {
        yPercent: 100,
        opacity: 0,
        scrollTrigger: {
          trigger: articleThree,
          scrub: 0.5,
          start: `top -=${90 + index * 10}%`,
          end: `top -=${100 + index * 10}%`,
        },
      });
    });

    const textBlocks = articleThree.querySelector(".service-text-blocks");

    if (textBlocks) {
      gsap.to(textBlocks, {
        opacity: 0,
        scrollTrigger: {
          trigger: articleThree,
          scrub: 0.5,
          start: "bottom 130%",
          end: "bottom 110%",
        },
      });
    }

    const fillerTitle = articleThree.querySelector(".service-filler h2");

    if (fillerTitle) {
      gsap.to(fillerTitle, {
        opacity: 0,
        filter: "blur(4rem)",
        scrollTrigger: {
          trigger: articleThree,
          scrub: 0.5,
          start: "bottom 55%",
          end: "bottom 30%",
        },
      });
    }

    gsap.set(articleFour.querySelector(".service-fixed"), {
      clipPath: "ellipse(220% 200% at 50% 300%)",
      zIndex: 5,
    });

    gsap.to(articleFour.querySelector(".service-fixed"), {
      clipPath: "ellipse(220% 200% at 50% 175%)",
      scrollTrigger: {
        trigger: articleFour,
        scrub: 0.5,
        start: "top 80%",
        end: "top 20%",
      },
    });
  }
});
