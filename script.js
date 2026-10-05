(() => {
  'use strict';

  // Canonical production core. The perimeter-fracture presence controller below
  // stays in this entry file so the main page needs only two production scripts.
  document.write('<script src="script-core.js?v=366-wide-txt-reader"><\/script>');

  if (document.title !== 'Ruin Atlas · Relic Archive') return;

  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;

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
    /* Desktop/default: if the upper-left authored group is absent, restore the
       original straight perspective line instead of leaving a hole. */
    html[data-fracture-top-left="off"] #ruin-fracture-global-layer {
      display: none !important;
    }
    html[data-fracture-top-left="off"] body.ruin-fracture-active > .perspective-line line {
      stroke: var(--reader-line-strong, rgba(0,0,0,.42)) !important;
    }

    /* Legacy CSS used to switch every generated fracture overlay off on compact
       viewports. That made the three new random presence flags impossible to see
       on mobile, even though the SVG geometry was still being generated. Re-open
       only the two production frame overlays involved in this randomizer; all
       archive/compass/index-drawer fracture overlays keep their old mobile rules. */
    @media (max-width: 768px),
           (max-width: 950px) and (max-height: 520px) {
      html[data-fracture-top-left="on"] #ruin-fracture-global-layer,
      html[data-fracture-top-left="on"] #ruin-fracture-global-layer > .ruin-fracture-overlay {
        display: block !important;
        visibility: visible !important;
      }
      html[data-fracture-top-left="on"] body.ruin-fracture-active > .perspective-line line {
        stroke: transparent !important;
      }

      html[data-fracture-upper-right="on"] #main-viewport-frame > .ruin-fracture-overlay,
      html[data-fracture-lower-right="on"] #main-viewport-frame > .ruin-fracture-overlay {
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
    const svg = document.getElementById('ruin-fracture-global');
    if (!svg) return;
    setVisible(svg, plan.topLeft);
  }

  function processMainFrame() {
    const svg = document.getElementById('ruin-fracture-main-frame');
    if (!svg) return;

    removeRepairs(svg);

    const vb = svg.viewBox?.baseVal;
    const width = vb?.width || svg.getBoundingClientRect().width || 0;
    const height = vb?.height || svg.getBoundingClientRect().height || 0;
    if (!width || !height) return;

    const topRight = { x: width - 0.5, y: 0.5 };
    const bottomRight = { x: width - 0.5, y: height + 2.5 };

    const upperOuter = svg.querySelector('.ruin-fracture-upper-attached-pit');
    const upperReturn = svg.querySelector('.ruin-fracture-upper-attached-return');
    const lowerReturn = svg.querySelector('.ruin-fracture-lower-right-return');

    const lowerOuterCandidate = lowerReturn?.previousElementSibling || null;
    const lowerOuter = lowerOuterCandidate?.classList?.contains('ruin-fracture-border')
      ? lowerOuterCandidate
      : null;
    const lowerTailCandidate = lowerReturn?.nextElementSibling || null;
    const lowerTail = lowerTailCandidate?.classList?.contains('ruin-fracture-border')
      ? lowerTailCandidate
      : null;

    const lowerTop = pathMove(lowerReturn);

    setVisible(upperOuter, plan.upperRight);
    setVisible(upperReturn, plan.upperRight);

    setVisible(lowerOuter, plan.lowerRight);
    setVisible(lowerReturn, plan.lowerRight);
    setVisible(lowerTail, plan.lowerRight);
    svg.querySelectorAll(
      '.ruin-fracture-outward-stem, .ruin-fracture-outward-branch, .ruin-fracture-outward-branch-minor'
    ).forEach(node => setVisible(node, plan.lowerRight));

    // Replace omitted broken spans with the original straight edge so absence
    // reads as an intact frame, not as a missing drawing.
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

  // The legacy fracture renderer can rebuild its SVGs on startup and resize.
  // Re-apply only when nodes are inserted/removed; we deliberately do not watch
  // attribute changes, so our own visibility edits cannot create an observer loop.
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('resize', schedule, { passive: true });
})();
