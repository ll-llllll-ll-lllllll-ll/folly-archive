(() => {
  'use strict';

  const ROUTES = Object.freeze({
    '电台路焦土': {
      legacyMapId: 'radio-map-1',
      guideId: 'radio-note-1',
      work: 'decayed-tower-scorched-earth',
      point: 'tower-antenna-array',
      record: 'tower-mapping'
    },
    '瘟猪坝沉墟': {
      legacyMapId: 'plague-map-1',
      guideId: 'plague-note-1',
      work: 'sunken-ruin-heart-chamber',
      point: 'heart-artificial-lake',
      record: 'heart-mapping'
    }
  });

  const COPY = Object.freeze({
    zh: { more: '[更多记录]', guide: '作品导读' },
    en: { more: '[More records]', guide: 'Work guide' },
    ja: { more: '[さらに記録]', guide: '作品ガイド' }
  });

  function langKey() {
    const raw = String(window.currentLang || document.documentElement.dataset.lang || document.documentElement.lang || 'zh').toLowerCase();
    if (raw.startsWith('ja')) return 'ja';
    if (raw.startsWith('en')) return 'en';
    return 'zh';
  }

  function installStyle() {
    if (document.getElementById('archive-clarity-v395-style')) return;
    const style = document.createElement('style');
    style.id = 'archive-clarity-v395-style';
    style.textContent = `
      @media (min-width: 769px) and (min-height: 521px) {
        #archive-drawer.folly-reference-drawer {
          width: 440px !important;
          min-height: 520px !important;
          max-height: calc(100vh - 36px) !important;
        }
        #archive-drawer.folly-reference-drawer .drawer-inner {
          box-sizing: border-box !important;
          max-height: calc(100vh - 72px) !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
          padding: 28px 30px 30px !important;
          scrollbar-width: thin;
        }
        #archive-drawer.folly-reference-drawer .drawer-site-title {
          font-size: 18px !important;
          line-height: 1.35 !important;
          margin-bottom: 10px !important;
        }
        #archive-drawer.folly-reference-drawer .drawer-section.desc {
          margin-bottom: 22px !important;
        }
        #archive-drawer.folly-reference-drawer .drawer-description .desc-text {
          display: block !important;
          overflow: visible !important;
          -webkit-line-clamp: unset !important;
          white-space: pre-line !important;
          font-size: 13px !important;
          line-height: 1.78 !important;
          letter-spacing: .015em !important;
          text-align: justify;
        }
        #archive-drawer.folly-reference-drawer .desc-toggle-btn {
          display: none !important;
        }
        #archive-drawer.folly-reference-drawer .drawer-section.tree {
          margin-top: 16px !important;
        }
      }

      .folly-more-records-link {
        display: inline-block !important;
        width: max-content;
        margin: 8px 0 5px 18px;
        padding: 2px 0;
        color: var(--reader-text, #222) !important;
        text-decoration: none !important;
        font-family: "IBM Plex Mono", "IBM Plex Sans JP", monospace;
        font-size: 11px;
        letter-spacing: .04em;
        cursor: pointer;
        opacity: .72;
        transition: opacity .16s ease, transform .16s ease;
      }
      .folly-more-records-link:hover,
      .folly-more-records-link:focus-visible {
        opacity: 1;
        transform: translateX(2px);
        outline: none;
      }

      /* The whole closed stone body is a hit target, not only its labels. */
      #index-drawer:not(.open) #index-drawer-handle {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      #index-drawer:not(.open) #index-drawer-handle > .frosted-shape,
      #index-drawer:not(.open) #index-drawer-handle > .drawer-perspective-line,
      #index-drawer:not(.open) #index-drawer-svg-handle {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function mechanicsUrl(route) {
    const url = new URL('mechanics.html', location.href);
    url.searchParams.set('from', 'archive');
    url.searchParams.set('work', route.work);
    url.searchParams.set('point', route.point);
    url.searchParams.set('record', route.record);
    return url.href;
  }

  function replaceMappingWithMoreRecords(root, route) {
    if (!root || !route) return;
    const existing = root.querySelector('.folly-more-records-link');
    if (existing) {
      existing.textContent = COPY[langKey()].more;
      return;
    }

    const file = root.querySelector(`[onclick*="${route.legacyMapId}"]`);
    if (!file) return;

    const collapse = file.closest('.tree-collapse.archive-record-subcollapse') || file.parentElement;
    const folder = collapse?.previousElementSibling;

    const link = document.createElement('a');
    link.className = 'tree-file archive-record-file folly-more-records-link';
    link.href = mechanicsUrl(route);
    link.target = '_blank';
    link.rel = 'opener';
    link.textContent = COPY[langKey()].more;
    link.setAttribute('aria-label', link.textContent.replace(/[\[\]]/g, ''));

    if (folder?.parentNode) folder.parentNode.insertBefore(link, folder);
    else collapse?.parentNode?.insertBefore(link, collapse);

    folder?.remove();
    collapse?.remove();
  }

  function relabelWorkGuide(root, route) {
    if (!root || !route?.guideId) return;
    const file = root.querySelector(`[onclick*="${route.guideId}"]`);
    const collapse = file?.closest('.tree-collapse.archive-record-subcollapse') || file?.parentElement;
    const folder = collapse?.previousElementSibling;
    const label = folder?.querySelector('[data-i18n="ui_txt_files"]');
    if (label) {
      label.removeAttribute('data-i18n');
      label.dataset.follyGuideLabel = 'true';
      label.textContent = COPY[langKey()].guide;
    }
  }

  function keepDrawerInsideViewport(drawer) {
    if (!drawer || matchMedia('(max-width:768px), (max-width:950px) and (max-height:520px)').matches) return;
    const rect = drawer.getBoundingClientRect();
    const margin = 18;
    let left = rect.left;
    let top = rect.top;
    if (rect.right > innerWidth - margin) left -= rect.right - (innerWidth - margin);
    if (left < margin) left = margin;
    if (rect.bottom > innerHeight - margin) top -= rect.bottom - (innerHeight - margin);
    if (top < margin) top = margin;
    drawer.style.left = `${Math.round(left)}px`;
    drawer.style.top = `${Math.round(top)}px`;
  }

  function enhanceFollyDrawer(site) {
    const drawer = document.getElementById('archive-drawer');
    if (!drawer) return;

    const route = ROUTES[site?.name];
    drawer.classList.toggle('folly-reference-drawer', Boolean(route));
    if (!route) return;

    drawer.dataset.follySite = site.name;

    const desc = drawer.querySelector('.drawer-description .desc-text');
    if (desc) {
      desc.style.setProperty('display', 'block');
      desc.style.setProperty('-webkit-line-clamp', 'unset');
      desc.style.setProperty('overflow', 'visible');
    }
    const toggle = drawer.querySelector('.desc-toggle-btn');
    if (toggle) toggle.style.setProperty('display', 'none', 'important');

    replaceMappingWithMoreRecords(drawer, route);
    relabelWorkGuide(drawer, route);
    requestAnimationFrame(() => keepDrawerInsideViewport(drawer));
  }

  function patchOpenDrawer() {
    if (typeof window.openDrawer !== 'function' || window.openDrawer.__archiveClarityV395) return;
    const original = window.openDrawer;
    const patched = function(site, marker) {
      const result = original.apply(this, arguments);
      enhanceFollyDrawer(site);
      return result;
    };
    patched.__archiveClarityV395 = true;
    patched.__original = original;
    window.openDrawer = patched;
  }

  function refreshMoreRecordsCopy() {
    const copy = COPY[langKey()];
    document.querySelectorAll('.folly-more-records-link').forEach(link => {
      link.textContent = copy.more;
      link.setAttribute('aria-label', link.textContent.replace(/[\[\]]/g, ''));
    });
    document.querySelectorAll('[data-folly-guide-label="true"]').forEach(label => {
      label.textContent = copy.guide;
    });
  }

  function installStoneBodyHitTarget() {
    const drawer = document.getElementById('index-drawer');
    const handle = document.getElementById('index-drawer-handle');
    if (!drawer || !handle || handle.dataset.bodyHitTarget === 'true') return;
    handle.dataset.bodyHitTarget = 'true';
    handle.tabIndex = 0;
    handle.setAttribute('aria-label', 'Open Relic Archive index');

    const activate = event => {
      if (drawer.classList.contains('open')) return;
      if (event.target.closest('.bottom-trigger, #archive-add-link, .bottom-stele-lang-option, a, button, input, label')) return;
      event.preventDefault();
      event.stopPropagation();
      window.toggleIndexDrawerWithAnim?.();
    };

    handle.addEventListener('click', activate);
    handle.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      activate(event);
    });
  }

  function install() {
    installStyle();
    patchOpenDrawer();
    installStoneBodyHitTarget();
    document.addEventListener('languagechange-complete', refreshMoreRecordsCopy);
    document.addEventListener('ruinlanguagechange', refreshMoreRecordsCopy);
    new MutationObserver(refreshMoreRecordsCopy).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'data-lang']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
