document.addEventListener("DOMContentLoaded", () => {
  const decodedImages = document.querySelectorAll('img[decoding="async"]');

  decodedImages.forEach((img) => {
    const markLoaded = () => img.classList.add("loaded");

    if (img.complete) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
    }
  });

  if (typeof window.lazyload === "function") {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (lazyImages.length) {
      window.lazyload(lazyImages);
    }
  }

  const photoGrid = document.querySelector(".photo-grid");

  if (!photoGrid) {
    return;
  }

  let ticking = false;

  const updatePhotoGridScale = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    const scale = 1 + progress * 0.12;

    photoGrid.style.transform = `translate(-50%, -50%) rotate(38deg) scale(${scale})`;
    ticking = false;
  };

  const requestPhotoGridUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updatePhotoGridScale);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestPhotoGridUpdate, { passive: true });
  window.addEventListener("resize", requestPhotoGridUpdate);

  updatePhotoGridScale();
});
