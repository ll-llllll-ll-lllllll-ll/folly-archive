(() => {
  'use strict';

  // Load the canonical production core first.  This controller only switches
  // authored fracture geometry between its broken and straight-edge states.
  document.write('<script src="script-core.js?v=368-right-fracture-geometry"><\/script>');

  const root = document.documentElement;
  const GLOBAL_SVG = '#ruin-fracture-global-layer > svg.ruin-fracture-overlay.ruin-fracture-global';
  const MAIN_SVG = '#main-viewport-frame > svg.ruin-fracture-overlay.ruin-fracture-main-frame';

  // One stable draw per page load.
  const plan = Object.freeze({
    topLeft: Math.random() < 0.58,
    upperRight: Math.random() < 0.50,
    lowerRight: Math.random() < 0.58
  });

  window.RuinPerimeterFracturePlan = plan;
  root.dataset.fractureTopLeft = plan.topLeft ? 'on' : 'off';
  root.dataset.fractureUpperRight = plan.upperRight ? 'on' : 'off';
  root.dataset.fractureLowerRight = plan.lowerRight ? 'on' : 'off';

  // Remove any temporary debug residue if an older hot-reload left it behind.
  document.getElementById('ruin-right-fracture-debug-234')?.remove();
  document.getElementById('ruin-perimeter-fracture-presence-style')?.remove();

  const style = document.createElement('style');
  style.id = 'ruin-perimeter-fracture-random-style-v368';
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

  function rememberAttribute(node, attr, dataKey) {
    if (!node) return null;
    if (!(dataKey in node.dataset)) {
      node.dataset[dataKey] = node.getAttribute(attr) || '';
    }
    return node.dataset[dataKey];
  }

  function restoreAttribute(node, attr, dataKey) {
    if (!node) return;
    const original = rememberAttribute(node, attr, dataKey);
    if (original != null) node.setAttribute(attr, original);
  }

  function pathEndpoints(path) {
    if (!path || typeof path.getTotalLength !== 'function') return null;
    try {
      const length = path.getTotalLength();
      if (!Number.isFinite(length) || length <= 0) return null;
      const a = path.getPointAtLength(0);
      const b = path.getPointAtLength(length);
      if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return null;
      return { a, b };
    } catch (_) {
      return null;
    }
  }

  function makeStraightPath(path) {
    if (!path) return;
    rememberAttribute(path, 'd', 'randomOriginalD');
    const ends = pathEndpoints(path);
    if (!ends) return;
    path.setAttribute(
      'd',
      `M ${ends.a.x.toFixed(2)} ${ends.a.y.toFixed(2)} L ${ends.b.x.toFixed(2)} ${ends.b.y.toFixed(2)}`
    );
  }

  function makeStraightPolyline(polyline) {
    if (!polyline) return;
    rememberAttribute(polyline, 'points', 'randomOriginalPoints');
    const points = polyline.points;
    if (!points || points.numberOfItems < 2) return;
    const a = points.getItem(0);
    const b = points.getItem(points.numberOfItems - 1);
    if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return;
    polyline.setAttribute(
      'points',
      `${a.x.toFixed(2)},${a.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)}`
    );
  }

  function findLowerNotchOutline(lowerReturn) {
    if (!lowerReturn) return null;
    let node = lowerReturn.previousElementSibling;
    for (let i = 0; node && i < 4; i += 1, node = node.previousElementSibling) {
      if (
        node.tagName?.toLowerCase() === 'polyline' &&
        node.classList?.contains('ruin-fracture-border')
      ) {
        return node;
      }
    }
    return null;
  }

  function syncTopLeft() {
    const svg = document.querySelector(GLOBAL_SVG);
    if (!svg) return;
    setVisible(svg, plan.topLeft);
  }

  function syncRightFractures() {
    const svg = document.querySelector(MAIN_SVG);
    if (!svg) return;

    // Remove the old temporary debug classes if they somehow survive a DOM reuse.
    svg.querySelectorAll('.ruin-debug-target-2, .ruin-debug-target-3, .ruin-debug-target-4')
      .forEach(node => node.classList.remove('ruin-debug-target-2', 'ruin-debug-target-3', 'ruin-debug-target-4'));

    // ② upper-right attached pit.
    // The authored path also carries the long right-hand frame edge.  Do not hide
    // the path.  When the pit is absent, collapse only its geometry into a clean
    // straight segment between the same two endpoints.
    const upperPit = svg.querySelector('.ruin-fracture-upper-attached-pit');
    const upperReturn = svg.querySelector('.ruin-fracture-upper-attached-return');
    if (upperPit) {
      if (plan.upperRight) {
        restoreAttribute(upperPit, 'd', 'randomOriginalD');
      } else {
        makeStraightPath(upperPit);
      }
      setVisible(upperPit, true);
    }
    setVisible(upperReturn, plan.upperRight);

    // ③ lower-right chipped notch.
    // Its outer broken contour is the polyline immediately before the named
    // return line.  Keep that border node present; when the notch is absent,
    // collapse it to the straight line joining its original first/last points.
    const lowerReturn = svg.querySelector('.ruin-fracture-lower-right-return');
    const lowerOutline = findLowerNotchOutline(lowerReturn);
    if (lowerOutline) {
      if (plan.lowerRight) {
        restoreAttribute(lowerOutline, 'points', 'randomOriginalPoints');
      } else {
        makeStraightPolyline(lowerOutline);
      }
      setVisible(lowerOutline, true);
    }
    setVisible(lowerReturn, plan.lowerRight);

    // ④ outward tree belongs to the lower-right notch and follows the same draw.
    svg.querySelectorAll(
      '.ruin-fracture-outward-stem, .ruin-fracture-outward-branch, .ruin-fracture-outward-branch-minor'
    ).forEach(node => setVisible(node, plan.lowerRight));
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

  // The canonical fracture system may rebuild its SVG on startup and resize.
  // Re-apply the same page-load plan to each fresh SVG. Attribute changes are not
  // observed, so this controller cannot recurse on itself.
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('resize', schedule, { passive: true });
})();
