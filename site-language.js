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
})();
