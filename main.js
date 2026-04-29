document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const lerp = (start, end, amount) => start + (end - start) * amount;

  const getProgress = (element) => {
    const rect = element.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    const total = rect.height + viewH;

    if (total <= 0) return 0;

    return clamp((viewH - rect.top) / total, 0, 1);
  };

  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const loadImages = () => {
    const images = document.querySelectorAll("img");

    images.forEach((img) => {
      img.decoding = "async";

      if (!img.hasAttribute("loading")) {
        img.loading = "lazy";
      }

      if (img.complete) {
        img.classList.add("loaded");
        return;
      }

      img.addEventListener(
        "load",
        () => {
          img.classList.add("loaded");
        },
        { once: true }
      );

      img.addEventListener(
        "error",
        () => {
          img.classList.add("loaded");
        },
        { once: true }
      );
    });
  };

  const setupNavIndexes = () => {
    const navLinks = document.querySelectorAll(".navBar a, .socLnk a");

    navLinks.forEach((link, index) => {
      if (!link.style.getPropertyValue("--i")) {
        link.style.setProperty("--i", index + 1);
      }
    });
  };

  const setupImageWheel = () => {
    const rows = document.querySelectorAll(".wheel-row");

    rows.forEach((row, rowIndex) => {
      const track = row.querySelector(".wheel-track");
      if (!track || track.dataset.ready === "true") return;

      const cards = Array.from(track.children);
      if (!cards.length) return;

      const desiredCopies = 4;

      for (let copy = 0; copy < desiredCopies; copy++) {
        cards.forEach((card) => {
          const clone = card.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
      }

      track.dataset.ready = "true";

      let x = 0;
      let last = performance.now();
      let paused = false;

      const direction = rowIndex % 2 === 0 ? -1 : 1;
      const speed = rowIndex === 1 ? 0.42 : 0.36;

      row.addEventListener("mouseenter", () => {
        paused = true;
      });

      row.addEventListener("mouseleave", () => {
        paused = false;
      });

      const animate = (now) => {
        const delta = Math.min(now - last, 32);
        last = now;

        if (!paused && !prefersReducedMotion) {
          x += direction * speed * delta;

          const halfWidth = track.scrollWidth / 2;

          if (Math.abs(x) >= halfWidth) {
            x = 0;
          }

          track.style.transform = `translate3d(${x}px, 0, 0)`;
        }

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    });
  };

  const setupExternalScrollAnimation = () => {
    const root = document.querySelector(".external-scroll-animation");
    if (!root) return;

    const articles = Array.from(root.querySelectorAll("article"));
    const firstSection = root.querySelector("section:first-of-type");
    const secondSection = root.querySelector("section:nth-of-type(2)");
    const chatContainer = root.querySelector(".chat-container");
    const textBlocks = Array.from(root.querySelectorAll(".text-blocks p"));
    const filler = root.querySelector(".filler");
    const fillerTitle = filler ? filler.querySelector("h2") : null;

    const allBlurTargets = root.querySelectorAll(
      ".external-scroll-animation, section, article, .fixed, .static, .content, .text-wrap, .loud-wrap, .chat-container, .text-blocks, .filler, h1, h2, p"
    );

    const clearAllFilters = () => {
      allBlurTargets.forEach((el) => {
        el.style.filter = "none";
      });
    };

    const resetReadableTitles = () => {
      root.querySelectorAll("h1, h2, .content, .filler, .text-wrap, .loud-wrap, .chat-container, .text-blocks").forEach((el) => {
        el.style.filter = "none";
      });
    };

    const animateHero = () => {
      if (!firstSection) return;

      const progress = getProgress(firstSection);
      const content = firstSection.querySelector(".content");
      const heading = firstSection.querySelector("h1, h2");
      const paragraph = firstSection.querySelector("p");
      const img = firstSection.querySelector(".fixed img");

      if (content) {
        const y = lerp(18, -24, progress);
        content.style.transform = `translate3d(0, ${y}px, 0)`;
        content.style.opacity = `${clamp(1 - smoothstep(0.72, 0.96, progress), 0, 1)}`;
        content.style.filter = "none";
      }

      if (heading) {
        heading.style.filter = "none";
      }

      if (paragraph) {
        paragraph.style.filter = "none";
      }

      if (img) {
        const scale = lerp(1.04, 1.12, progress);
        img.style.transform = `scale(${scale})`;
      }
    };

    const animateArticles = () => {
      articles.forEach((article, index) => {
        const progress = getProgress(article);
        const fixed = article.querySelector(".fixed");
        const content = article.querySelector(".content");
        const heading = article.querySelector("h1, h2");
        const paragraph = article.querySelector(".content > p");
        const img = article.querySelector(".fixed img");

        if (fixed) {
          fixed.style.filter = "none";
        }

        if (content) {
          let enter = smoothstep(0.02, 0.18, progress);
          let exit = 1 - smoothstep(0.72, 0.94, progress);

          if (index === 2) {
            enter = smoothstep(0.02, 0.11, progress);
            exit = 1 - smoothstep(0.66, 0.86, progress);
          }

          const opacity = clamp(enter * exit, 0, 1);
          const y = lerp(36, -28, progress);

          content.style.opacity = `${opacity}`;
          content.style.transform = `translate3d(0, ${y}px, 0)`;
          content.style.filter = "none";
        }

        if (heading) {
          heading.style.filter = "none";
        }

        if (paragraph) {
          paragraph.style.filter = "none";
        }

        if (img) {
          const scale = lerp(1.03, 1.11, progress);
          img.style.transform = `scale(${scale})`;
        }
      });
    };

    const animateChatText = () => {
      if (!chatContainer || !textBlocks.length) return;

      const rect = chatContainer.getBoundingClientRect();
      const viewH = window.innerHeight || document.documentElement.clientHeight;
      const centerY = viewH * 0.5;

      textBlocks.forEach((text, index) => {
        const box = text.getBoundingClientRect();
        const textCenter = box.top + box.height * 0.5;
        const distance = Math.abs(textCenter - centerY);
        const normalized = clamp(distance / (viewH * 0.38), 0, 1);

        const visibility = 1 - smoothstep(0.48, 1, normalized);
        const yNudge = lerp(0, -18, normalized);
        const scale = lerp(1, 0.94, normalized);

        text.style.opacity = `${clamp(visibility, 0, 1)}`;
        text.style.transform = `translate3d(0, ${yNudge}px, 0) scale(${scale})`;

        /*
          IMPORTANT:
          No filter blur here.
          The previous problem was that blur was being applied to the whole <p>,
          which blurs the glass container too.
        */
        text.style.filter = "none";

        if (index < textBlocks.length - 1 && visibility < 0.12) {
          text.style.pointerEvents = "none";
        } else {
          text.style.pointerEvents = "auto";
        }
      });

      if (rect.bottom < viewH * 0.72) {
        chatContainer.style.opacity = "0";
      } else {
        chatContainer.style.opacity = "1";
      }

      chatContainer.style.filter = "none";
    };

    const animatePrettyCool = () => {
      if (!filler) return;

      const target = articles[2] || secondSection || root;
      const progress = getProgress(target);

      /*
        Pretty Cool timing:
        - starts sooner
        - holds in the middle
        - exits before the final title arc / FIN area
      */
      const enter = smoothstep(0.2, 0.34, progress);
      const exit = 1 - smoothstep(0.56, 0.72, progress);
      const visible = clamp(enter * exit, 0, 1);

      if (visible > 0.02) {
        filler.classList.add("is-active");
      } else {
        filler.classList.remove("is-active");
      }

      filler.style.opacity = `${visible}`;
      filler.style.transform = `translate3d(0, ${lerp(28, -34, progress)}px, 0) scale(${lerp(0.98, 1.04, visible)})`;
      filler.style.filter = "none";

      if (fillerTitle) {
        fillerTitle.style.opacity = `${visible}`;
        fillerTitle.style.transform = `translate3d(0, ${lerp(18, -18, progress)}px, 0)`;
        fillerTitle.style.filter = "none";
      }
    };

    const animateHowToGotIt = () => {
      const article = articles[2];
      if (!article) return;

      const progress = getProgress(article);
      const headings = Array.from(article.querySelectorAll("h1, h2"));
      const content = article.querySelector(".content");

      if (content) {
        content.style.filter = "none";
      }

      headings.forEach((heading, index) => {
        heading.style.filter = "none";

        const start = index === 0 ? 0.05 : 0.36;
        const end = index === 0 ? 0.42 : 0.74;

        const enter = smoothstep(start, start + 0.08, progress);
        const exit = 1 - smoothstep(end, end + 0.08, progress);
        const opacity = clamp(enter * exit, 0, 1);

        heading.style.opacity = `${opacity}`;
        heading.style.transform = `translate3d(0, ${lerp(30, -24, progress)}px, 0)`;
      });
    };

    let ticking = false;

    const update = () => {
      ticking = false;

      if (prefersReducedMotion) {
        clearAllFilters();
        return;
      }

      clearAllFilters();
      animateHero();
      animateArticles();
      animateChatText();
      animatePrettyCool();
      animateHowToGotIt();
      resetReadableTitles();
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("orientationchange", requestUpdate, { passive: true });

    update();
  };

  loadImages();
  setupNavIndexes();
  setupImageWheel();
  setupExternalScrollAnimation();
});
