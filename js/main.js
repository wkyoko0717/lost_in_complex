/**
 * LOST IN COMPLEX — Portfolio JS
 * main.js  (fixed: removed pseudo-element targets, added null guards)
 *
 * 依存: GSAP 3.x + ScrollTrigger (HTML内で読み込み済み)
 */

/* ================================================================
   0. GSAP INIT
================================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   1. UTILITY
================================================================ */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/* ================================================================
   2. INITIAL STATE — opacity:0 の要素を GSAP で管理
   CSS側でも opacity:0 を設定しているが、
   GSAPが確実に把握できるよう gsap.set で明示する
================================================================ */
gsap.set('.js-fade-up', { opacity: 0, y: 24 });
gsap.set('.js-reveal', { opacity: 0, x: -16 });
// even children → 逆方向
qsa('.js-reveal:nth-child(even)').forEach(el => gsap.set(el, { x: 16 }));

/* ================================================================
   3. CUSTOM CURSOR
================================================================ */
(function initCursor() {
  const dot = qs('#cursor');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
  });

  (function loop() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    gsap.set(ring, { x: rx, y: ry });
    requestAnimationFrame(loop);
  })();

  const hoverEls = qsa('a, button, .carousel__dot, .work-card__thumb');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('is-hovering');
      ring.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('is-hovering');
      ring.classList.remove('is-hovering');
    });
  });

  document.addEventListener('touchstart', () => {
    dot.style.display = 'none';
    ring.style.display = 'none';
  }, { once: true });
})();

/* ================================================================
   4. SCROLL PROGRESS RAIL
================================================================ */
(function initProgressRail() {
  const fill = qs('#progressFill');
  const orb = qs('#progressOrb');
  const counter = qs('#progressCurrent');
  if (!fill) return;

  function update() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = clamp(scrolled / (maxScroll || 1), 0, 1) * 100;

    fill.style.height = pct + '%';
    if (orb) orb.style.bottom = pct + '%';

    if (counter) {
      const idx = Math.round(pct / 100 * 4) + 1;
      counter.textContent = String(clamp(idx, 1, 5)).padStart(2, '0');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ================================================================
   5. HERO ENTRANCE ANIMATIONS
================================================================ */
(function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Ruled lines draw in (実 DOM 要素なので OK)
  const lineH1 = qs('.hero__ruled-line--h1');
  const lineH2 = qs('.hero__ruled-line--h2');
  const lineV1 = qs('.hero__ruled-line--v1');

  if (lineH1) tl.from(lineH1, { scaleX: 0, transformOrigin: 'left center', duration: 1.2 }, 0.1);
  if (lineH2) tl.from(lineH2, { scaleX: 0, transformOrigin: 'right center', duration: 1.2 }, 0.3);
  if (lineV1) tl.from(lineV1, { scaleY: 0, transformOrigin: 'top center', duration: 1.0 }, 0.2);

  // Corner coords
  const coordTL = qs('.hero__coord--tl');
  const coordBR = qs('.hero__coord--br');
  if (coordTL) tl.from(coordTL, { opacity: 0, x: -12, duration: 0.8 }, 0.8);
  if (coordBR) tl.from(coordBR, { opacity: 0, x: 12, duration: 0.8 }, 0.9);

  // Sequenced text reveals (data-delay 属性で順番制御)
  qsa('.js-fade-up').forEach(el => {
    const delay = (parseFloat(el.dataset.delay) || 0) / 1000;
    tl.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, 0.4 + delay);
  });

  // ---- Scroll Parallax ----
  const bgText = qs('#heroBgText');
  if (bgText) {
    gsap.to(bgText, {
      y: 500,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }

  const rowA = qs('.hero__title-row--a');
  const rowB = qs('.hero__title-row--b');

  if (rowA) {
    gsap.to(rowA, {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }

  if (rowB) {
    gsap.to(rowB, {
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      },
    });

    // shimmer アニメーション開始
    setTimeout(() => {
      rowB.style.animationPlayState = 'running';
    }, 1200);
  }
})();

/* ================================================================
   6. GALLERY SCROLL REVEALS
================================================================ */
(function initGalleryReveal() {
  // Chapter & heading slide in
  qsa('.js-reveal').forEach((el, i) => {
    const xFrom = i % 2 === 0 ? -20 : 20;
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
        once: true,
      },
    });
  });

  // Gallery rule line draw (実 DOM 要素 ← ここが修正ポイント)
  const galleryRule = qs('.gallery__rule');
  if (galleryRule) {
    gsap.from(galleryRule, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.gallery',
        start: 'top 85%',
        once: true,
      },
    });
  }

  // Carousel section entrance
  const carousel = qs('.carousel');
  if (carousel) {
    gsap.from(carousel, {
      opacity: 0,
      y: 48,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: carousel,
        start: 'top 80%',
        once: true,
      },
    });
  }
})();

