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

  function installArchiveReferenceViewport() {
    if (document.title !== 'Ruin Atlas · Relic Archive') return;

    const REFERENCE_WIDTH = 1440;
    const REFERENCE_HEIGHT = 828;
    const MIN_SCALE = 0.70;
    const MAX_SCALE = 1.70;
    let resizeRaf = 0;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function isDesktop() {
      return window.matchMedia('(min-width:769px) and (min-height:521px)').matches;
    }

    function viewportSize() {
      const root = document.documentElement;
      return {
        width: root.clientWidth || window.innerWidth || REFERENCE_WIDTH,
        height: root.clientHeight || window.innerHeight || REFERENCE_HEIGHT
      };
    }

    function calculateScale() {
      if (!isDesktop()) return 1;
      const viewport = viewportSize();
      const raw = Math.min(
        viewport.width / REFERENCE_WIDTH,
        viewport.height / REFERENCE_HEIGHT
      );
      return clamp(raw, MIN_SCALE, MAX_SCALE);
    }

    function ensureStyle() {
      if (document.getElementById('archive-reference-viewport-style')) return;
      const style = document.createElement('style');
      style.id = 'archive-reference-viewport-style';
      style.textContent = `
        @media (min-width:769px) and (min-height:521px) {
          html[data-archive-reference="on"] #title-language-wheel {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:50% 0!important;
          }
          html[data-archive-reference="on"] #global-compass-module,
          html[data-archive-reference="on"] #main-reader-tone-control {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:100% 0!important;
          }
          html[data-archive-reference="on"] #stack-record {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:0 100%!important;
          }
          html[data-archive-reference="on"] #stack-garden {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:100% 100%!important;
          }
          html[data-archive-reference="on"] .hud {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:50% 0!important;
          }
          html[data-archive-reference="on"] #record-nav,
          html[data-archive-reference="on"] .archive-ui {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:0 50%!important;
          }
          html[data-archive-reference="on"] #index-inscription-language-switcher {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:100% 0!important;
          }
          html[data-archive-reference="on"] #index-stable-zone .index-items {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:50% 100%!important;
          }
          html[data-archive-reference="on"] #bottom-trigger-record {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:0 100%!important;
          }
          html[data-archive-reference="on"] #bottom-center-label {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:50% 100%!important;
          }
          html[data-archive-reference="on"] #bottom-trigger-ruin,
          html[data-archive-reference="on"] #archive-add-link {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:100% 100%!important;
          }
          html[data-archive-reference="on"] .garden-dot,
          html[data-archive-reference="on"] .record-dot {
            scale:var(--archive-reference-scale,1)!important;
            transform-origin:50% 50%!important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    function applyScale() {
      resizeRaf = 0;
      ensureStyle();
      const root = document.documentElement;
      const viewport = viewportSize();
      const scale = calculateScale();
      const desktop = isDesktop();

      root.dataset.archiveReference = desktop ? 'on' : 'off';
      root.dataset.referenceScale = scale.toFixed(4);
      root.style.setProperty('--archive-reference-scale', scale.toFixed(4));
      root.style.setProperty('--archive-reference-width', String(REFERENCE_WIDTH));
      root.style.setProperty('--archive-reference-height', String(REFERENCE_HEIGHT));
      root.style.setProperty('--archive-current-width', String(viewport.width));
      root.style.setProperty('--archive-current-height', String(viewport.height));

      window.dispatchEvent(new CustomEvent('ruin:reference-scale', {
        detail: {
          scale,
          desktop,
          viewport,
          reference: {width:REFERENCE_WIDTH, height:REFERENCE_HEIGHT}
        }
      }));
    }

    function schedule() {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(applyScale);
    }

    ensureStyle();
    schedule();
    window.addEventListener('resize', schedule, {passive:true});
    window.addEventListener('orientationchange', schedule, {passive:true});

    window.RuinReferenceViewport = Object.freeze({
      width: REFERENCE_WIDTH,
      height: REFERENCE_HEIGHT,
      minScale: MIN_SCALE,
      maxScale: MAX_SCALE,
      calculateScale,
      refresh: schedule
    });
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
      const referenceScale = () => {
        const parsed = Number.parseFloat(document.documentElement.dataset.referenceScale || '1');
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
      };
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
        const leadDelta = lang === 'zh' ? 1.15 : 1.0;
        const linkSize = Math.max(9.2, value * 0.74);
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
        const scale = referenceScale();
        const sidePadding = Math.max(30, Math.min(92, 52 * scale));
        box.style.setProperty('padding-left', `${sidePadding.toFixed(1)}px`, 'important');
        box.style.setProperty('padding-right', `${sidePadding.toFixed(1)}px`, 'important');
        source.querySelectorAll('.index-top-title').forEach(node => {
          node.style.setProperty('font-size', `${(value + 0.35).toFixed(2)}px`, 'important');
        });
        source.querySelectorAll('.index-three-columns').forEach(node => {
          node.style.setProperty('font-size', `${value.toFixed(2)}px`, 'important');
        });
        source.querySelectorAll('.index-conclusion, .index-manifesto-crossref').forEach(node => {
          node.style.setProperty('font-size', `${Math.max(9.5, value - 0.1).toFixed(2)}px`, 'important');
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
        return {copyRect, minLeft, minTop, maxRight, maxBottom};
      }

      function largestThatFits(min, max, apply, fits) {
        if (max <= min) {
          apply(max);
          return max;
        }
        apply(max);
        void source.offsetWidth;
        if (fits()) return max;
        let low = min;
        let high = max;
        let best = min;
        apply(min);
        void source.offsetWidth;
        for (let i = 0; i < 14; i += 1) {
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
        const scale = referenceScale();
        const base = lang === 'zh' ? 14.8 : 13.6;
        const target = base * scale;
        const minimum = Math.max(8.8, target * 0.72);
        const fits = () => {
          const ink = verticalInkBounds(copy);
          if (!ink) return false;
          const box = ink.copyRect;
          return (
            ink.minLeft >= box.left - 1 &&
            ink.maxRight <= box.right + 1 &&
            ink.minTop >= box.top - 2 &&
            ink.maxBottom <= box.bottom + 2
          );
        };
        const best = largestThatFits(minimum, target, value => applyVerticalSize(value, lang), fits);
        applyVerticalSize(best, lang);
      }

      function fitEnglish() {
        clearVerticalInline();
        const box = englishBox();
        if (!box || box.clientHeight < 20 || box.clientWidth < 20) return;
        const scale = referenceScale();
        const target = 13.35 * scale;
        const minimum = Math.max(9.2, target * 0.76);
        const best = largestThatFits(
          minimum,
          target,
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
        if (lang === 'en') fitEnglish();
        else fitVertical(lang);
      }

      function scheduleFit() {
        if (fitRaf) return;
        fitRaf = requestAnimationFrame(fit);
      }

      window.addEventListener('resize', scheduleFit, {passive:true});
      window.addEventListener('ruin:reference-scale', scheduleFit);
      if (document.fonts?.ready) document.fonts.ready.then(scheduleFit).catch(() => {});

      const htmlObserver = new MutationObserver(scheduleFit);
      htmlObserver.observe(document.documentElement, {
        attributes:true,
        attributeFilter:['lang','data-lang','data-reference-scale']
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

  function installArchiveFracturePolicy() {
    if (document.title !== 'Ruin Atlas · Relic Archive') return;

    const PREF_KEY = 'ruin-archive-fractures';
    const root = document.documentElement;

    function readPreference() {
      try {
        return localStorage.getItem(PREF_KEY) === 'off' ? 'off' : 'auto';
      } catch (_) {
        return 'auto';
      }
    }

    function writePreference(value) {
      try { localStorage.setItem(PREF_KEY, value === 'off' ? 'off' : 'auto'); } catch (_) {}
    }

    function randomUnit() {
      try {
        const value = crypto.getRandomValues(new Uint32Array(1))[0];
        return value / 0x100000000;
      } catch (_) {
        return Math.random();
      }
    }

    function shuffled(list) {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(randomUnit() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    const preference = readPreference();
    const enabled = preference !== 'off';
    const optionalGroups = ['global', 'frame', 'archive', 'drawer'];
    const countRoll = randomUnit();
    let optionalCount = countRoll < 0.20 ? 0
      : countRoll < 0.58 ? 1
      : countRoll < 0.86 ? 2
      : countRoll < 0.97 ? 3
      : 4;
    let compassBroken = randomUnit() < 0.90;

    if (!compassBroken && optionalCount === 0) optionalCount = 1;

    const activeOptional = new Set(shuffled(optionalGroups).slice(0, optionalCount));
    const state = name => enabled && activeOptional.has(name) ? 'on' : 'off';

    root.dataset.ruinFractures = enabled ? 'auto' : 'off';
    root.dataset.ruinFractureStele = enabled ? 'on' : 'off';
    root.dataset.ruinFractureCompass = enabled && compassBroken ? 'on' : 'off';
    root.dataset.ruinFractureGlobal = state('global');
    root.dataset.ruinFractureFrame = state('frame');
    root.dataset.ruinFractureArchive = state('archive');
    root.dataset.ruinFractureDrawer = state('drawer');

    function ensureStyle() {
      if (document.getElementById('archive-fracture-policy-style')) return;
      const style = document.createElement('style');
      style.id = 'archive-fracture-policy-style';
      style.textContent = `
        html[data-ruin-fracture-global="off"] #ruin-fracture-global-layer,
        html[data-ruin-fractures="off"] #ruin-fracture-global-layer {
          display:none!important;
        }
        html[data-ruin-fracture-global="off"] body.ruin-fracture-active > .perspective-line line,
        html[data-ruin-fractures="off"] body.ruin-fracture-active > .perspective-line line {
          stroke:var(--reader-line-strong,rgba(0,0,0,.42))!important;
        }

        html[data-ruin-fracture-frame="off"] #main-viewport-frame > .ruin-fracture-overlay,
        html[data-ruin-fractures="off"] #main-viewport-frame > .ruin-fracture-overlay {
          display:none!important;
        }
        html[data-ruin-fracture-frame="off"] #main-viewport-frame.fracture-active,
        html[data-ruin-fractures="off"] #main-viewport-frame.fracture-active {
          border-color:var(--reader-line-strong,rgba(0,0,0,.42))!important;
        }

        html[data-ruin-fracture-compass="off"] .compass-pentagon-outer > .ruin-fracture-overlay,
        html[data-ruin-fractures="off"] .compass-pentagon-outer > .ruin-fracture-overlay {
          display:none!important;
          visibility:hidden!important;
        }
        html[data-ruin-fracture-compass="off"] .compass-pentagon-outer.fracture-active::after,
        html[data-ruin-fractures="off"] .compass-pentagon-outer.fracture-active::after {
          border-color:var(--reader-line-strong,rgba(0,0,0,.42))!important;
        }
        @media (min-width:769px) and (min-height:521px) {
          html[data-ruin-fracture-compass="off"] .compass-pentagon-outer.fracture-active,
          html[data-ruin-fractures="off"] .compass-pentagon-outer.fracture-active {
            clip-path:polygon(0 0,100% 0,100% 100%,35px 100%,0 calc(100% - 35px))!important;
            -webkit-clip-path:polygon(0 0,100% 0,100% 100%,35px 100%,0 calc(100% - 35px))!important;
          }
        }

        html[data-ruin-fracture-archive="off"] .archive-doc > .ruin-fracture-overlay,
        html[data-ruin-fracture-archive="off"] .archive-doc > .ruin-fracture-archive-base,
        html[data-ruin-fractures="off"] .archive-doc > .ruin-fracture-overlay,
        html[data-ruin-fractures="off"] .archive-doc > .ruin-fracture-archive-base {
          display:none!important;
        }
        html[data-ruin-fracture-archive="off"] .archive-doc.fracture-doc,
        html[data-ruin-fracture-archive="off"] .archive-doc.archive-cut-doc,
        html[data-ruin-fractures="off"] .archive-doc.fracture-doc,
        html[data-ruin-fractures="off"] .archive-doc.archive-cut-doc {
          border-color:var(--reader-line-strong,rgba(0,0,0,.42))!important;
          clip-path:none!important;
          -webkit-clip-path:none!important;
          background:var(--reader-paper-85,rgba(255,255,251,.90))!important;
        }
        html[data-ruin-fracture-archive="off"] .archive-doc.archive-cut-doc::before,
        html[data-ruin-fractures="off"] .archive-doc.archive-cut-doc::before {
          display:none!important;
        }
        html[data-ruin-fracture-archive="off"] .archive-doc.archive-misaligned,
        html[data-ruin-fractures="off"] .archive-doc.archive-misaligned {
          --archive-misalign-x:0px!important;
          --archive-misalign-y:0px!important;
          --archive-misalign-rot:0deg!important;
        }

        html[data-ruin-fracture-drawer="off"] #index-drawer,
        html[data-ruin-fractures="off"] #index-drawer {
          --index-drawer-shell-clip:polygon(0 60px,var(--frame-left,230px) 0,var(--frame-right,calc(100% - 172px)) 0,100% 60px,100% 100%,0 100%)!important;
        }
        html[data-ruin-fracture-drawer="off"] .index-drawer-crack-overpass,
        html[data-ruin-fractures="off"] .index-drawer-crack-overpass {
          display:none!important;
        }
        html[data-ruin-fracture-drawer="off"] #drawer-opened-bottom-decor,
        html[data-ruin-fractures="off"] #drawer-opened-bottom-decor {
          --bottom-decor-left-clip:polygon(0 0,160px 0,100% 100%,0 100%)!important;
          --bottom-decor-right-clip:polygon(158px 0,100% 0,100% 100%,0 100%)!important;
        }
        html[data-ruin-fracture-drawer="off"] #drawer-opened-bottom-decor .drawer-perspective-line path.drawer-wear-main,
        html[data-ruin-fracture-drawer="off"] #drawer-opened-bottom-decor .drawer-perspective-line path.drawer-wear-crack,
        html[data-ruin-fractures="off"] #drawer-opened-bottom-decor .drawer-perspective-line path.drawer-wear-main,
        html[data-ruin-fractures="off"] #drawer-opened-bottom-decor .drawer-perspective-line path.drawer-wear-crack {
          display:none!important;
        }
        html[data-ruin-fracture-drawer="off"] #drawer-opened-bottom-decor .drawer-perspective-line line,
        html[data-ruin-fractures="off"] #drawer-opened-bottom-decor .drawer-perspective-line line {
          display:block!important;
          stroke:var(--reader-line-strong,rgba(0,0,0,.42))!important;
        }

        html[data-ruin-fractures="off"] .ruin-fracture-overlay,
        html[data-ruin-fractures="off"] #index-fracture-fragments,
        html[data-ruin-fractures="off"] .index-fracture-piece,
        html[data-ruin-fractures="off"] .index-fracture-reflow-piece {
          display:none!important;
          visibility:hidden!important;
        }
        html[data-ruin-fractures="off"] #index-fracture-source {
          visibility:visible!important;
          opacity:1!important;
          clip-path:none!important;
          -webkit-clip-path:none!important;
          mask:none!important;
          -webkit-mask:none!important;
        }

        #index-fracture-preference {
          position:absolute;
          left:clamp(18px,2.3vw,42px);
          top:clamp(76px,9.5vh,106px);
          z-index:80;
          max-width:180px;
          display:flex;
          flex-direction:column;
          gap:3px;
          font-family:"IBM Plex Sans JP",sans-serif;
          font-size:9px;
          font-weight:300;
          line-height:1.35;
          letter-spacing:.045em;
          color:var(--reader-text-55,rgba(0,0,0,.52));
          opacity:.38;
          transition:opacity .18s ease;
          pointer-events:auto;
          user-select:none;
        }
        #index-fracture-preference:hover,
        #index-fracture-preference:focus-within { opacity:.74; }
        #index-fracture-preference .fracture-note-line { white-space:nowrap; }
        #index-fracture-preference .fracture-pref-toggle {
          display:inline-flex;
          align-items:center;
          gap:6px;
          width:max-content;
          cursor:pointer;
        }
        #index-fracture-preference input {
          appearance:none;
          -webkit-appearance:none;
          width:10px;
          height:10px;
          margin:0;
          border:1px solid currentColor;
          border-radius:0;
          background:transparent;
          cursor:pointer;
        }
        #index-fracture-preference input:checked {
          background:linear-gradient(currentColor,currentColor) center/4px 4px no-repeat;
        }
        @media (max-width:768px), (max-width:950px) and (max-height:520px) {
          #index-fracture-preference { display:none!important; }
        }
      `;
      document.head.appendChild(style);
    }

    const copy = {
      zh: {
        note: '裂纹由每次载入随机生成',
        off: '无裂纹（重新载入）'
      },
      en: {
        note: 'fractures regenerate on each load',
        off: 'no fractures (reload)'
      },
      ja: {
        note: '亀裂は読み込みごとに自動生成',
        off: '亀裂なし（再読込）'
      }
    };

    function currentLang() {
      return normalize(
        document.documentElement.dataset.lang ||
        window.currentLang ||
        document.documentElement.lang
      ) || 'en';
    }

    function syncControlCopy() {
      const control = document.getElementById('index-fracture-preference');
      if (!control) return;
      const text = copy[currentLang()] || copy.en;
      const note = control.querySelector('[data-fracture-note]');
      const label = control.querySelector('[data-fracture-toggle-label]');
      if (note) note.textContent = text.note;
      if (label) label.textContent = text.off;
    }

    function installControl() {
      const zone = document.getElementById('index-fracture-zone');
      if (!zone || document.getElementById('index-fracture-preference')) return;

      const control = document.createElement('div');
      control.id = 'index-fracture-preference';
      control.innerHTML = `
        <div class="fracture-note-line" data-fracture-note></div>
        <label class="fracture-pref-toggle">
          <input type="checkbox" aria-label="Disable generated fractures">
          <span data-fracture-toggle-label></span>
        </label>
      `;
      const input = control.querySelector('input');
      input.checked = readPreference() === 'off';
      input.addEventListener('change', () => {
        writePreference(input.checked ? 'off' : 'auto');
        location.reload();
      });
      zone.appendChild(control);
      syncControlCopy();
    }

    ensureStyle();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', installControl, {once:true});
    } else {
      installControl();
    }
    document.addEventListener('languagechange-complete', syncControlCopy);
    const langObserver = new MutationObserver(syncControlCopy);
    langObserver.observe(root, {attributes:true, attributeFilter:['lang','data-lang']});

    window.RuinFracturePreference = Object.freeze({
      key: PREF_KEY,
      mode: preference,
      plan: Object.freeze({
        compass: root.dataset.ruinFractureCompass,
        global: root.dataset.ruinFractureGlobal,
        frame: root.dataset.ruinFractureFrame,
        archive: root.dataset.ruinFractureArchive,
        drawer: root.dataset.ruinFractureDrawer,
        stele: root.dataset.ruinFractureStele
      }),
      set(value) {
        writePreference(value === 'off' ? 'off' : 'auto');
        location.reload();
      }
    });
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
  installArchiveReferenceViewport();
  installArchiveIndexDrawerFit();
  installArchiveFracturePolicy();
})();