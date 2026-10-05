(() => {
  'use strict';

  // Load the canonical production core first.  The right-side fracture
  // controller below only changes visibility after the authored SVG exists;
  // it does not replace the fracture renderer itself.
  document.write('<script src="script-core.js?v=367-right-fracture-random"><\/script>');

  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const GLOBAL_SVG = '#ruin-fracture-global-layer > svg.ruin-fracture-overlay.ruin-fracture-global';
  const MAIN_SVG = '#main-viewport-frame > svg.ruin-fracture-overlay.ruin-fracture-main-frame';

  // One stable draw per page load.
  // ② upper-right attached pit: 50%
  // ③+④ lower-right chipped notch + outward tree: 58%
  // The already-working upper-left group remains at 58%.
  const plan = Object.freeze({
    topLeft: Math.random() < 0.58,
    upperRight: Math.random() < 0.50,
    lowerRight: Math.random() < 0.58
  });

  window.RuinPerimeterFracturePlan = plan;
  root.dataset.fractureTopLeft = plan.topLeft ? 'on' : 'off';
  root.dataset.fractureUpperRight = plan.upperRight ? 'on' : 'off';
  root.dataset.fractureLowerRight = plan.lowerRight ? 'on' : 'off';

  // Only the upper-left group needs a CSS fallback because its authored
  // geometry lives in a separate global overlay.  The two right-hand groups
  // are handled node-by-node below so the rest of the inner frame is never
  // hidden with them.
  const style = document.createElement('style');
  style.id = 'ruin-perimeter-fracture-presence-style';
  style.textContent = `
    html[data-fracture-top-left="off"] #ruin-fracture-global-layer {
      display: none !important;
    }
    html[data-fracture-top-left="off"] body.ruin-fracture-active > .perspective-line line {
      stroke: var(--reader-line-strong, rgba(0,0,0,.42)) !important;
    }
  `;
  document.head.appendChild(style);

  function setVisible(node, visible) {
    if (!node) return;
    if (visible) {
      node.style.removeProperty('display');
      node.style.removeProperty('visibility');
    } else {
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
    }
  }

  function safeBBox(node) {
    if (!node) return null;
    try {
      const box = node.getBBox();
      if (![box.x, box.y, box.width, box.height].every(Number.isFinite)) return null;
      return box;
    } catch (_) {
      return null;
    }
  }

  function overlapY(a, b) {
    if (!a || !b) return 0;
    return Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  }

  function ensureRepairLine(svg, key) {
    let line = svg.querySelector(`[data-random-fracture-repair="${key}"]`);
    if (line) return line;

    line = document.createElementNS(NS, 'line');
    line.dataset.randomFractureRepair = key;
    line.setAttribute('class', 'ruin-fracture-border ruin-random-fracture-repair');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    line.setAttribute('pointer-events', 'none');
    svg.appendChild(line);
    return line;
  }

  function syncRepairLine(svg, key, x, y1, y2, visible, opacity = 0.86) {
    if (!svg || !Number.isFinite(x) || !Number.isFinite(y1) || !Number.isFinite(y2)) return;
    const line = ensureRepairLine(svg, key);
    line.setAttribute('x1', x.toFixed(2));
    line.setAttribute('x2', x.toFixed(2));
    line.setAttribute('y1', Math.min(y1, y2).toFixed(2));
    line.setAttribute('y2', Math.max(y1, y2).toFixed(2));
    line.setAttribute('opacity', String(opacity));
    setVisible(line, visible);
  }

  function findLowerNotchOutline(svg, lowerReturn, width, height) {
    if (!svg || !lowerReturn) return null;
    const returnBox = safeBBox(lowerReturn);
    if (!returnBox) return null;

    const isLocalRightNotch = node => {
      if (!node || node.hasAttribute('data-random-fracture-repair')) return false;
      if (!node.matches?.('polyline.ruin-fracture-border')) return false;
      const box = safeBBox(node);
      if (!box) return false;

      const maxX = box.x + box.width;
      const rightEdge = maxX >= width - 1.75;
      const lowerHalf = box.y > height * 0.42;
      const localHeight = box.height > 4 && box.height < height * 0.34;
      const overlapsReturn = overlapY(box, returnBox) > Math.min(4, returnBox.height * 0.18);
      return rightEdge && lowerHalf && localHeight && overlapsReturn;
    };

    // In the canonical renderer the notch polyline sits directly before its
    // named return line.  Validate its geometry before accepting it so a future
    // DOM-order change can never make us hide an entire frame edge again.
    const previous = lowerReturn.previousElementSibling;
    if (isLocalRightNotch(previous)) return previous;

    const returnCenterY = returnBox.y + returnBox.height * 0.5;
    const candidates = [...svg.querySelectorAll('polyline.ruin-fracture-border')]
      .filter(isLocalRightNotch)
      .map(node => {
        const box = safeBBox(node);
        const centerY = box.y + box.height * 0.5;
        const score = Math.abs(centerY - returnCenterY) + Math.abs(box.height - returnBox.height) * 0.25;
        return { node, score };
      })
      .sort((a, b) => a.score - b.score);

    return candidates[0]?.node || null;
  }

  function syncTopLeft() {
    const svg = document.querySelector(GLOBAL_SVG);
    if (!svg) return;
    setVisible(svg, plan.topLeft);
  }

  function syncRightFractures() {
    const svg = document.querySelector(MAIN_SVG);
    if (!svg) return;

    const viewBox = svg.viewBox?.baseVal;
    const rect = svg.getBoundingClientRect();
    const width = viewBox?.width || rect.width || 0;
    const height = viewBox?.height || rect.height || 0;
    if (!width || !height) return;

    const borderX = width - 0.5;

    // ---------------------------------------------------------------------
    // ② upper-right attached pit
    // ---------------------------------------------------------------------
    // Important: the authored `upper-attached-pit` path is not merely the
    // little pit.  It also carries the long straight right edge from the
    // top-right corner down to the lower-right notch.  Therefore hiding that
    // path alone removes a huge piece of the frame.  When the pit is absent we
    // hide the authored path/return, then replace its complete vertical span
    // with one clean architectural border line.
    const upperPit = svg.querySelector('.ruin-fracture-upper-attached-pit');
    const upperReturn = svg.querySelector('.ruin-fracture-upper-attached-return');
    const upperBox = safeBBox(upperPit);

    setVisible(upperPit, plan.upperRight);
    setVisible(upperReturn, plan.upperRight);

    if (upperBox) {
      syncRepairLine(
        svg,
        'upper-right-edge',
        borderX,
        upperBox.y,
        upperBox.y + upperBox.height,
        !plan.upperRight,
        0.86
      );
    }

    // ---------------------------------------------------------------------
    // ③ lower-right chipped notch + ④ outward tree fracture
    // ---------------------------------------------------------------------
    const lowerReturn = svg.querySelector('.ruin-fracture-lower-right-return');
    const lowerOutline = findLowerNotchOutline(svg, lowerReturn, width, height);
    const lowerReturnBox = safeBBox(lowerReturn);
    const lowerOutlineBox = safeBBox(lowerOutline);

    setVisible(lowerOutline, plan.lowerRight);
    setVisible(lowerReturn, plan.lowerRight);

    svg.querySelectorAll(
      '.ruin-fracture-outward-stem, .ruin-fracture-outward-branch, .ruin-fracture-outward-branch-minor'
    ).forEach(node => setVisible(node, plan.lowerRight));

    // Restore only the local vertical span occupied by the lower notch.  Do not
    // touch the top edge, the title notch, the upper pit, or any other authored
    // frame path.
    const lowerRepairBox = lowerOutlineBox || lowerReturnBox;
    if (lowerRepairBox) {
      syncRepairLine(
        svg,
        'lower-right-edge',
        borderX,
        lowerRepairBox.y,
        lowerRepairBox.y + lowerRepairBox.height,
        !plan.lowerRight,
        0.86
      );
    }
  }

  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      syncTopLeft();
      syncRightFractures();
    });
  }

  // The canonical fracture renderer may rebuild the SVG on startup / resize.
  // Watch structural replacement only.  Repair-line attribute updates do not
  // retrigger this observer, keeping the controller stable and idempotent.
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('resize', schedule, { passive: true });
})();
