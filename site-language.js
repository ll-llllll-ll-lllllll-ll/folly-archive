(() => {
  'use strict';

  const VALID = ['zh', 'en', 'ja'];
  const KEY = 'ruin-archive-language';

  function normalize(raw) {
    const value = String(raw || '').trim().toLowerCase();
    if (!value) return null;
    if (value.startsWith('zh')) return 'zh';
    if (value.startsWith('ja')) return 'ja';
    if (value.startsWith('en')) return 'en';
    return null;
  }

  function detect() {
    const candidates = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ''];

    for (const candidate of candidates) {
      const lang = normalize(candidate);
      if (lang) return lang;
    }

    return 'en';
  }

  function readSaved() {
    try {
      const saved = localStorage.getItem(KEY);
      return VALID.includes(saved) ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function initial() {
    const saved = readSaved();
    const detected = detect();
    const lang = saved || detected || 'en';
    return {
      lang,
      saved,
      detected,
      source: saved ? 'saved' : 'device',
      shouldStageFromEnglish: lang !== 'en'
    };
  }

  function read() {
    return initial().lang;
  }

  function save(lang) {
    const normalized = normalize(lang) || 'en';
    try { localStorage.setItem(KEY, normalized); } catch (_) {}
    return normalized;
  }

  function htmlLang(lang) {
    return lang === 'zh' ? 'zh-Hans' : lang === 'ja' ? 'ja' : 'en';
  }

  function applyDocument(lang) {
    const normalized = normalize(lang) || 'en';
    document.documentElement.lang = htmlLang(normalized);
    document.documentElement.dataset.lang = normalized;
    return normalized;
  }

  function installArchiveStartupBridge() {
    if (document.title !== 'Ruin Atlas · Relic Archive') return;

    const startup = initial();
    const target = startup.lang;
    const loadingCopy = {
      en: 'Loading map system',
      zh: '地图正在加载',
      ja: '地図を読み込み中'
    };

    window.__ruinStartupTarget = target;
    window.__ruinStartupLanguageSource = startup.source;
    document.documentElement.dataset.startupLang = target;

    const install = () => {
      // The archive intentionally cold-boots in English. For an English target,
      // suppress the redundant startup language pass; Chinese/Japanese keep the
      // authored first-switch effect behind the map veil.
      if (target === 'en' && typeof window.switchLanguage === 'function' && !window.switchLanguage.__ruinDeviceGuard) {
        const originalSwitch = window.switchLanguage;
        const guardedSwitch = function(lang, options) {
          const requested = normalize(lang) || 'en';
          const startupPhase = window.__ruinStartupPhase;
          const current = normalize(window.currentLang || document.documentElement.lang) || 'en';
          if (startupPhase === 'translation' && requested === 'en' && current === 'en') return;
          return originalSwitch.call(this, lang, options);
        };
        guardedSwitch.__ruinDeviceGuard = true;
        window.switchLanguage = guardedSwitch;
      }

      const status = document.getElementById('startup-map-status');
      if (!status) return;

      const desired = loadingCopy[target] || loadingCopy.en;
      if (target !== 'zh') {
        const syncStatus = () => {
          if (window.__ruinStartupPhase !== 'translation') return;
          const current = String(status.textContent || '').trim();
          if (target === 'en') {
            if (current !== desired) status.textContent = desired;
          } else if (current === loadingCopy.zh) {
            status.textContent = desired;
          }
        };
        const observer = new MutationObserver(syncStatus);
        observer.observe(status, {childList:true, characterData:true, subtree:true});
        syncStatus();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, {once:true});
    } else {
      install();
    }
  }

  function installArchiveIndexDrawerFit() {
    if (document.title !== 'Ruin Atlas · Relic Archive') return;

    const install = () => {
      const drawer = document.getElementById('index-drawer');
      const source = document.getElementById('index-fracture-source');
      if (!drawer || !source) return;

      let fitRaf = 0;

      const currentLang = () => normalize(
        document.documentElement.dataset.lang ||
        window.currentLang ||
        document.documentElement.lang ||
        source.dataset.inscriptionLang
      ) || 'en';

      const verticalCopy = () => source.querySelector('.index-stele-copy');
      const verticalLeads = () => source.querySelectorAll('.index-stele-lead');
      const verticalLinks = () => source.querySelectorAll('.index-stele-link');
      const englishBox = () => source.querySelector('.index-inscription-horizontal');

      function clearVerticalInline() {
        const copy = verticalCopy();
        if (copy) copy.style.removeProperty('font-size');
        verticalLeads().forEach(node => node.style.removeProperty('font-size'));
        verticalLinks().forEach(node => node.style.removeProperty('font-size'));
      }

      function clearEnglishInline() {
        const box = englishBox();
        if (box) {
          box.style.removeProperty('padding-left');
          box.style.removeProperty('padding-right');
        }
        source.querySelectorAll('.index-top-title, .index-three-columns, .index-conclusion, .index-manifesto-crossref')
          .forEach(node => node.style.removeProperty('font-size'));
      }

      function applyVerticalSize(value, lang) {
        const copy = verticalCopy();
        if (!copy) return;

        const leadDelta = lang === 'zh' ? 1.1 : 1.0;
        const linkSize = Math.max(10.4, value * 0.78);

        // Inline !important deliberately wins over the historical language rules
        // in style.css. The previous variable-only pass had lower specificity,
        // so the visible inscription could remain at the old 12px-ish size.
        copy.style.setProperty('font-size', `${value.toFixed(2)}px`, 'important');
        verticalLeads().forEach(node => {
          node.style.setProperty('font-size', `${(value + leadDelta).toFixed(2)}px`, 'important');
        });
        verticalLinks().forEach(node => {
          node.style.setProperty('font-size', `${linkSize.toFixed(2)}px`, 'important');
        });
      }

      function applyEnglishSize(value) {
        const box = englishBox();
        if (!box) return;

        box.style.setProperty('padding-left', 'clamp(34px, 4.5vw, 76px)', 'important');
        box.style.setProperty('padding-right', 'clamp(34px, 4.5vw, 76px)', 'important');

        source.querySelectorAll('.index-top-title').forEach(node => {
          node.style.setProperty('font-size', `${(value + 0.35).toFixed(2)}px`, 'important');
        });
        source.querySelectorAll('.index-three-columns').forEach(node => {
          node.style.setProperty('font-size', `${value.toFixed(2)}px`, 'important');
        });
        source.querySelectorAll('.index-conclusion, .index-manifesto-crossref').forEach(node => {
          node.style.setProperty('font-size', `${Math.max(10, value - 0.1).toFixed(2)}px`, 'important');
        });
      }

      function verticalInkBounds(copy) {
        const copyRect = copy.getBoundingClientRect();
        const nodes = copy.querySelectorAll('.index-stele-segment, .index-stele-link');
        let minLeft = Infinity;
        let minTop = Infinity;
        let maxRight = -Infinity;
        let maxBottom = -Infinity;
        let found = false;

        nodes.forEach(node => {
          Array.from(node.getClientRects()).forEach(rect => {
            if (rect.width <= 0 || rect.height <= 0) return;
            found = true;
            minLeft = Math.min(minLeft, rect.left);
            minTop = Math.min(minTop, rect.top);
            maxRight = Math.max(maxRight, rect.right);
            maxBottom = Math.max(maxBottom, rect.bottom);
          });
        });

        if (!found) return null;
        return {
          copyRect,
          minLeft,
          minTop,
          maxRight,
          maxBottom,
          width: maxRight - minLeft,
          height: maxBottom - minTop
        };
      }

      function findLargest(min, max, apply, fits) {
        let low = min;
        let high = max;
        let best = min;

        apply(min);
        void source.offsetWidth;
        if (!fits()) return min;

        for (let i = 0; i < 15; i += 1) {
          const mid = (low + high) / 2;
          apply(mid);
          void source.offsetWidth;
          if (fits()) {
            best = mid;
            low = mid;
          } else {
            high = mid;
          }
        }

        return Math.floor(best * 10) / 10;
      }

      function fitVertical(lang) {
        clearEnglishInline();
        const copy = verticalCopy();
        if (!copy || copy.clientHeight < 20 || copy.clientWidth < 20) return;

        const min = lang === 'zh' ? 12.4 : 11.9;
        const hardMax = lang === 'zh' ? 20.5 : 18.5;
        const heightCap = copy.clientHeight / (lang === 'zh' ? 22 : 24);
        const max = Math.max(min, Math.min(hardMax, heightCap));

        const fits = () => {
          const ink = verticalInkBounds(copy);
          if (!ink) return false;
          const box = ink.copyRect;
          const horizontalTarget = box.width * 0.97;
          return (
            ink.width <= horizontalTarget + 1 &&
            ink.minLeft >= box.left - 1 &&
            ink.maxRight <= box.right + 1 &&
            ink.minTop >= box.top - 2 &&
            ink.maxBottom <= box.bottom + 2
          );
        };

        const best = findLargest(
          min,
          max,
          value => applyVerticalSize(value, lang),
          fits
        );
        applyVerticalSize(best, lang);
      }

      function fitEnglish() {
        clearVerticalInline();
        const box = englishBox();
        if (!box || box.clientHeight < 20 || box.clientWidth < 20) return;

        const min = 12.7;
        const max = 15.0;
        const best = findLargest(
          min,
          max,
          applyEnglishSize,
          () => box.scrollHeight <= box.clientHeight + 1 && box.scrollWidth <= box.clientWidth + 1
        );
        applyEnglishSize(best);
      }

      function fit() {
        fitRaf = 0;
        const desktop = window.matchMedia('(min-width:769px) and (min-height:521px)').matches;

        if (!desktop) {
          source.dataset.adaptiveType = 'false';
          clearVerticalInline();
          clearEnglishInline();
          return;
        }

        source.dataset.adaptiveType = 'true';
        const lang = currentLang();

        if (lang === 'en') {
          fitEnglish();
          return;
        }

        fitVertical(lang);
      }

      function scheduleFit() {
        if (fitRaf) return;
        fitRaf = requestAnimationFrame(fit);
      }

      window.addEventListener('resize', scheduleFit, {passive:true});
      if (document.fonts?.ready) document.fonts.ready.then(scheduleFit).catch(() => {});

      const htmlObserver = new MutationObserver(scheduleFit);
      htmlObserver.observe(document.documentElement, {
        attributes:true,
        attributeFilter:['lang','data-lang']
      });

      const sourceObserver = new MutationObserver(scheduleFit);
      sourceObserver.observe(source, {
        subtree:true,
        childList:true,
        characterData:true,
        attributes:true,
        attributeFilter:['data-inscription-lang','data-inscription-mode']
      });

      const drawerObserver = new MutationObserver(scheduleFit);
      drawerObserver.observe(drawer, {attributes:true, attributeFilter:['class']});

      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(scheduleFit);
        resizeObserver.observe(source);
      }

      source.dataset.adaptiveType = 'true';
      scheduleFit();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', install, {once:true});
    } else {
      install();
    }
  }

  window.RuinSiteLanguage = Object.freeze({
    VALID,
    KEY,
    normalize,
    detect,
    readSaved,
    initial,
    read,
    save,
    htmlLang,
    applyDocument
  });

  installArchiveStartupBridge();
  installArchiveIndexDrawerFit();
})();
