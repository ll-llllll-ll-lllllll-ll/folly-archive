(() => {
  'use strict';

  const reader = document.querySelector('.manifesto-reader');
  const scroller = document.getElementById('manifesto-scroll');
  const documentEl = document.getElementById('manifesto-document');
  if (!reader || !scroller || !documentEl) return;

  const COPY = {
    zh: {
      enter: '下滑　进入阅读 ↓',
      expand: '[ 展开阅读 ]',
      collapse: '[ 收起 ]',
      words: '字数'
    },
    en: {
      enter: 'SCROLL　ENTER READING ↓',
      expand: '[ Read more ]',
      collapse: '[ Collapse ]',
      words: 'Words'
    },
    ja: {
      enter: '下へ　本文を読む ↓',
      expand: '[ 続きを読む ]',
      collapse: '[ 閉じる ]',
      words: '文字数'
    }
  };

  const TENET_RE = /^(?:第[一二三四五六七八九十]+[则則][:：]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Tenet:)/i;
  let enhanceRaf = 0;
  let wordCountEl = null;

  function lang() {
    const raw = String(document.documentElement.dataset.lang || document.documentElement.lang || window.RuinLanguage?.read?.() || 'zh').toLowerCase();
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('ja')) return 'ja';
    return 'zh';
  }

  function copy() {
    return COPY[lang()] || COPY.zh;
  }

  function frontPanel() {
    return scroller.querySelector(':scope > .manifesto-front-panel');
  }

  function directory() {
    return frontPanel()?.querySelector('.tenet-directory-grid') || null;
  }

  function tenetTargets() {
    return [...documentEl.querySelectorAll('.manifesto-subsection')]
      .filter(section => TENET_RE.test(section.querySelector(':scope > .manifesto-subsection-header h3')?.textContent?.trim() || ''))
      .slice(0, 10);
  }

  function scrollerTopFor(target, offset = 24) {
    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return Math.max(0, scroller.scrollTop + targetRect.top - scrollerRect.top - offset);
  }

  function setTenetExpanded(target, expanded) {
    if (!target) return;
    target.classList.toggle('is-collapsed', !expanded);
    target.classList.toggle('is-expanded', expanded);
    const button = target.querySelector(':scope > .tenet-expand-toggle');
    if (button) {
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? copy().collapse : copy().expand;
    }
  }

  function installTenetReaders(tenets) {
    tenets.forEach((target, index) => {
      target.dataset.tenetAtlasIndex = String(index);
      const preview = [...target.children].find(el => el.tagName === 'P');
      if (!preview) return;
      preview.classList.add('tenet-preview-paragraph');

      let button = target.querySelector(':scope > .tenet-expand-toggle');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'tenet-expand-toggle';
        preview.insertAdjacentElement('afterend', button);
        button.addEventListener('click', () => {
          setTenetExpanded(target, target.classList.contains('is-collapsed'));
        });
      }

      if (!target.dataset.tenetReaderInitialized) {
        target.dataset.tenetReaderInitialized = '1';
        setTenetExpanded(target, false);
      } else {
        button.textContent = target.classList.contains('is-collapsed') ? copy().expand : copy().collapse;
      }
    });
  }

  function ensureWordCount() {
    if (!wordCountEl) {
      wordCountEl = document.createElement('div');
      wordCountEl.className = 'manifesto-word-count';
      wordCountEl.setAttribute('aria-live', 'polite');
      reader.appendChild(wordCountEl);
    }

    const nodes = documentEl.querySelectorAll(
      '.manifesto-section p, .manifesto-subsection p, .bibliography-entry, .manifesto-footnotes li'
    );
    const text = [...nodes].map(node => node.textContent || '').join(' ').replace(/\s+/g, ' ').trim();
    let count = 0;
    if (lang() === 'en') {
      count = (text.match(/[A-Za-z0-9]+(?:[’'\-][A-Za-z0-9]+)*/g) || []).length;
    } else {
      const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\u31f0-\u31ff]/g) || []).length;
      const latin = (text.match(/[A-Za-z0-9]+(?:[’'\-][A-Za-z0-9]+)*/g) || []).length;
      count = cjk + latin;
    }
    wordCountEl.textContent = `${copy().words}  ${count.toLocaleString()}`;
  }

  function ensurePanelExtras(tenets) {
    const panel = frontPanel();
    const nav = directory();
    if (!panel || !nav) return;

    /* Clicking an atlas card should simply open the chosen tenet and let the
       original frontmatter navigation scroll to it. No sticky atlas or routed
       overlay is kept after entry. Capture phase makes sure the body is open
       before the existing card handler computes its reading position. */
    if (!nav.dataset.compactTenetsBound) {
      nav.dataset.compactTenetsBound = '1';
      nav.addEventListener('click', event => {
        const card = event.target.closest('.tenet-directory-card');
        if (!card) return;
        const cards = [...nav.querySelectorAll('.tenet-directory-card')].slice(0, 10);
        const index = cards.indexOf(card);
        if (index >= 0) setTenetExpanded(tenets[index], true);
      }, true);
    }

    let enter = panel.querySelector(':scope > .manifesto-enter-reading');
    if (!enter) {
      enter = document.createElement('button');
      enter.type = 'button';
      enter.className = 'manifesto-enter-reading';
      panel.appendChild(enter);
      enter.addEventListener('click', () => {
        const title = documentEl.querySelector('.manifesto-title-block');
        if (title) scroller.scrollTo({top: scrollerTopFor(title, 26), behavior: 'smooth'});
      });
    }
    enter.textContent = copy().enter;
  }

  function enhance() {
    enhanceRaf = 0;
    const panel = frontPanel();
    const tenets = tenetTargets();
    if (!panel || tenets.length < 10) return;
    installTenetReaders(tenets);
    ensurePanelExtras(tenets);
    ensureWordCount();
  }

  function scheduleEnhance() {
    if (enhanceRaf) return;
    enhanceRaf = requestAnimationFrame(enhance);
  }

  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(documentEl, {childList: true, subtree: true});
  observer.observe(scroller, {childList: true});

  window.addEventListener('ruinlanguagechange', () => {
    window.setTimeout(scheduleEnhance, 0);
  });

  scheduleEnhance();
})();
