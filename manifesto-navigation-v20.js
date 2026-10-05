(() => {
  'use strict';

  const scroller = document.getElementById('manifesto-scroll');
  const documentEl = document.getElementById('manifesto-document');
  const indexNav = document.getElementById('manifesto-index-nav');
  const indexToggle = document.getElementById('manifesto-index-toggle');
  if (!scroller || !documentEl || !indexNav) return;

  const READING_OFFSET = 24;
  let activeRaf = 0;
  let hashTimer = 0;

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

  function correctLanding(target, offset = READING_OFFSET) {
    if (!target?.isConnected) return;
    const desired = scrollTopFor(target, offset);
    if (Math.abs(desired - scroller.scrollTop) > 2) {
      scroller.scrollTo({top: desired, behavior: 'auto'});
    }
  }

  function navigateTo(target, behavior = 'smooth') {
    if (!target) return;
    scroller.scrollTo({top: scrollTopFor(target), behavior});

    /* Lazy images/fonts can still alter geometry while a smooth scroll is in
       progress. Re-resolve once the motion settles instead of trusting a stale
       pixel offset captured at click time. */
    clearTimeout(hashTimer);
    if ('onscrollend' in scroller) {
      scroller.addEventListener('scrollend', () => correctLanding(target), {once: true});
    } else {
      hashTimer = window.setTimeout(() => correctLanding(target), 520);
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
    navigateTo(target, 'smooth');
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
    activeLink?.scrollIntoView({block: 'nearest'});
  }

  function scheduleActiveIndex() {
    if (!activeRaf) activeRaf = requestAnimationFrame(updateActiveIndex);
  }

  scroller.addEventListener('scroll', scheduleActiveIndex, {passive: true});
  window.addEventListener('resize', scheduleActiveIndex, {passive: true});

  /* Re-run after language changes / async manuscript rendering. */
  const observer = new MutationObserver(() => {
    scheduleActiveIndex();
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) requestAnimationFrame(() => correctLanding(target));
  });
  observer.observe(documentEl, {childList: true, subtree: true});
  observer.observe(indexNav, {childList: true, subtree: true});

  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) navigateTo(target, 'smooth');
  });

  scheduleActiveIndex();
})();
