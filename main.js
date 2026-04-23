document.addEventListener("DOMContentLoaded", () => {
  const markImageLoaded = (img) => {
    if (
      img.closest(".wallPaper") ||
      img.closest(".navLogo") ||
      img.closest(".beNook")
    ) {
      return;
    }

    img.classList.add("fade-img");

    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener(
        "load",
        () => img.classList.add("loaded"),
        { once: true }
      );
      img.addEventListener(
        "error",
        () => img.classList.add("loaded"),
        { once: true }
      );
    }
  };

  const applyFadeHandling = (scope = document) => {
    scope.querySelectorAll("img").forEach(markImageLoaded);
  };

  applyFadeHandling();

  if (typeof window.lazyload === "function") {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (lazyImages.length) {
      window.lazyload(lazyImages);
    }
  }

  const wheelRows = document.querySelectorAll(".wheel-row");
  const wheelState = [];
  let animationId = null;
  let resizeTimer = null;
  let lastTime = performance.now();

  const buildWheelTrack = (row) => {
    const track = row.querySelector(".wheel-track");
    if (!track) return null;

    const originalItems = Array.from(track.children).map((node) =>
      node.cloneNode(true)
    );

    track.innerHTML = "";

    let safety = 0;
    while (track.scrollWidth < row.offsetWidth * 2 && safety < 30) {
      originalItems.forEach((item) => track.appendChild(item.cloneNode(true)));
      safety += 1;
    }

    const sequenceWidth = track.scrollWidth;
    track.insertAdjacentHTML("beforeend", track.innerHTML);

    applyFadeHandling(track);

    return {
      row,
      track,
      cycleWidth: sequenceWidth,
    };
  };

  const initializeWheels = () => {
    wheelState.length = 0;

    wheelRows.forEach((row) => {
      const built = buildWheelTrack(row);
      if (!built) return;

      const speed = parseFloat(
        built.track.getAttribute("data-speed") || "0.04"
      );

      const direction =
        (built.track.getAttribute("data-direction") || "left").toLowerCase() ===
        "right"
          ? 1
          : -1;

      wheelState.push({
        row: built.row,
        track: built.track,
        cycleWidth: built.cycleWidth,
        speed,
        direction,
        offset: 0,
      });
    });
  };

  const animateWheels = (now) => {
    const delta = Math.min(now - lastTime, 32);
    lastTime = now;

    wheelState.forEach((item) => {
      const paused = item.row.matches(":hover");
      const effectiveSpeed = paused ? 0 : item.speed;

      item.offset += item.direction * effectiveSpeed * delta;

      if (item.direction < 0 && Math.abs(item.offset) >= item.cycleWidth) {
        item.offset += item.cycleWidth;
      }

      if (item.direction > 0 && item.offset >= item.cycleWidth) {
        item.offset -= item.cycleWidth;
      }

      item.track.style.transform = `translate3d(${item.offset}px, 0, 0)`;
    });

    animationId = window.requestAnimationFrame(animateWheels);
  };

  const startWheels = () => {
    if (!wheelRows.length) return;

    initializeWheels();

    if (animationId) {
      window.cancelAnimationFrame(animationId);
    }

    lastTime = performance.now();
    animationId = window.requestAnimationFrame(animateWheels);
  };

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(startWheels, 180);
  });

  startWheels();
});
