(() => {
  const VALID = ['zh', 'en', 'ja'];
  const LANG_KEY = 'ruin-archive-language';
  const GLYPHS = '·—░▒▓0123456789';
  let activeToken = 0;

  function readLanguage() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (VALID.includes(saved)) return saved;
    } catch (_) {}
    const raw = (document.documentElement.lang || '').toLowerCase();
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('ja')) return 'ja';
    return 'zh';
  }

  function saveLanguage(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }

  function htmlLang(lang) {
    return lang === 'zh' ? 'zh-Hans' : lang;
  }

  function scramble(text, ratio) {
    if (!text) return text;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\s/.test(ch) || /[，。！？、：；（）《》“”"'·/↗\-—–]/.test(ch)) {
        out += ch;
        continue;
      }
      out += Math.random() < ratio
        ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        : ch;
    }
    return out;
  }

  function decodeElement(el, finalText, token) {
    if (!el || el.textContent === finalText) return;
    const start = performance.now();
    const duration = 230;
    el.classList.add('ruin-decoding');

    function frame(now) {
      if (token !== activeToken) return;
      const t = Math.min(1, (now - start) / duration);
      const corruption = Math.max(0, 0.76 * (1 - t));
      el.textContent = t >= 0.9 ? finalText : scramble(finalText, corruption);
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = finalText;
        el.classList.remove('ruin-decoding');
      }
    }
    requestAnimationFrame(frame);
  }

  function applyMap(map, lang, root = document, animated = true) {
    const token = ++activeToken;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const entry = map[key];
      if (!entry) return;
      const finalText = typeof entry === 'string' ? entry : (entry[lang] ?? entry.zh ?? '');
      const rect = el.getBoundingClientRect();
      if (animated && rect.bottom >= 0 && rect.top <= innerHeight) decodeElement(el, finalText, token);
      else el.textContent = finalText;
    });
  }

  function setLanguage(lang, options = {}) {
    if (!VALID.includes(lang)) lang = 'zh';
    saveLanguage(lang);
    document.documentElement.lang = htmlLang(lang);
    document.documentElement.dataset.lang = lang;

    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const active = btn.dataset.langSwitch === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-current', active ? 'true' : 'false');
    });

    window.dispatchEvent(new CustomEvent('ruinlanguagechange', {
      detail: { lang, animated: options.animated !== false }
    }));
    return lang;
  }

  function bindLanguage() {
    document.addEventListener('click', event => {
      const btn = event.target.closest('[data-lang-switch]');
      if (!btn) return;
      event.preventDefault();
      setLanguage(btn.dataset.langSwitch, { animated: true });
    });
    setLanguage(readLanguage(), { animated: false });
  }

  const TONE_KEY = 'ruin-reader-tone';
  const WARM_POINT = 45;

  const PALETTES = {
    paper: {
      bg: [242, 242, 237],
      panel: [255, 255, 251],
      paper: [255, 255, 251],
      text: [23, 23, 23],
      muted: [103, 103, 98],
      faint: [181, 181, 173],
      line: [214, 214, 207],
      lineStrong: [132, 132, 126],
      mesh: [0, 0, 0, 0.025],
      innerGrid: [0, 0, 0, 0.018],
      hover: [255, 255, 255, 0.48],
      active: [255, 255, 255, 0.82],
      shadow: [0, 0, 0, 0.08],
      drawingInvert: 0,
      drawingBrightness: 1,
      drawingContrast: 1.06
    },
    warm: {
      bg: [231, 222, 201],
      panel: [239, 230, 210],
      paper: [243, 235, 216],
      text: [48, 46, 41],
      muted: [106, 99, 86],
      faint: [171, 161, 139],
      line: [198, 187, 164],
      lineStrong: [116, 108, 94],
      mesh: [92, 78, 59, 0.035],
      innerGrid: [92, 78, 59, 0.025],
      hover: [250, 242, 224, 0.52],
      active: [251, 244, 227, 0.82],
      shadow: [62, 52, 38, 0.075],
      drawingInvert: 0,
      drawingBrightness: 0.98,
      drawingContrast: 1.04
    },
    night: {
      bg: [25, 26, 24],
      panel: [27, 28, 26],
      paper: [31, 32, 30],
      text: [204, 201, 191],
      muted: [143, 142, 134],
      faint: [84, 85, 80],
      line: [65, 66, 61],
      lineStrong: [116, 117, 110],
      mesh: [210, 207, 195, 0.032],
      innerGrid: [210, 207, 195, 0.022],
      hover: [255, 255, 255, 0.035],
      active: [255, 255, 255, 0.065],
      shadow: [0, 0, 0, 0.24],
      drawingInvert: 0.88,
      drawingBrightness: 0.88,
      drawingContrast: 0.98
    }
  };

  const clampTone = value => Math.max(0, Math.min(100, Number(value) || 0));
  const mix = (a, b, t) => a + (b - a) * t;
  const mixArray = (a, b, t) => a.map((v, i) => mix(v, b[i], t));

  function interpolateTone(value, key) {
    const v = clampTone(value);
    if (v <= WARM_POINT) {
      return Array.isArray(PALETTES.paper[key])
        ? mixArray(PALETTES.paper[key], PALETTES.warm[key], v / WARM_POINT)
        : mix(PALETTES.paper[key], PALETTES.warm[key], v / WARM_POINT);
    }
    const t = (v - WARM_POINT) / (100 - WARM_POINT);
    return Array.isArray(PALETTES.warm[key])
      ? mixArray(PALETTES.warm[key], PALETTES.night[key], t)
      : mix(PALETTES.warm[key], PALETTES.night[key], t);
  }

  function rgb(arr) {
    return `rgb(${arr.slice(0, 3).map(v => Math.round(v)).join(', ')})`;
  }

  function rgba(arr) {
    return `rgba(${arr.slice(0, 3).map(v => Math.round(v)).join(', ')}, ${Math.max(0, Math.min(1, arr[3])).toFixed(4)})`;
  }

  function readTone() {
    try {
      const saved = localStorage.getItem(TONE_KEY);
      if (saved !== null && saved !== '') return clampTone(saved);
    } catch (_) {}
    return 0;
  }

  function saveTone(value) {
    try { localStorage.setItem(TONE_KEY, String(Math.round(clampTone(value)))); } catch (_) {}
  }

  function applyTone(value, { persist = false } = {}) {
    const v = clampTone(value);
    const root = document.documentElement;

    root.style.setProperty('--reader-bg', rgb(interpolateTone(v, 'bg')));
    root.style.setProperty('--reader-panel', rgb(interpolateTone(v, 'panel')));
    root.style.setProperty('--reader-paper', rgb(interpolateTone(v, 'paper')));
    root.style.setProperty('--reader-text', rgb(interpolateTone(v, 'text')));
    root.style.setProperty('--reader-muted', rgb(interpolateTone(v, 'muted')));
    root.style.setProperty('--reader-faint', rgb(interpolateTone(v, 'faint')));
    root.style.setProperty('--reader-line', rgb(interpolateTone(v, 'line')));
    root.style.setProperty('--reader-line-strong', rgb(interpolateTone(v, 'lineStrong')));
    root.style.setProperty('--reader-mesh', rgba(interpolateTone(v, 'mesh')));
    root.style.setProperty('--reader-grid-inner', rgba(interpolateTone(v, 'innerGrid')));
    root.style.setProperty('--reader-hover', rgba(interpolateTone(v, 'hover')));
    root.style.setProperty('--reader-active', rgba(interpolateTone(v, 'active')));
    root.style.setProperty('--reader-shadow', rgba(interpolateTone(v, 'shadow')));
    root.style.setProperty('--reader-drawing-invert', interpolateTone(v, 'drawingInvert').toFixed(4));
    root.style.setProperty('--reader-drawing-brightness', interpolateTone(v, 'drawingBrightness').toFixed(4));
    root.style.setProperty('--reader-drawing-contrast', interpolateTone(v, 'drawingContrast').toFixed(4));
    root.style.setProperty('--reader-tone-position', `${v}%`);
    root.dataset.readerToneValue = String(Math.round(v));
    root.style.colorScheme = v >= 72 ? 'dark' : 'light';

    document.querySelectorAll('input[type="range"][data-reader-tone]').forEach(slider => {
      if (Number(slider.value) !== v) slider.value = String(v);
      slider.setAttribute('aria-valuenow', String(Math.round(v)));
    });

    if (persist) saveTone(v);

    window.dispatchEvent(new CustomEvent('ruinreaderchange', {
      detail: { value: v }
    }));
    return v;
  }

  let toneRaf = 0;
  let latestTone = null;

  function queueTone(value) {
    latestTone = clampTone(value);
    if (toneRaf) return;
    toneRaf = requestAnimationFrame(() => {
      toneRaf = 0;
      const v = latestTone;
      latestTone = null;
      applyTone(v, { persist: false });
    });
  }

  function bindTone() {
    // v70: remove the stale root marker left by v69 during hot reload.
    document.documentElement.removeAttribute('data-reader-tone');
    const sliders = [...document.querySelectorAll('input[type="range"][data-reader-tone]')];
    const initial = readTone();

    sliders.forEach(slider => {
      slider.min = '0';
      slider.max = '100';
      slider.step = '1';
      slider.value = String(initial);

      slider.addEventListener('input', () => queueTone(slider.value));

      slider.addEventListener('change', () => {
        applyTone(slider.value, { persist: true });
      });

      slider.addEventListener('pointerdown', () => {
        slider.classList.add('is-dragging');
      });

      slider.addEventListener('pointerup', () => {
        slider.classList.remove('is-dragging');
        applyTone(slider.value, { persist: true });
      });

      slider.addEventListener('pointercancel', () => {
        slider.classList.remove('is-dragging');
      });

      slider.addEventListener('keydown', event => {
        if (['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key)) {
          requestAnimationFrame(() => applyTone(slider.value, { persist: true }));
        }
      });
    });

    applyTone(initial, { persist: false });
  }

  window.RuinLanguage = {
    read: readLanguage,
    set: setLanguage,
    bind: bindLanguage,
    applyMap,
    htmlLang
  };

  window.RuinReaderTone = {
    read: readTone,
    apply: applyTone,
    save: saveTone,
    bind: bindTone
  };

  applyTone(readTone(), { persist: false });

  function boot() {
    bindLanguage();
    bindTone();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();