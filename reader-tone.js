(() => {
  const KEY = 'ruin-reader-tone';
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

  const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
  const mix = (a, b, t) => a + (b - a) * t;
  const mixArray = (a, b, t) => a.map((v, i) => mix(v, b[i], t));

  function interpolate(value, key) {
    const v = clamp(value);
    if (v <= WARM_POINT) {
      return Array.isArray(PALETTES.paper[key])
        ? mixArray(PALETTES.paper[key], PALETTES.warm[key], v / WARM_POINT)
        : mix(PALETTES.paper[key], PALETTES.warm[key], v / WARM_POINT);
    }
    return Array.isArray(PALETTES.warm[key])
      ? mixArray(PALETTES.warm[key], PALETTES.night[key], (v - WARM_POINT) / (100 - WARM_POINT))
      : mix(PALETTES.warm[key], PALETTES.night[key], (v - WARM_POINT) / (100 - WARM_POINT));
  }

  function rgb(arr) {
    return `rgb(${arr.slice(0, 3).map(v => Math.round(v)).join(', ')})`;
  }

  function rgba(arr) {
    return `rgba(${arr.slice(0, 3).map(v => Math.round(v)).join(', ')}, ${Math.max(0, Math.min(1, arr[3])).toFixed(4)})`;
  }

  function read() {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored !== null && stored !== '') return clamp(stored);
    } catch (_) {}
    return 0;
  }

  function save(value) {
    try { localStorage.setItem(KEY, String(Math.round(clamp(value)))); } catch (_) {}
  }

  function apply(value, { persist = false } = {}) {
    const v = clamp(value);
    const root = document.documentElement;

    root.style.setProperty('--reader-bg', rgb(interpolate(v, 'bg')));
    root.style.setProperty('--reader-panel', rgb(interpolate(v, 'panel')));
    root.style.setProperty('--reader-paper', rgb(interpolate(v, 'paper')));
    root.style.setProperty('--reader-text', rgb(interpolate(v, 'text')));
    root.style.setProperty('--reader-muted', rgb(interpolate(v, 'muted')));
    root.style.setProperty('--reader-faint', rgb(interpolate(v, 'faint')));
    root.style.setProperty('--reader-line', rgb(interpolate(v, 'line')));
    root.style.setProperty('--reader-line-strong', rgb(interpolate(v, 'lineStrong')));
    root.style.setProperty('--reader-mesh', rgba(interpolate(v, 'mesh')));
    root.style.setProperty('--reader-grid-inner', rgba(interpolate(v, 'innerGrid')));
    root.style.setProperty('--reader-hover', rgba(interpolate(v, 'hover')));
    root.style.setProperty('--reader-active', rgba(interpolate(v, 'active')));
    root.style.setProperty('--reader-shadow', rgba(interpolate(v, 'shadow')));

    root.style.setProperty('--reader-drawing-invert', interpolate(v, 'drawingInvert').toFixed(4));
    root.style.setProperty('--reader-drawing-brightness', interpolate(v, 'drawingBrightness').toFixed(4));
    root.style.setProperty('--reader-drawing-contrast', interpolate(v, 'drawingContrast').toFixed(4));
    root.style.setProperty('--reader-tone-position', `${v}%`);

    root.dataset.readerTone = String(Math.round(v));
    root.style.colorScheme = v >= 72 ? 'dark' : 'light';

    document.querySelectorAll('[data-reader-tone]').forEach(slider => {
      if (Number(slider.value) !== v) slider.value = String(v);
      slider.style.setProperty('--reader-tone-position', `${v}%`);
    });

    if (persist) save(v);
    window.dispatchEvent(new CustomEvent('ruinreaderchange', { detail: { value: v } }));
    return v;
  }

  let queued = null;
  let raf = 0;

  function queue(value, persist) {
    queued = { value: clamp(value), persist };
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const task = queued;
      queued = null;
      if (task) apply(task.value, { persist: task.persist });
    });
  }

  function bind() {
    const sliders = [...document.querySelectorAll('[data-reader-tone]')];
    const initial = read();
    sliders.forEach(slider => {
      slider.min = '0';
      slider.max = '100';
      slider.step = '1';
      slider.value = String(initial);
      slider.addEventListener('input', () => queue(slider.value, false), { passive: true });
      slider.addEventListener('change', () => queue(slider.value, true));
      slider.addEventListener('pointerup', () => save(slider.value), { passive: true });
      slider.addEventListener('keyup', () => save(slider.value), { passive: true });
    });
    apply(initial, { persist: false });
  }

  // Apply before the body paints when this script is loaded from <head>.
  apply(read(), { persist: false });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  window.RuinReaderTone = { read, apply, save, bind };
})();