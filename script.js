(() => {
  'use strict';

  // Canonical production core. The perimeter-fracture presence controller below
  // stays in this entry file so the main page needs only two production scripts.
  document.write('<script src="script-core.js?v=366-wide-txt-reader"><\/script>');

  if (document.title !== 'Ruin Atlas · Relic Archive') return;

  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const GLOBAL_SVG = '#ruin-fracture-global-layer > svg.ruin-fracture-overlay.ruin-fracture-global';
  const MAIN_SVG = '#main-viewport-frame > svg.ruin-fracture-overlay.ruin-fracture-main-frame';

  // One stable plan per page load. Each authored fracture + chip combination
  // rolls independently, so refreshes can show any subset of the three.
  const plan = Object.freeze({
    topLeft: Math.random() < 0.58,
    upperRight: Math.random() < 0.50,
    lowerRight: Math.random() < 0.58
  });

  window.RuinPerimeterFracturePlan = plan;
  root.dataset.fractureTopLeft = plan.topLeft ? 'on' : 'off';
  root.dataset.fractureUpperRight = plan.upperRight ? 'on' : 'off';
  root.dataset.fractureLowerRight = plan.lowerRight ? 'on' : 'off';

  const style = document.createElement('style');
  style.id = 'ruin-perimeter-fracture-presence-style';
  style.textContent = `
    html[data-fracture-top-left="off"] #ruin-fracture-global-layer {
      display: none !important;
    }
    html[data-fracture-top-left="off"] body.ruin-fracture-active > .perspective-line line {
      stroke: var(--reader-line-strong, rgba(0,0,0,.42)) !important;
    }

    html[data-fracture-upper-right="off"] ${MAIN_SVG} .ruin-random-upper-right-group,
    html[data-fracture-lower-right="off"] ${MAIN_SVG} .ruin-random-lower-right-group {
      display: none !important;
      visibility: hidden !important;
    }

    @media (max-width: 768px),
           (max-width: 950px) and (max-height: 520px) {
      html[data-fracture-top-left="on"] #ruin-fracture-global-layer,
      html[data-fracture-top-left="on"] ${GLOBAL_SVG} {
        display: block !important;
        visibility: visible !important;
      }
      html[data-fracture-top-left="on"] body.ruin-fracture-active > .perspective-line line {
        stroke: transparent !important;
      }

      html[data-fracture-upper-right="on"] ${MAIN_SVG},
      html[data-fracture-lower-right="on"] ${MAIN_SVG} {
        display: block !important;
        visibility: visible !important;
      }
      html[data-fracture-upper-right="on"] #main-viewport-frame.fracture-active,
      html[data-fracture-lower-right="on"] #main-viewport-frame.fracture-active {
        border-color: transparent !important;
      }
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

  function pathMove(path) {
    if (!path) return null;
    const d = String(path.getAttribute('d') || '').trim();
    const match = d.match(/^M\s*(-?\d+(?:\.\d+)?)\s*[ ,]\s*(-?\d+(?:\.\d+)?)/i);
    if (!match) return null;
    return { x: Number(match[1]), y: Number(match[2]) };
  }

  function removeRepairs(svg) {
    svg?.querySelectorAll('[data-random-fracture-repair]').forEach(node => node.remove());
  }

  function addRepair(svg, key, a, b, opacity = 0.86) {
    if (!svg || !a || !b) return;
    const line = document.createElementNS(NS, 'line');
    line.dataset.randomFractureRepair = key;
    line.setAttribute('x1', a.x.toFixed(2));
    line.setAttribute('y1', a.y.toFixed(2));
    line.setAttribute('x2', b.x.toFixed(2));
    line.setAttribute('y2', b.y.toFixed(2));
    line.setAttribute('class', 'ruin-fracture-border ruin-random-fracture-repair');
    line.setAttribute('opacity', String(opacity));
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(line);
  }

  function processGlobal() {
    const svg = document.querySelector(GLOBAL_SVG);
    if (!svg) return;
    setVisible(svg, plan.topLeft);
  }

  function mark(node, groupClass) {
    if (!node || node.hasAttribute('data-random-fracture-repair')) return;
    node.classList.add(groupClass);
  }

  function safeBBox(node) {
    try {
      const box = node.getBBox();
      return Number.isFinite(box.x) ? box : null;
    } catch (_) {
      return null;
    }
  }

  function tagRightSideGroups(svg, width, height) {
    svg.querySelectorAll(
      '.ruin-fracture-upper-attached-pit, .ruin-fracture-upper-attached-return'
    ).forEach(node => mark(node, 'ruin-random-upper-right-group'));

    const lowerReturn = svg.querySelector('.ruin-fracture-lower-right-return');
    if (lowerReturn) {
      mark(lowerReturn, 'ruin-random-lower-right-group');

      const before = lowerReturn.previousElementSibling;
      const after = lowerReturn.nextElementSibling;
      if (before?.classList?.contains('ruin-fracture-border')) {
        mark(before, 'ruin-random-lower-right-group');
      }
      if (after?.classList?.contains('ruin-fracture-border')) {
        mark(after, 'ruin-random-lower-right-group');
      }
    }

    svg.querySelectorAll(
      '.ruin-fracture-outward-stem, .ruin-fracture-outward-branch, .ruin-fracture-outward-branch-minor'
    ).forEach(node => mark(node, 'ruin-random-lower-right-group'));

    // Safety net: catch any old generic path that belongs to a right-edge fracture.
    const splitY = height * 0.43;
    svg.querySelectorAll('path, polyline').forEach(node => {
      if (node.hasAttribute('data-random-fracture-repair')) return;
      if (node.classList.contains('ruin-random-upper-right-group') ||
          node.classList.contains('ruin-random-lower-right-group')) return;

      const box = safeBBox(node);
      if (!box) return;
      const maxX = box.x + box.width;
      const touchesRightEdge = maxX >= width - 1.5;
      if (!touchesRightEdge) return;

      const centerY = box.y + box.height * 0.5;
      if (centerY < height * 0.30) {
        mark(node, 'ruin-random-upper-right-group');
      } else if (centerY > splitY) {
        mark(node, 'ruin-random-lower-right-group');
      }
    });

    return lowerReturn;
  }

  function processMainFrame() {
    // The legacy renderer creates this as a CLASS, not an id. Earlier versions
    // queried getElementById('ruin-fracture-main-frame'), so this function never ran.
    const svg = document.querySelector(MAIN_SVG);
    if (!svg) return;

    removeRepairs(svg);

    const vb = svg.viewBox?.baseVal;
    const width = vb?.width || svg.getBoundingClientRect().width || 0;
    const height = vb?.height || svg.getBoundingClientRect().height || 0;
    if (!width || !height) return;

    const topRight = { x: width - 0.5, y: 0.5 };
    const bottomRight = { x: width - 0.5, y: height + 2.5 };

    const lowerReturn = tagRightSideGroups(svg, width, height);
    const lowerTop = pathMove(lowerReturn);

    svg.querySelectorAll('.ruin-random-upper-right-group')
      .forEach(node => setVisible(node, plan.upperRight));
    svg.querySelectorAll('.ruin-random-lower-right-group')
      .forEach(node => setVisible(node, plan.lowerRight));

    if (!plan.upperRight && !plan.lowerRight) {
      addRepair(svg, 'right-edge-full', topRight, bottomRight, 0.86);
      return;
    }
    if (!plan.upperRight && plan.lowerRight) {
      if (lowerTop) addRepair(svg, 'right-edge-upper', topRight, lowerTop, 0.86);
      return;
    }
    if (plan.upperRight && !plan.lowerRight) {
      if (lowerTop) addRepair(svg, 'right-edge-lower', lowerTop, bottomRight, 0.86);
    }
  }

  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      processGlobal();
      processMainFrame();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('resize', schedule, { passive: true });
})();