/* ================================================================
   7. CAROUSEL
================================================================ */
const CarouselModule = (function () {
  const items = qsa('.carousel__item');
  const dots = qsa('.carousel__dot');
  const prevBtn = qs('#prevBtn');
  const nextBtn = qs('#nextBtn');
  const counter = qs('#progressCurrent');
  const total = items.length;

  let current = 0;
  let animating = false;

  function goTo(idx) {
    if (animating || idx === current || idx < 0 || idx >= total) return;
    animating = true;

    const prev = items[current];
    const next = items[idx];
    const dir = idx > current ? 1 : -1;

    // Update dots
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });

    if (counter) counter.textContent = String(idx + 1).padStart(2, '0');

    // Out
    gsap.timeline()
      .to(prev, {
        opacity: 0,
        x: dir * -40,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          prev.classList.remove('active');
          gsap.set(prev, { x: 0 });
        },
      })
      .set(next, { opacity: 0, x: dir * 48 })
      .call(() => { next.classList.add('active'); })
      .to(next, {
        opacity: 1,
        x: 0,
        duration: 0.55,
        ease: 'power3.out',
      })
      .from(
        next.querySelectorAll('.work-card__panel-body > *'),
        { y: 18, opacity: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' },
        '-=0.4'
      )
      .from(
        next.querySelector('.work-card__glass-wrap'),
        { rotateY: dir * -10, scale: 0.97, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )
      .call(() => {
        animating = false;
        current = idx;
      });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  // Touch swipe
  let touchX = 0;
  const carouselEl = qs('#carousel');
  if (carouselEl) {
    carouselEl.addEventListener('touchstart', e => {
      touchX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselEl.addEventListener('touchend', e => {
      const diff = touchX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 48) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  return { goTo, getCurrent: () => current };
})();

/* ================================================================
   8. 3D CARD MOUSE PARALLAX
================================================================ */
(function initCardParallax() {
  const BASE_RY = -5;
  const BASE_RX = 2;

  qsa('.carousel__item').forEach(item => {
    const inner = item.querySelector('.work-card__inner');
    if (!inner) return;

    item.addEventListener('mousemove', e => {
      if (!item.classList.contains('active')) return;

      const rect = inner.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(inner, {
        rotateY: BASE_RY + dx * 5,
        rotateX: BASE_RX - dy * 3,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      const panel = item.querySelector('.work-card__panel');
      if (panel) {
        gsap.to(panel, {
          x: dx * 6,
          y: dy * -4,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });

    item.addEventListener('mouseleave', () => {
      gsap.to(inner, {
        rotateY: BASE_RY,
        rotateX: BASE_RX,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      const panel = item.querySelector('.work-card__panel');
      if (panel) {
        gsap.to(panel, {
          x: 0, y: 0,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });
  });
})();

/* ================================================================
   9. VIDEO DUAL-SOURCE 8-SECOND LOOP
   data-src-1 (4秒) → data-src-2 (4秒) → ループ
================================================================ */
// (function initVideos() {
//   qsa('.work-card__video-layer').forEach(layer => {
//     const vidA = layer.querySelector('.work-card__video--a');
//     const vidB = layer.querySelector('.work-card__video--b');
//     if (!vidA || !vidB) return;

//     let playingA = true;

//     // 最初にAを再生
//     vidA.play().catch(() => { });

//     // A が終わったら B へ
//     vidA.addEventListener('ended', () => {
//       playingA = false;
//       vidB.currentTime = 0;
//       vidB.style.opacity = '1';
//       vidA.style.opacity = '0';
//       vidB.play().catch(() => { });
//     });

//     // B が終わったら A へ
//     vidB.addEventListener('ended', () => {
//       playingA = true;
//       vidA.currentTime = 0;
//       vidA.style.opacity = '1';
//       vidB.style.opacity = '0';
//       vidA.play().catch(() => { });
//     });
//   });
// })();

(function initVideos() {
  qsa('.work-card__video-layer').forEach(layer => {
    const vidA = layer.querySelector('.work-card__video--a');
    const vidB = layer.querySelector('.work-card__video--b');
    if (!vidA || !vidB) return;

    // Aが終了した時の処理
    vidA.addEventListener('ended', () => {
      vidB.currentTime = 0;
      // まず再生を開始する（まだ隠したまま）
      vidB.play().then(() => {
        // 再生が成功したら、表示を切り替える
        vidB.style.opacity = '1';
        vidA.style.opacity = '0';
      }).catch(e => console.log("B play error:", e));
    });

    // Bが終了した時の処理
    vidB.addEventListener('ended', () => {
      vidA.currentTime = 0;
      vidA.play().then(() => {
        vidA.style.opacity = '1';
        vidB.style.opacity = '0';
      }).catch(e => console.log("A play error:", e));
    });

    // 最初の起動
    vidA.play().catch(() => { });
  });
})();

/* ================================================================
   10. FLOATING PARTICLES
================================================================ */
(function initParticles() {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '3',
    overflow: 'hidden',
  });
  document.body.appendChild(container);

  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 2.5 + 0.8;

    Object.assign(p.style, {
      position: 'absolute',
      width: size + 'px',
      height: size + 'px',
      background: `rgba(${100 + Math.random() * 60}, ${180 + Math.random() * 50}, ${230 + Math.random() * 25}, ${(Math.random() * 0.35 + 0.05).toFixed(2)})`,
      borderRadius: '50%',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
    });

    container.appendChild(p);

    const dur = Math.random() * 10 + 8;
    const xDrift = (Math.random() - 0.5) * 100;
    const yRise = -(Math.random() * 280 + 80);

    gsap.to(p, {
      y: yRise,
      x: xDrift,
      opacity: 0,
      duration: dur,
      repeat: -1,
      delay: Math.random() * dur,
      ease: 'none',
      onRepeat() {
        gsap.set(p, {
          x: 0, y: 0,
          opacity: Math.random() * 0.35 + 0.05,
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
        });
      },
    });
  }
})();

/* ================================================================
   11. TEXT PARALLAX (gallery section)
================================================================ */
(function initTextParallax() {
  const heading = qs('.gallery__heading');
  const desc = qs('.gallery__desc');
  const trigger = '.gallery';

  if (heading) {
    gsap.to(heading, {
      y: -24,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 2 },
    });
  }

  if (desc) {
    gsap.to(desc, {
      y: -14,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 3 },
    });
  }
})();

/* ================================================================
   12. GLITCH EFFECT (hero title)
================================================================ */
(function initGlitch() {
  const titleB = qs('.hero__title-row--b');
  if (!titleB) return;

  function triggerGlitch() {
    gsap.timeline()
      .to(titleB, { skewX: 4, x: 3, duration: 0.06, ease: 'none' })
      .to(titleB, { skewX: -3, x: -2, duration: 0.05, ease: 'none' })
      .to(titleB, { skewX: 0, x: 0, duration: 0.08, ease: 'none' });

    setTimeout(triggerGlitch, Math.random() * 6000 + 4000);
  }

  setTimeout(triggerGlitch, Math.random() * 6000 + 4000);
})();

/* ================================================================
   13. FOOTER REVEAL
================================================================ */
(function initFooter() {
  const footer = qs('.site-footer');
  if (!footer) return;

  gsap.from(footer, {
    opacity: 0,
    y: 32,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: footer,
      start: 'top 90%',
      once: true,
    },
  });
})();

/* ================================================================
   14. PRELOADER
================================================================ */
(function initPreloader() {
  const loader = document.createElement('div');
  loader.id = 'preloader';
  Object.assign(loader.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10000',
    background: '#030810',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px',
    pointerEvents: 'all',
  });

  loader.innerHTML = `
    <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.5em;color:rgba(100,160,220,0.5);">
      LOST IN COMPLEX
    </p>
    <div style="width:160px;height:1px;background:rgba(74,158,224,0.15);overflow:hidden;border-radius:1px;">
      <div id="preloader-fill" style="width:0%;height:100%;background:linear-gradient(90deg,#4A9EE0,#9ADEFD);border-radius:1px;"></div>
    </div>
  `;

  document.body.appendChild(loader);

  const fill = loader.querySelector('#preloader-fill');

  gsap.to(fill, {
    width: '100%',
    duration: 1.2,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => loader.remove(),
      });
    },
  });
})();
