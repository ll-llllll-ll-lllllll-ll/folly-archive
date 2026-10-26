(() => {
  'use strict';

  const scroller = document.getElementById('manifesto-scroll');
  const documentEl = document.getElementById('manifesto-document');
  const indexNav = document.getElementById('manifesto-index-nav');
  const indexToggle = document.getElementById('manifesto-index-toggle');
  if (!scroller || !documentEl || !indexNav) return;

  const READING_OFFSET = 24;
  const indexEl = document.getElementById('manifesto-index');
  let activeRaf = 0;
  const mobile = () => window.matchMedia('(max-width: 900px)').matches;

  /*
   * manifesto-document is no longer the first child of manifesto-scroll: the
   * introduction panel sits before it. offsetTop on a section is therefore in
   * the article's own coordinate system and omits the introduction height.
   * Always resolve positions through viewport rectangles so the target and the
   * scroll container share one coordinate system.
   */
  function absoluteTopInScroller(target) {
    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return scroller.scrollTop + targetRect.top - scrollerRect.top;
  }

  function scrollTopFor(target, offset = READING_OFFSET) {
    return Math.max(0, absoluteTopInScroller(target) - offset);
  }

  /*
   * iOS Safari can hold a nested, fixed-position overflow scroller in a long
   * programmatic smooth-scroll animation after jumping thousands of pixels.
   * A later scrollend "correction" then snaps the reader back when the user
   * tries to swipe. For mobile navigation, land immediately and release all
   * subsequent movement to native touch scrolling.
   */
  function navigateTo(target) {
    if (!target?.isConnected) return;
    const destination = scrollTopFor(target);
    if (mobile() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scroller.scrollTop = destination;
    } else {
      scroller.scrollTo({top: destination, behavior: 'smooth'});
    }
    scheduleActiveIndex();
  }

  /*
   * Never call link.scrollIntoView() on a closed/off-canvas mobile index.
   * That API can scroll ancestors outside the index itself and interfere with
   * the reader's own touch scroll. Move only the index's scrollTop, and only
   * while its panel is actually visible.
   */
  function revealActiveIndexLink(link) {
    if (!indexEl || !link) return;
    if (mobile() && !document.body.classList.contains('manifesto-index-open')) return;
    const panel = indexEl.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.top < panel.top + 12) {
      indexEl.scrollTop -= panel.top + 12 - item.top;
    } else if (item.bottom > panel.bottom - 12) {
      indexEl.scrollTop += item.bottom - (panel.bottom - 12);
    }
  }

  function closeMobileIndex() {
    document.body.classList.remove('manifesto-index-open');
    indexToggle?.setAttribute('aria-expanded', 'false');
  }

  /* Capture the contents click before manifesto.js's older offsetTop-based
     handler. This fixes both top-level chapters and nested subsection links. */
  indexNav.addEventListener('click', event => {
    const link = event.target.closest('[data-section-link]');
    if (!link || !indexNav.contains(link)) return;

    const targetId = link.dataset.sectionLink;
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    navigateTo(target);
    history.replaceState(null, '', `#${targetId}`);
    closeMobileIndex();
  }, true);

  function updateActiveIndex() {
    activeRaf = 0;
    const targets = [...documentEl.querySelectorAll('[data-manifesto-section],[data-manifesto-subsection]')];
    const links = [...indexNav.querySelectorAll('[data-section-link]')];
    if (!targets.length || !links.length) return;

    const probe = scroller.scrollTop + Math.min(scroller.clientHeight * .28, 220);
    let active = targets[0].id;
    for (const target of targets) {
      if (absoluteTopInScroller(target) <= probe) active = target.id;
      else break;
    }

    links.forEach(link => link.classList.toggle('active', link.dataset.sectionLink === active));
    const activeLink = links.find(link => link.dataset.sectionLink === active);
    revealActiveIndexLink(activeLink);
  }

  function scheduleActiveIndex() {
    if (!activeRaf) activeRaf = requestAnimationFrame(updateActiveIndex);
  }

  scroller.addEventListener('scroll', scheduleActiveIndex, {passive: true});
  window.addEventListener('resize', scheduleActiveIndex, {passive: true});

  /*
   * Text/footnote expansions can mutate documentEl during a reading gesture.
   * Updating the index is harmless; re-applying the location hash on every
   * mutation is not. Deep links are positioned once by manifesto.js on render.
   */
  const observer = new MutationObserver(scheduleActiveIndex);
  observer.observe(documentEl, {childList: true});
  observer.observe(indexNav, {childList: true, subtree: true});

  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) navigateTo(target, 'smooth');
  });

  scheduleActiveIndex();
})();
