document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     IMAGE FADE-IN
     ========================= */
  const allImages = document.querySelectorAll("img");

  allImages.forEach((img) => {
    if (img.closest(".wallPaper")) return;
    if (img.closest(".navLogo")) return;
    if (img.closest(".beNook")) return;

    img.classList.add("fade-img");

    const markLoaded = () => {
      img.classList.add("loaded");
    };

    if (img.complete) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });

  /* =========================
     OPTIONAL LAZYLOAD SUPPORT
     ========================= */
  if (typeof window.lazyload === "function") {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (lazyImages.length) {
      window.lazyload(lazyImages);
    }
  }

  /* =========================
     AUTOMATIC CASCADING WHEELS
     ========================= */
  const wheelRows = document.querySelectorAll(".wheel-row");

  const wheelState = [];

  const buildWheelTrack = (row) => {
    const track = row.querySelector(".wheel-track");
    if (!track) return null;

    const originalItems = Array.from(track.children).map((node) =>
      node.cloneNode(true)
    );

    track.innerHTML = "";
    originalItems.forEach((item) => track.appendChild(item));

    const targetWidth = row.offsetWidth * 2.5;
    let safety = 0;

    while (track.scrollWidth < targetWidth && safety < 20) {
      originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));
      safety += 1;
    }

    const fullWidth = track.scrollWidth / 2 || track.scrollWidth;
    return { track, fullWidth };
  };

  const initializeWheels = () => {
    wheelState.length = 0;

    wheelRows.forEach((row) => {
      const built = buildWheelTrack(row);
      if (!built) return;

      const speed = parseFloat(
        built.track.getAttribute("data-speed") || "0.3"
      );
      const direction =
        (built.track.getAttribute("data-direction") || "left").toLowerCase() ===
        "right"
          ? 1
          : -1;

      wheelState.push({
        row,
        track: built.track,
        fullWidth: built.fullWidth,
        speed,
        direction,
        offset: 0,
      });
    });
  };

  let lastTime = performance.now();
  let animationId = null;

  const animateWheels = (now) => {
    const delta = Math.min(now - lastTime, 32);
    lastTime = now;

    wheelState.forEach((item) => {
      item.offset += item.direction * item.speed * delta;

      if (item.direction < 0 && Math.abs(item.offset) >= item.fullWidth) {
        item.offset += item.fullWidth;
      }

      if (item.direction > 0 && item.offset >= item.fullWidth) {
        item.offset -= item.fullWidth;
      }

      item.track.style.transform = `translate3d(${item.offset}px, 0, 0)`;
    });

    animationId = window.requestAnimationFrame(animateWheels);
  };

  const startWheels = () => {
    if (!document.querySelector(".wheel-row")) return;
    initializeWheels();
    if (animationId) window.cancelAnimationFrame(animationId);
    lastTime = performance.now();
    animationId = window.requestAnimationFrame(animateWheels);
  };

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(startWheels, 180);
  });

  startWheels();
});
