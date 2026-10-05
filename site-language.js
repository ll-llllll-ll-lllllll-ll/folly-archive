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
        observer.observe(status, {childList:true, characterData:true,subtree:true});
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

      if (!document.getElementById('index-drawer-adaptive-type-style')) {
        const style = document.createElement('style');
        style.id = 'index-drawer-adaptive-type-style';
        style.textContent = `
          @media (min-width:769px) and (min-height:521px) {
            #index-fracture-source[data-adaptive-type="true"] .index-stele-copy {
              font-size:var(--index-fit-font,12.4px)!important;
            }
            #index-fracture-source[data-adaptive-type="true"] .index-stele-lead {
              font-size:var(--index-fit-lead,13.5px)!important;
            }
            html[lang="en"] #index-fracture-source[data-adaptive-type="true"] .index-inscription-horizontal {
              box-sizing:border-box!important;
              padding-left:clamp(34px,4.5vw,76px)!important;
              padding-right:clamp(34px,4.5vw,76px)!important;
            }
            html[lang="en"] #index-fracture-source[data-adaptive-type="true"] .index-top-title {
              font-size:calc(var(--index-en-fit-font,12.7px) + .35px)!important;
            }
            html[lang="en"] #index-fracture-source[data-adaptive-type="true"] .index-three-columns {
              font-size:var(--index-en-fit-font,12.7px)!important;
            }
            html[lang="en"] #index-fracture-source[data-adaptive-type="true"] .index-conclusion,
            html[lang="en"] #index-fracture-source[data-adaptive-type="true"] .index-manifesto-crossref {
              font-size:calc(var(--index-en-fit-font,12.7px) - .1px)!important;
            }
          }
        `;
        document.head.appendChild(style);
      }

      let fitRaf = 0;

      const currentLang = () => normalize(
        document.documentElement.dataset.lang ||
        window.currentLang ||
        document.documentElement.lang ||
        source.dataset.inscriptionLang
      ) || 'en';

      const applyVerticalSize = (value, lang) => {
        const leadDelta = lang === 'zh' ? 1.1 : 1.0;
        source.style.setProperty('--index-fit-font', `${value.toFixed(2)}px`);
        source.style.setProperty('--index-fit-lead', `${(value + leadDelta).toFixed(2)}px`);
      };

      const applyEnglishSize = value => {
        source.style.setProperty('--index-en-fit-font', `${value.toFixed(2)}px`);
      };

      function findLargest(min, max, apply, fits) {
        let low = min;
        let high = max;
        let best = min;

        apply(min);
        void source.offsetWidth;
        if (!fits()) return min;

        for (let i = 0; i < 13; i += 1) {
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

      function fit() {
        fitRaf = 0;
        const desktop = window.matchMedia('(min-width:769px) and (min-height:521px)').matches;
        if (!desktop) {
          source.dataset.adaptiveType = 'false';
          source.style.removeProperty('--index-fit-font');
          source.style.removeProperty('--index-fit-lead');
          source.style.removeProperty('--index-en-fit-font');
          return;
        }

        source.dataset.adaptiveType = 'true';
        const lang = currentLang();

        if (lang === 'en') {
          const box = source.querySelector('.index-inscription-horizontal');
          if (!box || box.clientHeight < 20 || box.clientWidth < 20) return;

          const best = findLargest(
            12.7,
            13.7,
            applyEnglishSize,
            () => box.scrollHeight <= box.clientHeight + 1 && box.scrollWidth <= box.clientWidth + 1
          );
          applyEnglishSize(best);
          return;
        }

        const copy = source.querySelector('.index-stele-copy');
        if (!copy || copy.clientHeight < 20 || copy.clientWidth < 20) return;

        const min = lang === 'zh' ? 12.4 : 11.9;
        const max = lang === 'zh' ? 15.4 : 13.9;
        const best = findLargest(
          min,
          max,
          value => applyVerticalSize(value, lang),
          () => copy.scrollWidth <= copy.clientWidth + 1 && copy.scrollHeight <= copy.clientHeight + 1
        );
        applyVerticalSize(best, lang);
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
