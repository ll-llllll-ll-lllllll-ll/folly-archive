(() => {
  'use strict';

  const ROUTES = Object.freeze({
    'decayed-tower-scorched-earth': {
      point: 'tower-antenna-array',
      record: 'tower-mapping',
      label: {
        zh: '朽塔焦土',
        en: 'Rusted Tower · Scorched Earth',
        ja: '朽塔の焦土'
      }
    },
    'sunken-ruin-heart-chamber': {
      point: 'heart-artificial-lake',
      record: 'heart-mapping',
      label: {
        zh: '沉墟心室',
        en: 'Sunken Ventricle',
        ja: '沈墟の心室'
      }
    }
  });

  const STATUS = Object.freeze({
    zh: {
      start: '正在自动打开目录文件',
      work: '正在定位废墟园林',
      point: '正在选中地形记录',
      route: '正在连接目录路径',
      file: '正在打开 mapping.pdf'
    },
    en: {
      start: 'Automatically opening directory record',
      work: 'Locating Folly',
      point: 'Selecting terrain record',
      route: 'Connecting directory route',
      file: 'Opening mapping.pdf'
    },
    ja: {
      start: 'ディレクトリ記録を自動で開いています',
      work: 'フォリーを特定しています',
      point: '地形記録を選択しています',
      route: 'ディレクトリ経路を接続しています',
      file: 'mapping.pdf を開いています'
    }
  });

  function langKey() {
    const raw = String(window.RuinLanguage?.get?.() || document.documentElement.dataset.lang || document.documentElement.lang || 'zh').toLowerCase();
    if (raw.startsWith('ja')) return 'ja';
    if (raw.startsWith('en')) return 'en';
    return 'zh';
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function installStyle() {
    if (document.getElementById('mechanics-archive-bridge-style')) return;
    const style = document.createElement('style');
    style.id = 'mechanics-archive-bridge-style';
    style.textContent = `
      #archive-origin-return {
        position: fixed;
        left: 14px;
        top: 12px;
        z-index: 13000;
        max-width: min(520px, calc(100vw - 28px));
        padding: 6px 8px;
        box-sizing: border-box;
        font: 300 10px/1.45 "IBM Plex Mono", "IBM Plex Sans JP", monospace;
        letter-spacing: .035em;
        color: var(--ink, rgba(28,28,26,.78));
        background: color-mix(in srgb, var(--paper, #f7f3e8) 82%, transparent);
        border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
        text-decoration: none;
        opacity: .66;
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        transition: opacity .18s ease, transform .18s ease;
      }
      #archive-origin-return:hover,
      #archive-origin-return:focus-visible {
        opacity: 1;
        transform: translateX(-2px);
        outline: none;
      }

      #mechanics-auto-open-status {
        position: fixed;
        left: 50%;
        top: 18px;
        z-index: 13100;
        transform: translateX(-50%);
        max-width: min(560px, calc(100vw - 40px));
        padding: 6px 10px;
        box-sizing: border-box;
        font: 300 10px/1.4 "IBM Plex Mono", "IBM Plex Sans JP", monospace;
        letter-spacing: .10em;
        color: var(--ink, rgba(28,28,26,.68));
        background: color-mix(in srgb, var(--paper, #f7f3e8) 86%, transparent);
        border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
        text-align: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity .3s ease, transform .3s ease;
      }
      body.mechanics-auto-opening #mechanics-auto-open-status {
        opacity: .76;
        transform: translateX(-50%) translateY(0);
      }
      #mechanics-auto-open-status::after {
        content: '';
        display: inline-block;
        width: 16px;
        height: 1px;
        margin-left: 7px;
        vertical-align: middle;
        background: currentColor;
        transform-origin: left center;
        animation: mechanics-auto-scan 1.25s ease-in-out infinite;
      }
      @keyframes mechanics-auto-scan {
        0%,100% { transform: scaleX(.18); opacity: .25; }
        50% { transform: scaleX(1); opacity: .75; }
      }

      /* The selected tags appear first. The route is revealed one beat later. */
      body.mechanics-auto-route-pending #directory-connector {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      body.mechanics-auto-route-reveal #directory-connector.is-visible {
        transition: opacity .55s ease !important;
      }

      @media (max-width: 800px) {
        #archive-origin-return {
          top: max(8px, env(safe-area-inset-top, 0px));
          left: max(8px, env(safe-area-inset-left, 0px));
          max-width: calc(100vw - 16px);
          font-size: 9px;
        }
        #mechanics-auto-open-status {
          top: max(48px, calc(env(safe-area-inset-top, 0px) + 42px));
          font-size: 9px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function queryRoute() {
    const params = new URLSearchParams(location.search);
    if (params.get('from') !== 'archive') return null;
    const work = params.get('work') || '';
    const config = ROUTES[work];
    if (!config) return null;
    const point = params.get('point') || config.point;
    const record = params.get('record') || config.record;
    if (point !== config.point || record !== config.record) return null;
    return { work, point, record, config };
  }

  function installReturn(route) {
    if (!route || document.getElementById('archive-origin-return')) return;
    const link = document.createElement('a');
    link.id = 'archive-origin-return';
    link.href = 'index.html';

    const sync = () => {
      const lang = langKey();
      const name = route.config.label[lang] || route.config.label.zh;
      link.textContent = lang === 'en'
        ? `← Return to “Ruin Atlas · Relic Archive / ${name}”`
        : lang === 'ja'
          ? `← 『墟域図・遺構館 / ${name}』へ戻る`
          : `← 返回《墟域图·遗构馆 / ${name}》`;
    };

    link.addEventListener('click', event => {
      if (window.opener && !window.opener.closed) {
        event.preventDefault();
        try {
          window.opener.focus();
          window.close();
        } catch (_) {
          location.href = link.href;
        }
      }
    });

    document.body.appendChild(link);
    sync();
    addEventListener('ruinlanguagechange', sync);
  }

  function installStatus() {
    let status = document.getElementById('mechanics-auto-open-status');
    if (status) return status;
    status = document.createElement('div');
    status.id = 'mechanics-auto-open-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);
    return status;
  }

  function setStatus(status, phase) {
    const copy = STATUS[langKey()] || STATUS.zh;
    status.textContent = copy[phase] || copy.start;
  }

  function clickProject(workId) {
    const card = document.querySelector(`[data-selection-node="${CSS.escape(workId)}"]`);
    const button = card?.querySelector(':scope > .selection-row .selection-project-select');
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    button?.click();
    return Boolean(button);
  }

  function clickPoint(pointId) {
    const button = document.querySelector(`[data-selection-id="${CSS.escape(pointId)}"]`);
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    button?.click();
    return Boolean(button);
  }

  function openCurrentSource() {
    const buttons = [...document.querySelectorAll('#sheet-stack .sheet-open-source')]
      .filter(button => !button.hidden && getComputedStyle(button).display !== 'none');
    const button = buttons[buttons.length - 1] || buttons[0];
    button?.click();
    return Boolean(button);
  }

  async function runAutoOpen(route) {
    const status = installStatus();
    document.body.classList.add('mechanics-auto-opening', 'mechanics-auto-route-pending');
    setStatus(status, 'start');

    await sleep(520);
    setStatus(status, 'work');
    clickProject(route.work);

    await sleep(720);
    setStatus(status, 'point');
    clickPoint(route.point);

    await sleep(760);
    setStatus(status, 'route');
    document.body.classList.remove('mechanics-auto-route-pending');
    document.body.classList.add('mechanics-auto-route-reveal');
    dispatchEvent(new Event('resize'));

    await sleep(820);
    setStatus(status, 'file');
    openCurrentSource();

    await sleep(520);
    document.body.classList.remove('mechanics-auto-opening');
    await sleep(320);
    status.remove();
    document.body.classList.remove('mechanics-auto-route-reveal');
  }

  function install() {
    const route = queryRoute();
    if (!route) return;

    installStyle();
    installReturn(route);

    // Wait one rendering turn after mechanics.js has built both trees.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => runAutoOpen(route));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
