document.addEventListener("DOMContentLoaded", () => {
  const applyImageReady = (scope = document) => {
    scope.querySelectorAll("img").forEach((img) => {
      if (
        img.closest(".wallPaper") ||
        img.closest(".navLogo") ||
        img.closest(".beNook") ||
        img.closest(".wheel-card")
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

  const wheelRows = document.querySelectorAll(".wheel-row");
  const wheelState = [];

  let animationId = null;
  let resizeTimer = null;
  let lastTime = performance.now();

  const buildWheelTrack = (row) => {
    const track = row.querySelector(".wheel-track");
    if (!track) return null;

    const originals = Array.from(track.children).map((card) => card.cloneNode(true));

    track.innerHTML = "";

    let safety = 0;

    while (track.scrollWidth < row.offsetWidth * 3 && safety < 60) {
      originals.forEach((card) => {
        track.appendChild(card.cloneNode(true));
      });
      safety++;
    }

    const cycleWidth = track.scrollWidth;

    track.insertAdjacentHTML("beforeend", track.innerHTML);

    applyImageReady(track);

    return {
      row,
      track,
      cycleWidth,
    };
  };

  const initializeWheels = () => {
    wheelState.length = 0;

    wheelRows.forEach((row) => {
      const built = buildWheelTrack(row);
      if (!built) return;

      const speed = parseFloat(built.track.dataset.speed || "0.025");
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

    wheelState.forEach((item) => {
      const paused = item.row.matches(":hover");
      const movement = item.direction * (paused ? 0 : item.speed) * delta;

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

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(startWheels, 180);
  });

  startWheels();
});
