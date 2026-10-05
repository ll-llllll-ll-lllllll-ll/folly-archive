(() => {
  'use strict';

  const BUILD = '20261006-01';
  const root = document.documentElement;

  // Fresh production entry: load the unchanged canonical core first, then apply
  // the small perimeter-fracture presence controller below. A new filename is
  // used intentionally so old GitHub Pages / browser copies of the temporary
  // red-debug script cannot be reused.
  document.write('<script src="script-core.js?v=369-right-fracture-production"><\/script>');

  const GLOBAL_SVG = '#ruin-fracture-global-layer > svg.ruin-fracture-overlay.ruin-fracture-global';
  const MAIN_SVG = '#main-viewport-frame > svg.ruin-fracture-overlay.ruin-fracture-main-frame';

  root.dataset.siteRuntimeBuild = BUILD;

  // One stable draw per page load.
  // upper-left group: 58%
  // ② upper-right attached pit: 50%
  // ③+④ lower-right chipped notch + outward tree: 58%
  const plan = Object.freeze({
    topLeft: Math.random() < 0.58,
    upperRight: Math.random() < 0.50,
    lowerRight: Math.random() < 0.58
  });

  window.RuinPerimeterFracturePlan = plan;
  root.dataset.fractureTopLeft = plan.topLeft ? 'on' : 'off';
  root.dataset.fractureUpperRight = plan.upperRight ? 'on' : 'off';
  root.dataset.fractureLowerRight = plan.lowerRight ? 'on' : 'off';

  function purgeDebugArtifacts(scope = document) {
    // Remove every temporary identification stylesheet from earlier passes,
    // without carrying their old selectors or colours into production code.
    document.querySelectorAll('style[id*="debug"], style[id="ruin-perimeter-fracture-presence-style"]')
      .forEach(node => node.remove());

    scope.querySelectorAll?.('[class*="ruin-debug-target-"], .ruin-random-upper-right-group, .ruin-random-lower-right-group')
      .forEach(node => {
        [...node.classList].forEach(name => {
          if (name.startsWith('ruin-debug-target-') || name.startsWith('ruin-random-')) {
            node.classList.remove(name);
          }
        });
        node.style.removeProperty('stroke');
        node.style.removeProperty('stroke-width');
        node.style.removeProperty('stroke-opacity');
      });
  }

  purgeDebugArtifacts();

  const style = document.createElement('style');
  style.id = 'ruin-perimeter-fracture-random-style-production';
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

    purgeDebugArtifacts(svg);

    // ② upper-right attached pit.
    // This authored path also carries the long right-hand frame edge. Never
    // remove the path. If this fracture is absent, collapse only the broken
    // geometry to the straight line between the exact original endpoints.
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
    // Its broken outline is the authored border polyline directly before the
    // named return line. Keep that border node in the SVG and straighten its
    // own first/last points when the notch is absent.
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

    // ④ outward tree belongs to ③ and follows the same page-load draw.
    svg.querySelectorAll(
      '.ruin-fracture-outward-stem, .ruin-fracture-outward-branch, .ruin-fracture-outward-branch-minor'
    ).forEach(node => setVisible(node, plan.lowerRight));
  }

  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      purgeDebugArtifacts();
      syncTopLeft();
      syncRightFractures();
    });
  }

  // The canonical fracture renderer can rebuild its SVG on startup / resize.
  // Re-apply the same page-load plan to each fresh SVG. We observe structure
  // only, so our attribute changes cannot recurse into the observer.
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('resize', schedule, { passive: true });
})();
