/* ══════════════════════════════════════════════════════
   SCROLL ANIMATIONS — Intersection Observer
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const animatedEls = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;

        setTimeout(() => {
          el.classList.add('is-visible');
        }, delay);

        observer.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  animatedEls.forEach((el) => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Gallery images in order (src, caption)
  const galleryItems = Array.from(
    document.querySelectorAll('.gallery__item[data-src]')
  );

  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCap   = document.getElementById('lightboxCaption');
  const closeBtn      = document.getElementById('lightboxClose');
  const backdrop      = document.getElementById('lightboxBackdrop');
  const prevBtn       = document.getElementById('lightboxPrev');
  const nextBtn       = document.getElementById('lightboxNext');

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxImg.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const item = galleryItems[currentIndex];
    const src  = item.dataset.src;
    const cap  = item.dataset.caption || '';

    // Fade out → swap → fade in
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.94)';

    setTimeout(() => {
      lightboxImg.src = src;
      lightboxImg.alt = cap;
      lightboxCap.textContent = cap;

      lightboxImg.onload = () => {
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      };

      // In case image is cached and onload doesn't fire
      if (lightboxImg.complete) {
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }
    }, 180);

    // Add transition style if not already present
    lightboxImg.style.transition = 'opacity .25s ease, transform .25s ease';

    // Hide nav arrows if only one image
    prevBtn.style.display = galleryItems.length > 1 ? '' : 'none';
    nextBtn.style.display = galleryItems.length > 1 ? '' : 'none';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }

  // Attach click listeners to gallery items
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `გახსენი: ${item.dataset.caption || ''}`);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) showNext();
    else         showPrev();
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   SMOOTH ACTIVE NAV (optional — no nav bar here but
   useful if one is added later)
══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   HERO CARDS — subtle parallax on mouse move
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const hero  = document.querySelector('.hero');
  const cards = document.querySelectorAll('.hero__card img');
  if (!hero || !cards.length) return;

  let ticking = false;

  hero.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect   = hero.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width  - 0.5;
      const yRatio = (e.clientY - rect.top)  / rect.height - 0.5;

      cards.forEach((img, i) => {
        const dir = i === 0 ? 1 : -1;
        img.style.transform = `translate(${xRatio * dir * 6}px, ${yRatio * 4}px) scale(1.04)`;
      });

      ticking = false;
    });
  });

  hero.addEventListener('mouseleave', () => {
    cards.forEach((img) => { img.style.transform = ''; });
  });
})();


/* ══════════════════════════════════════════════════════
   COUNTER ANIMATION on pricing amount
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const priceEl = document.querySelector('.pricing__amount');
  if (!priceEl) return;

  let animated = false;

  const obs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || animated) return;
    animated = true;

    const target = 50;
    const duration = 900;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = Math.round(eased * target);
      priceEl.innerHTML = `${value} <span>₾</span>`;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, { threshold: 0.5 });

  obs.observe(priceEl);
})();
