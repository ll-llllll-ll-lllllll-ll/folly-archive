(() => {
  'use strict';

  // Load the canonical production core first.  The query value is bumped for
  // this visual verification pass so browsers do not reuse an older core file.
  document.write('<script src="script-core.js?v=367-debug-right-234"><\/script>');

  const root = document.documentElement;
  const GLOBAL_SVG = '#ruin-fracture-global-layer > svg.ruin-fracture-overlay.ruin-fracture-global';
  const MAIN_SVG = '#main-viewport-frame > svg.ruin-fracture-overlay.ruin-fracture-main-frame';

  // Keep the already-working upper-left refresh randomisation while the two
  // right-hand targets are being identified visually.
  const topLeftVisible = Math.random() < 0.58;
  root.dataset.fractureTopLeft = topLeftVisible ? 'on' : 'off';

  const style = document.createElement('style');
  style.id = 'ruin-right-fracture-debug-234';
  style.textContent = `
    html[data-fracture-top-left="off"] #ruin-fracture-global-layer {
      display: none !important;
    }
    html[data-fracture-top-left="off"] body.ruin-fracture-active > .perspective-line line {
      stroke: var(--reader-line-strong, rgba(0,0,0,.42)) !important;
    }

    /* TEMP DEBUG
       ② upper-right attached pit
       ③ lower-right chipped notch
       ④ tree fracture growing outward from ③
       These are deliberately forced visible and bright red for identification. */
    ${MAIN_SVG} .ruin-debug-target-2,
    ${MAIN_SVG} .ruin-debug-target-3,
    ${MAIN_SVG} .ruin-debug-target-4 {
      display: inline !important;
      visibility: visible !important;
      stroke: #ff0000 !important;
      stroke-width: 2.35px !important;
      stroke-opacity: 1 !important;
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);

  function forceVisible(node) {
    if (!node) return;
    node.style.removeProperty('display');
    node.style.removeProperty('visibility');
  }

  function addDebugClass(node, className) {
    if (!node) return;
    node.classList.add(className);
    forceVisible(node);
  }

  function paintTarget234() {
    const svg = document.querySelector(MAIN_SVG);
    if (!svg) return;

    // ② The authored upper-right inner-frame pit and its close return/seam.
    svg.querySelectorAll(
      '.ruin-fracture-upper-attached-pit, .ruin-fracture-upper-attached-return'
    ).forEach(node => addDebugClass(node, 'ruin-debug-target-2'));

    // ③ The lower-right notch has a named return line, but its actual broken
    // outline is historically just a generic `ruin-fracture-border
    // ruin-fracture-damaged` path.  In the canonical renderer that outline is
    // inserted immediately before the named return line, so tag both explicitly.
    const lowerReturn = svg.querySelector('.ruin-fracture-lower-right-return');
    if (lowerReturn) {
      addDebugClass(lowerReturn, 'ruin-debug-target-3');
      const notchOutline = lowerReturn.previousElementSibling;
      if (notchOutline?.classList?.contains('ruin-fracture-border')) {
        addDebugClass(notchOutline, 'ruin-debug-target-3');
      }
    }

    // ④ Every stem / branch authored from the lower-right notch root.
    svg.querySelectorAll(
      '.ruin-fracture-outward-stem, .ruin-fracture-outward-branch, .ruin-fracture-outward-branch-minor'
    ).forEach(node => addDebugClass(node, 'ruin-debug-target-4'));
  }

  function syncTopLeft() {
    const svg = document.querySelector(GLOBAL_SVG);
    if (!svg) return;
    if (topLeftVisible) {
      svg.style.removeProperty('display');
      svg.style.removeProperty('visibility');
    } else {
      svg.style.setProperty('display', 'none', 'important');
      svg.style.setProperty('visibility', 'hidden', 'important');
    }
  }

  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      syncTopLeft();
      paintTarget234();
    });
  }

  // The canonical fracture system can rebuild its SVG after startup/resize.
  // Watch only structural replacement; our class additions do not retrigger it.
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener('resize', schedule, { passive: true });
})();
