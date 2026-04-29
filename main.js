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
