/* Shared rights / notice-and-removal UI — 20261011-01. */
(() => {
  'use strict';
  const COPY = {
    zh: {
      short: '如本站影像或地点资料涉及您的权益，可申请更正、遮蔽或删除。',
      full: '本站尊重文字、影像、地点资料所涉及的著作权、肖像权与隐私。如内容涉及您的合法权益，请告知具体页面及事由；核实后将及时采取适当措施。',
      archive: '如地图坐标、地点资料或投稿影像涉及您的合法权益，请申请更正、遮蔽或删除；本站将核实后及时处理。',
      link: '权益与删除申请 ↗',
      micro: '影像／地点权益问题？可申请更正或删除。',
      more: '申请处理 ↗',
      label: 'RIGHTS / REMOVAL'
    },
    en: {
      short: 'If an image or location record affects your rights, you may request a correction, redaction or removal.',
      full: 'We respect copyright, privacy and image rights in the texts, media and location records presented here. If material affects your lawful rights, identify the page and your concern; we will review it and take appropriate action promptly.',
      archive: 'If a location, coordinate or submitted image affects your lawful rights, you may request correction, redaction or removal. We will review and respond appropriately.',
      link: 'Rights & removal ↗',
      micro: 'Rights concern? Request correction or removal.',
      more: 'Request review ↗',
      label: 'RIGHTS / REMOVAL'
    },
    ja: {
      short: '掲載画像や所在地の情報が権利に関わる場合、訂正・非公開・削除をご申請いただけます。',
      full: '当サイトは文章・画像・所在地情報に関する著作権、肖像権、プライバシーを尊重します。権利上の懸念がある場合は該当ページと理由をお知らせください。確認のうえ、適切な措置を速やかに検討・実施します。',
      archive: '所在地・座標・投稿画像が権利に関わる場合、訂正・非公開・削除をご申請ください。確認のうえ、適切に対応します。',
      link: '権利に関する申出・削除 ↗',
      micro: '画像・所在地の権利に関する訂正・削除のご申出はこちら。',
      more: '申出はこちら ↗',
      label: 'RIGHTS / REMOVAL'
    }
  };
  const normalize = value => {
    const v = String(value || '').toLowerCase();
    return v.startsWith('zh') ? 'zh' : v.startsWith('ja') ? 'ja' : 'en';
  };
  const lang = () => normalize(
    document.body?.dataset.rightsPage
      ? (document.documentElement.dataset.lang || document.documentElement.lang)
      : (window.currentLang || document.documentElement.dataset.lang || document.documentElement.lang)
  );
  function translate() {
    const l = lang();
    const t = COPY[l];
    document.querySelectorAll('[data-rights-text]').forEach(el => {
      const next = t[el.dataset.rightsText] || t.short;
      if (el.textContent !== next) el.textContent = next;
    });
    document.querySelectorAll('[data-rights-link]').forEach(el => {
      const next = t[el.dataset.rightsLink] || t.link;
      if (el.textContent !== next) el.textContent = next;
    });
    document.querySelectorAll('[data-rights-label]').forEach(el => {
      if (el.textContent !== t.label) el.textContent = t.label;
    });
    document.querySelectorAll('[data-rights-section]').forEach(el => {
      el.hidden = el.dataset.rightsSection !== l;
    });
    document.querySelectorAll('[data-rights-lang]').forEach(btn => {
      btn.setAttribute('aria-current', String(btn.dataset.rightsLang === l));
    });
  }
  function createMicroNote() {
    const note = document.createElement('div');
    note.className = 'rights-notice rights-notice--mechanics';
    note.setAttribute('role','note');
    const msg = document.createElement('span');
    msg.dataset.rightsText = 'micro';
    const link = document.createElement('a');
    link.href = 'rights.html';
    link.dataset.rightsLink = 'more';
    note.append(msg, link);
    return note;
  }
  function initAttachmentNotice() {
    const viewer = document.getElementById('attachment-viewer');
    const notice = document.getElementById('rights-notice-attachment');
    if (!viewer || !notice) return;
    const sync = () => {
      // Only field photographs and "folly" location films. Never instrument,
      // score, textual, audio or PDF viewers.
      const eligible = viewer.classList.contains('open')
        && !viewer.classList.contains('mode-instrument')
        && (viewer.classList.contains('view-image') || viewer.classList.contains('mode-folly-video'));
      notice.hidden = !eligible;
    };
    new MutationObserver(sync).observe(viewer, {attributes:true,attributeFilter:['class']});
    sync();
  }
  function initMechanicsNotice() {
    const stack = document.getElementById('sheet-stack');
    if (!stack) return;
    let raf = 0;
    function sync() {
      raf = 0;
      const sheet = stack.querySelector('.archive-sheet.is-front');
      if (!sheet || !stack.classList.contains('is-selected')) return;
      const host = sheet.querySelector('.sheet-asset-host');
      const footerMain = sheet.querySelector('.sheet-footer-main');
      if (!host || !footerMain) return;
      const media = host.querySelector('img, video');
      const allowed = media && !(media.tagName === 'VIDEO' && /instrument[-_]/i.test(media.currentSrc || media.src || ''));
      const old = footerMain.querySelector('.rights-notice--mechanics');
      if (!allowed) { old?.remove(); return; }
      if (!old) footerMain.appendChild(createMicroNote());
      translate();
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };
    new MutationObserver(schedule).observe(stack, {childList:true,subtree:true});
    schedule();
  }
  function initRightsPage() {
    if (!document.body?.dataset.rightsPage) return;
    const query = new URLSearchParams(location.search).get('lang');
    const selected = ['zh','en','ja'].includes(query)
      ? query
      : (window.RuinSiteLanguage?.read?.() || 'en');
    window.RuinSiteLanguage?.applyDocument?.(selected);
    document.querySelectorAll('[data-rights-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.rightsLang;
        window.RuinSiteLanguage?.save?.(chosen);
        window.RuinSiteLanguage?.applyDocument?.(chosen);
        translate();
      });
    });
  }
  const init = () => {
    initRightsPage();
    initAttachmentNotice();
    initMechanicsNotice();
    translate();
    window.addEventListener('ruinlanguagechange', translate);
    new MutationObserver(translate).observe(document.documentElement, {
      attributes:true, attributeFilter:['lang','data-lang']
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else init();
})();
