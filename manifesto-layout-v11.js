(() => {
  'use strict';

  const root = document.documentElement;
  const scroller = document.getElementById('manifesto-scroll');
  const ruler = document.getElementById('manifesto-margin-ruler');
  const leftHandle = document.querySelector('[data-margin-side="left"]');
  const rightHandle = document.querySelector('[data-margin-side="right"]');
  if (!scroller || !ruler || !leftHandle || !rightHandle) return;

  const STORAGE_KEY = 'ruin-manifesto-margins-v1';
  const MIN_MARGIN = 4;
  const MAX_MARGIN = 38;
  const DEFAULT_MARGIN = 11.5;
  const MIN_CENTER_PX = 420;
  const TRACK_INSET_PX = 48;

  let margins = {left: DEFAULT_MARGIN, right: DEFAULT_MARGIN};
  let drag = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round = value => Math.round(value * 10) / 10;

  function trackMetrics() {
    const rect = ruler.getBoundingClientRect();
    const left = rect.left + TRACK_INSET_PX;
    const right = Math.max(left + 1, rect.right - TRACK_INSET_PX);
    return {left, right, width: Math.max(1, right - left)};
  }

  function minCenterPercent() {
    const width = trackMetrics().width;
    return clamp((MIN_CENTER_PX / width) * 100, 24, 58);
  }

  function maxFor(side) {
    const other = side === 'left' ? margins.right : margins.left;
    return Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, 100 - other - minCenterPercent()));
  }

  function normalize() {
    margins.left = round(clamp(Number(margins.left) || DEFAULT_MARGIN, MIN_MARGIN, MAX_MARGIN));
    margins.right = round(clamp(Number(margins.right) || DEFAULT_MARGIN, MIN_MARGIN, MAX_MARGIN));

    margins.left = Math.min(margins.left, maxFor('left'));
    margins.right = Math.min(margins.right, maxFor('right'));
  }

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        margins.left = Number(saved.left) || DEFAULT_MARGIN;
        margins.right = Number(saved.right) || DEFAULT_MARGIN;
      }
    } catch (_) {}
    normalize();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(margins)); } catch (_) {}
  }

  function syncHandle(handle, side) {
    const value = margins[side];
    handle.setAttribute('aria-valuemin', String(MIN_MARGIN));
    handle.setAttribute('aria-valuemax', String(round(maxFor(side))));
    handle.setAttribute('aria-valuenow', String(value));
    handle.setAttribute('aria-valuetext', `${value.toFixed(1)}%`);
  }

  function apply(shouldSave = false) {
    normalize();
    const track = trackMetrics();
    const leftFromRuler = TRACK_INSET_PX + (track.width * margins.left / 100);
    const rightFromRuler = TRACK_INSET_PX + (track.width * margins.right / 100);

    root.style.setProperty('--manifesto-margin-left', `${margins.left}%`);
    root.style.setProperty('--manifesto-margin-right', `${margins.right}%`);
    root.style.setProperty('--manifesto-content-left-px', `${leftFromRuler}px`);
    root.style.setProperty('--manifesto-content-right-px', `${rightFromRuler}px`);

    leftHandle.style.left = `${leftFromRuler}px`;
    leftHandle.style.right = 'auto';
    rightHandle.style.right = `${rightFromRuler}px`;
    rightHandle.style.left = 'auto';

    syncHandle(leftHandle, 'left');
    syncHandle(rightHandle, 'right');
    if (shouldSave) save();
  }

  function setMargin(side, value, shouldSave = true) {
    margins[side] = round(clamp(value, MIN_MARGIN, maxFor(side)));
    apply(shouldSave);
  }

  function valueFromPointer(side, clientX) {
    const track = trackMetrics();
    const x = clamp(clientX, track.left, track.right);
    if (side === 'left') return ((x - track.left) / track.width) * 100;
    return ((track.right - x) / track.width) * 100;
  }

  function startDrag(event, side, handle) {
    if (event.button !== undefined && event.button !== 0) return;
    drag = {pointerId: event.pointerId, side, handle};
    handle.setPointerCapture?.(event.pointerId);
    handle.classList.add('is-dragging');
    ruler.classList.add('is-dragging');
    setMargin(side, valueFromPointer(side, event.clientX), false);
    event.preventDefault();
  }

  function moveDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    setMargin(drag.side, valueFromPointer(drag.side, event.clientX), false);
  }

  function endDrag(event) {
    if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
    drag.handle.classList.remove('is-dragging');
    ruler.classList.remove('is-dragging');
    drag = null;
    save();
  }

  function onKey(event, side) {
    const step = event.shiftKey ? 2 : 0.5;
    let next = margins[side];

    if (event.key === 'Home') next = MIN_MARGIN;
    else if (event.key === 'End') next = maxFor(side);
    else if (side === 'left' && event.key === 'ArrowLeft') next -= step;
    else if (side === 'left' && event.key === 'ArrowRight') next += step;
    else if (side === 'right' && event.key === 'ArrowLeft') next += step;
    else if (side === 'right' && event.key === 'ArrowRight') next -= step;
    else return;

    event.preventDefault();
    setMargin(side, next, true);
  }

  leftHandle.addEventListener('pointerdown', event => startDrag(event, 'left', leftHandle));
  rightHandle.addEventListener('pointerdown', event => startDrag(event, 'right', rightHandle));
  window.addEventListener('pointermove', moveDrag, {passive: false});
  window.addEventListener('pointerup', endDrag, {passive: true});
  window.addEventListener('pointercancel', endDrag, {passive: true});

  leftHandle.addEventListener('keydown', event => onKey(event, 'left'));
  rightHandle.addEventListener('keydown', event => onKey(event, 'right'));

  window.addEventListener('resize', () => apply(false), {passive: true});

  read();
  requestAnimationFrame(() => apply(false));
})();