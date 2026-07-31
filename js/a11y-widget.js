// Tori accessibility widget — floating panel, persists preferences
(function () {
  const STORAGE_KEY = 'tori-a11y';
  const root = document.documentElement;
  const widget = document.getElementById('a11y-widget');
  const panel = document.getElementById('a11y-panel');
  const toggle = document.getElementById('a11y-toggle');
  if (!widget || !panel || !toggle) return;

  const state = {
    fontLevel: 0,
    contrast: false,
    links: false,
    readable: false,
    motion: true,
    spacing: false
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') Object.assign(state, saved);
    } catch (_) { /* ignore */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* ignore */ }
  }

  function applyState() {
    root.classList.remove('a11y-font-1', 'a11y-font-2', 'a11y-font-3');
    if (state.fontLevel > 0) root.classList.add('a11y-font-' + state.fontLevel);

    root.classList.toggle('a11y-contrast', state.contrast);
    root.classList.toggle('a11y-links', state.links);
    root.classList.toggle('a11y-readable', state.readable);
    root.classList.toggle('a11y-spacing', state.spacing);
    document.body.classList.toggle('no-motion', !state.motion);

    panel.querySelectorAll('[data-a11y]').forEach((btn) => {
      const key = btn.dataset.a11y;
      if (key === 'font-up' || key === 'font-down' || key === 'reset') return;
      const on = key === 'motion' ? !state.motion : !!state[key];
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    const fontLabel = panel.querySelector('[data-a11y-font-label]');
    if (fontLabel) {
      const labels = ['רגיל', 'גדול', 'גדול יותר', 'גדול מאוד'];
      fontLabel.textContent = labels[state.fontLevel] || labels[0];
    }
  }

  function setPanelOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    widget.classList.toggle('open', open);
    if (open) panel.querySelector('.a11y-panel-close')?.focus();
    else toggle.focus();
  }

  toggle.addEventListener('click', () => setPanelOpen(!widget.classList.contains('open')));

  panel.querySelector('.a11y-panel-close')?.addEventListener('click', () => setPanelOpen(false));

  document.addEventListener('click', (ev) => {
    if (!widget.classList.contains('open')) return;
    if (!widget.contains(ev.target)) setPanelOpen(false);
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && widget.classList.contains('open')) {
      ev.stopPropagation();
      setPanelOpen(false);
    }
  });

  panel.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-a11y]');
    if (!btn) return;

    const action = btn.dataset.a11y;
    switch (action) {
      case 'font-up':
        state.fontLevel = Math.min(state.fontLevel + 1, 3);
        break;
      case 'font-down':
        state.fontLevel = Math.max(state.fontLevel - 1, 0);
        break;
      case 'contrast':
        state.contrast = !state.contrast;
        break;
      case 'links':
        state.links = !state.links;
        break;
      case 'readable':
        state.readable = !state.readable;
        break;
      case 'motion':
        state.motion = !state.motion;
        break;
      case 'spacing':
        state.spacing = !state.spacing;
        break;
      case 'reset':
        state.fontLevel = 0;
        state.contrast = false;
        state.links = false;
        state.readable = false;
        state.motion = true;
        state.spacing = false;
        break;
      default:
        return;
    }

    applyState();
    saveState();
  });

  loadState();
  applyState();
})();
