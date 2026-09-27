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

  function read() {
    return readSaved() || detect();
  }

  function save(lang) {
    const normalized = normalize(lang) || 'en';
    try { localStorage.setItem(KEY, normalized); } catch (_) {}
    return normalized;
  }

  function htmlLang(lang) {
    return lang === 'zh' ? 'zh-Hans' : lang === 'ja' ? 'ja' : 'en';
  }

  window.RuinSiteLanguage = Object.freeze({
    VALID,
    KEY,
    normalize,
    detect,
    readSaved,
    read,
    save,
    htmlLang
  });
})();
