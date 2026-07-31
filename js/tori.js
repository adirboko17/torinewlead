// Tori landing — scroll motion + interactions (vanilla)
(function () {
  // ---- nav scrolled state ----
  const nav = document.querySelector('.nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  // ---- browser chrome color: match visible section (not the mobile menu) ----
  const THEME_DARK = '#161009';
  const THEME_CREAM = '#FBF3E8';
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const creamSections = document.querySelectorAll('.showcase, .pricing');
  let isCream = false;

  function setBrowserChrome(cream) {
    if (cream === isCream) return;
    isCream = cream;
    const color = cream ? THEME_CREAM : THEME_DARK;
    document.documentElement.classList.toggle('theme-cream', cream);
    document.body.classList.toggle('theme-cream', cream);
    if (themeMeta) themeMeta.content = color;
  }

  function syncBrowserChrome() {
    if (document.body.classList.contains('nav-open')) return;
    const vh = window.innerHeight;
    const creamVisible = [...creamSections].some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < vh * 0.85 && r.bottom > vh * 0.15;
    });
    setBrowserChrome(creamVisible);
  }

  if (creamSections.length) {
    const themeIo = new IntersectionObserver(() => syncBrowserChrome(), { threshold: [0, 0.1] });
    creamSections.forEach((el) => themeIo.observe(el));
    window.addEventListener('scroll', syncBrowserChrome, { passive: true });
    syncBrowserChrome();
  }

  // ---- mobile burger menu ----
  const burger = document.querySelector('.nav-burger');
  const navMenu = document.getElementById('nav-menu');
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) setBrowserChrome(false);
    });
    navMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
        syncBrowserChrome();
      });
    });
  }

  // ---- phones carousel: swipe-hint dots follow scroll ----
  const phonesRow = document.querySelector('.phones-row');
  const hintDots = document.querySelectorAll('.swipe-hint .dots i');
  if (phonesRow && hintDots.length) {
    phonesRow.addEventListener('scroll', () => {
      const max = phonesRow.scrollWidth - phonesRow.clientWidth;
      if (max <= 0) return;
      // RTL: scrollLeft runs 0 -> -max (or 0 -> max depending on browser); normalize
      const p = Math.min(Math.abs(phonesRow.scrollLeft) / max, 1);
      const idx = Math.round(p * (hintDots.length - 1));
      hintDots.forEach((d, i) => d.classList.toggle('on', i === idx));
    }, { passive: true });
  }

  // ---- scroll reveal ----
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => io.observe(el));

  // ---- staggered delays inside groups ----
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--d', (i * 0.1).toFixed(2) + 's');
    });
  });

  // ---- hero phone parallax ----
  const heroPhone = document.querySelector('.hero-phone');
  const dashPhone = document.querySelector('.dash-phone');
  let ticking = false;
  function parallax() {
    if (document.body.classList.contains('no-motion')) { ticking = false; return; }
    const y = window.scrollY;
    if (heroPhone) heroPhone.style.transform = 'translateY(' + y * 0.08 + 'px) rotate(' + Math.min(y * 0.004, 3) + 'deg)';
    if (dashPhone) {
      const r = dashPhone.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      dashPhone.style.transform = 'translateY(' + center * -0.06 + 'px)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });

  // ---- animated counters ----
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 1400;
    const t0 = performance.now();
    function frame(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString('he-IL') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (document.body.classList.contains('no-motion')) {
          const el = e.target;
          el.textContent = (el.dataset.prefix || '') + parseFloat(el.dataset.count).toLocaleString('he-IL') + (el.dataset.suffix || '');
        } else {
          animateCount(e.target);
        }
        cio.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

  // ---- FAQ: close others ----
  const faqs = document.querySelectorAll('details.faq');
  faqs.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  // ---- hero demo video: ensure autoplay ----
  const heroVideo = document.querySelector('.hero-phone video');
  if (heroVideo) {
    heroVideo.muted = true;
    const tryPlay = () => heroVideo.play().catch(() => {});
    tryPlay();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });
  }

  // ---- legal modals (terms / privacy / accessibility) ----
  const legalModal = document.getElementById('legal-modal');
  const legalTitle = document.getElementById('legal-modal-title');
  const legalBody = document.getElementById('legal-modal-body');
  const legalDocs = window.TORI_LEGAL || {};
  let legalLastFocus = null;

  function openLegalModal(key) {
    const doc = legalDocs[key];
    if (!legalModal || !doc) return;
    legalLastFocus = document.activeElement;
    legalTitle.textContent = doc.title;
    legalBody.innerHTML = doc.html;
    legalBody.querySelectorAll('[data-legal-open]').forEach((link) => {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        openLegalModal(link.dataset.legalOpen);
      });
    });
    legalModal.hidden = false;
    legalModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('legal-open');
    requestAnimationFrame(() => legalModal.classList.add('open'));
    legalModal.querySelector('.legal-modal-close')?.focus();
  }

  function closeLegalModal() {
    if (!legalModal) return;
    legalModal.classList.remove('open');
    legalModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('legal-open');
    window.setTimeout(() => {
      if (!legalModal.classList.contains('open')) {
        legalModal.hidden = true;
        legalBody.innerHTML = '';
      }
    }, 320);
    legalLastFocus?.focus?.();
    legalLastFocus = null;
  }

  document.querySelectorAll('[data-legal]').forEach((link) => {
    link.addEventListener('click', (ev) => {
      ev.preventDefault();
      openLegalModal(link.dataset.legal);
    });
  });

  legalModal?.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-legal-close]')) closeLegalModal();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && legalModal && !legalModal.hidden) closeLegalModal();
  });

  // ---- Meta Pixel: engagement events ----
  function fbTrack(event, params) {
    if (typeof fbq === 'function') fbq('track', event, params || {});
  }
  function fbTrackCustom(event, params) {
    if (typeof fbq === 'function') fbq('trackCustom', event, params || {});
  }

  // ---- lead form → /api/lead (Vercel + Resend) ----
  const form = document.getElementById('lead-form-el');
  if (form) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();

      const card = form.closest('.form-card');
      const btn = form.querySelector('button[type="submit"]');
      const payload = {
        name: document.getElementById('f-name')?.value?.trim() || '',
        business: document.getElementById('f-biz')?.value?.trim() || '',
        phone: document.getElementById('f-phone')?.value?.trim() || '',
        type: document.getElementById('f-type')?.value || '',
        notes: document.getElementById('f-notes')?.value?.trim() || '',
      };

      if (btn) {
        btn.disabled = true;
        btn.dataset.originalHtml = btn.innerHTML;
        btn.textContent = 'שולח...';
      }

      try {
        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('send failed');

        card.classList.add('sent');
        fbTrack('Lead', {
          content_name: 'Tori Landing Form',
          content_category: payload.type,
          currency: 'ILS',
          value: 249
        });
      } catch (err) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = btn.dataset.originalHtml || 'שליחת פרטים <span class="arrow">←</span>';
        }
        window.alert('לא הצלחנו לשלוח את הפרטים. נסו שוב או צרו קשר בוואטסאפ.');
      }
    });
  }

  document.querySelector('.wa-float')?.addEventListener('click', () => {
    fbTrack('Contact', { content_name: 'WhatsApp' });
  });

  document.querySelectorAll('a[href="#lead-form"]').forEach((a) => {
    a.addEventListener('click', () => {
      fbTrackCustom('ClickCTA', {
        button_text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 60),
        location: a.closest('[data-screen-label]')?.dataset.screenLabel || 'nav'
      });
    });
  });

  const pixelViews = [
    { el: document.getElementById('lead-form'), name: 'Lead Form' },
    { el: document.getElementById('pricing'), name: 'Pricing' }
  ].filter((s) => s.el);
  if (pixelViews.length) {
    const viewIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        fbTrack('ViewContent', { content_name: e.target.dataset.pixelContent });
        viewIo.unobserve(e.target);
      });
    }, { threshold: 0.45 });
    pixelViews.forEach(({ el, name }) => {
      el.dataset.pixelContent = name;
      viewIo.observe(el);
    });
  }
})();
