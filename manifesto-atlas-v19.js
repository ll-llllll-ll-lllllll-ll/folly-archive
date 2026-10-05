(() => {
  'use strict';

  const reader = document.querySelector('.manifesto-reader');
  const scroller = document.getElementById('manifesto-scroll');
  const documentEl = document.getElementById('manifesto-document');
  const indexEl = document.getElementById('manifesto-index');
  const indexNav = document.getElementById('manifesto-index-nav');
  if (!reader || !scroller || !documentEl || !indexEl || !indexNav) return;

  const COPY = {
    zh: {
      enter: '下滑　进入阅读 ↓',
      expand: '[ 展开阅读 ]',
      collapse: '[ 收起 ]',
      unlock: '解除锁定，浏览全文',
      words: '字数'
    },
    en: {
      enter: 'SCROLL　ENTER READING ↓',
      expand: '[ Read more ]',
      collapse: '[ Collapse ]',
      unlock: 'Unlock · browse full text',
      words: 'Words'
    },
    ja: {
      enter: '下へ　本文を読む ↓',
      expand: '[ 続きを読む ]',
      collapse: '[ 閉じる ]',
      unlock: '固定解除・全文を読む',
      words: '文字数'
    }
  };

  const TENET_RE = /^(?:第[一二三四五六七八九十]+[则則][:：]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+Tenet:)/i;
  const NS = 'http://www.w3.org/2000/svg';

  let lockedIndex = -1;
  let hoverIndex = -1;
  let routeLayer = null;
  let routeRaf = 0;
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

  function tenetCards() {
    return [...(directory()?.querySelectorAll('.tenet-directory-card') || [])].slice(0, 10);
  }

  function tenetIndexLinks() {
    return [...indexNav.querySelectorAll('.manifesto-index-link.is-tenet')].slice(0, 10);
  }

  function scrollerTopFor(target, offset = 24) {
    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return Math.max(0, scroller.scrollTop + targetRect.top - scrollerRect.top - offset);
  }

  function setTenetExpanded(target, expanded, scrollIntoView = false) {
    if (!target) return;
    target.classList.toggle('is-collapsed', !expanded);
    target.classList.toggle('is-expanded', expanded);
    const button = target.querySelector(':scope > .tenet-expand-toggle');
    if (button) {
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? copy().collapse : copy().expand;
    }
    if (expanded && scrollIntoView) {
      const rail = reader.classList.contains('manifesto-tenet-lock') ? (directory()?.getBoundingClientRect().height || 0) : 0;
      scroller.scrollTo({top: scrollerTopFor(target, rail + 22), behavior: 'smooth'});
    }
  }

  function installTenetReaders(tenets) {
    tenets.forEach((target, index) => {
      target.dataset.tenetAtlasIndex = String(index);
      let preview = [...target.children].find(el => el.tagName === 'P');
      if (!preview) return;
      preview.classList.add('tenet-preview-paragraph');

      let button = target.querySelector(':scope > .tenet-expand-toggle');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'tenet-expand-toggle';
        preview.insertAdjacentElement('afterend', button);
        button.addEventListener('click', () => {
          const expand = target.classList.contains('is-collapsed');
          setTenetExpanded(target, expand, false);
          scheduleRoutes();
        });
      }

      if (!target.dataset.tenetReaderInitialized) {
        target.dataset.tenetReaderInitialized = '1';
        setTenetExpanded(target, false, false);
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

  function ensurePanelExtras() {
    const panel = frontPanel();
    const nav = directory();
    if (!panel || !nav) return;

    let unlock = nav.querySelector(':scope > .tenet-unlock-button');
    if (!unlock) {
      unlock = document.createElement('button');
      unlock.type = 'button';
      unlock.className = 'tenet-unlock-button';
      nav.appendChild(unlock);
      unlock.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        unlockTenetMode();
      });
    }
    unlock.textContent = copy().unlock;

    let enter = panel.querySelector(':scope > .manifesto-enter-reading');
    if (!enter) {
      enter = document.createElement('button');
      enter.type = 'button';
      enter.className = 'manifesto-enter-reading';
      panel.appendChild(enter);
      enter.addEventListener('click', () => {
        unlockTenetMode();
        const title = documentEl.querySelector('.manifesto-title-block');
        if (title) scroller.scrollTo({top: scrollerTopFor(title, 26), behavior: 'smooth'});
      });
    }
    enter.textContent = copy().enter;

    if (!nav.dataset.atlasV19Bound) {
      nav.dataset.atlasV19Bound = '1';

      nav.addEventListener('click', event => {
        const card = event.target.closest('.tenet-directory-card');
        if (!card) return;
        const cards = tenetCards();
        const index = cards.indexOf(card);
        if (index < 0) return;

        /* v14 performs the original return-button insertion and first scroll.
           We enter lock mode immediately afterwards and refine the landing
           position so the pinned atlas never covers the tenet heading. */
        window.setTimeout(() => enterTenetMode(index), 0);
      });

      nav.addEventListener('mouseover', event => {
        const card = event.target.closest('.tenet-directory-card');
        if (!card) return;
        const index = tenetCards().indexOf(card);
        if (index < 0 || hoverIndex === index) return;
        hoverIndex = index;
        setRouteHighlight(index);
      });

      nav.addEventListener('mouseout', event => {
        const card = event.target.closest('.tenet-directory-card');
        if (!card || card.contains(event.relatedTarget)) return;
        hoverIndex = -1;
        setRouteHighlight(lockedIndex);
      });
    }
  }

  function enterTenetMode(index) {
    const targets = tenetTargets();
    const target = targets[index];
    const nav = directory();
    if (!target || !nav) return;

    lockedIndex = index;
    reader.classList.add('manifesto-tenet-lock');
    nav.dataset.lockedTenet = String(index);
    setTenetExpanded(target, true, false);

    requestAnimationFrame(() => {
      const railHeight = Math.ceil(nav.getBoundingClientRect().height);
      reader.style.setProperty('--tenet-lock-rail-h', `${railHeight}px`);
      scroller.scrollTo({top: scrollerTopFor(target, railHeight + 22), behavior: 'smooth'});
      ensureRouteLayer();
      setRouteHighlight(index);
      scheduleRoutes();
    });
  }

  function unlockTenetMode() {
    lockedIndex = -1;
    hoverIndex = -1;
    reader.classList.remove('manifesto-tenet-lock');
    reader.style.removeProperty('--tenet-lock-rail-h');
    const nav = directory();
    if (nav) delete nav.dataset.lockedTenet;
    setRouteHighlight(-1);
    scheduleRoutes();
  }

  function ensureRouteLayer() {
    if (routeLayer && routeLayer.isConnected) return routeLayer;
    routeLayer = document.createElementNS(NS, 'svg');
    routeLayer.classList.add('tenet-route-layer');
    routeLayer.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 10; i++) {
      const group = document.createElementNS(NS, 'g');
      group.classList.add('tenet-route');
      group.dataset.routeIndex = String(i);
      ['depth', 'main', 'light'].forEach(kind => {
        const path = document.createElementNS(NS, 'path');
        path.classList.add(`tenet-route-${kind}`);
        path.setAttribute('fill', 'none');
        group.appendChild(path);
      });
      routeLayer.appendChild(group);
    }
    reader.appendChild(routeLayer);
    return routeLayer;
  }

  function setRouteHighlight(index) {
    const layer = ensureRouteLayer();
    [...layer.querySelectorAll('.tenet-route')].forEach((group, i) => {
      group.classList.toggle('is-active', i === index);
    });
    tenetCards().forEach((card, i) => card.classList.toggle('is-route-active', i === index));
    tenetIndexLinks().forEach((link, i) => link.classList.toggle('is-route-active', i === index));
  }

  function updateRoutes() {
    routeRaf = 0;
    const layer = ensureRouteLayer();
    if (!reader.classList.contains('manifesto-tenet-lock') || innerWidth <= 900) {
      layer.hidden = true;
      return;
    }

    const cards = tenetCards();
    const links = tenetIndexLinks();
    const nav = directory();
    if (cards.length < 10 || links.length < 10 || !nav) {
      layer.hidden = true;
      return;
    }

    layer.hidden = false;
    const readerRect = reader.getBoundingClientRect();
    const width = Math.max(1, reader.clientWidth);
    const height = Math.max(1, reader.clientHeight);
    layer.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const railHeight = nav.getBoundingClientRect().height;
    const indexRight = indexEl.getBoundingClientRect().right - readerRect.left;

    cards.forEach((card, i) => {
      const tile = card.querySelector('.tenet-directory-tile') || card;
      const a = tile.getBoundingClientRect();
      const b = links[i].getBoundingClientRect();

      const sx = a.left + a.width / 2 - readerRect.left;
      const sy = a.bottom - readerRect.top + 1;
      const ex = Math.max(22, b.left - readerRect.left + 2);
      const ey = b.top + b.height / 2 - readerRect.top;

      /* Orthogonal/45-degree routing: first descend into a dedicated lane,
         travel horizontally above the reading field, then turn through one
         exact 45-degree chamfer before descending beside the contents rail. */
      const laneY = Math.min(height - 80, Math.max(sy + 10, railHeight + 12 + i * 14));
      const bendX = Math.max(indexRight + 82, Math.min(sx - 18, indexRight + 178 + i * 7));
      const diag = Math.max(18, Math.min(54, bendX - indexRight - 24));
      const chamferX = bendX - diag;
      const chamferY = laneY + diag;
      const verticalEndY = Math.max(chamferY, ey);
      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} V ${laneY.toFixed(1)} H ${bendX.toFixed(1)} L ${chamferX.toFixed(1)} ${chamferY.toFixed(1)} V ${verticalEndY.toFixed(1)} H ${ex.toFixed(1)}`;

      const group = layer.querySelector(`[data-route-index="${i}"]`);
      group?.querySelectorAll('path').forEach(path => path.setAttribute('d', d));
    });
  }

  function scheduleRoutes() {
    if (routeRaf) return;
    routeRaf = requestAnimationFrame(updateRoutes);
  }

  function enhance() {
    enhanceRaf = 0;
    const panel = frontPanel();
    const tenets = tenetTargets();
    if (!panel || tenets.length < 10) return;
    installTenetReaders(tenets);
    ensurePanelExtras();
    ensureWordCount();
    ensureRouteLayer();
    setRouteHighlight(lockedIndex);
    scheduleRoutes();
  }

  function scheduleEnhance() {
    if (enhanceRaf) return;
    enhanceRaf = requestAnimationFrame(enhance);
  }

  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(documentEl, {childList: true, subtree: true});
  observer.observe(scroller, {childList: true});

  scroller.addEventListener('scroll', scheduleRoutes, {passive: true});
  indexEl.addEventListener('scroll', scheduleRoutes, {passive: true});
  window.addEventListener('resize', () => {
    const nav = directory();
    if (reader.classList.contains('manifesto-tenet-lock') && nav) {
      reader.style.setProperty('--tenet-lock-rail-h', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
    }
    scheduleRoutes();
  }, {passive: true});

  documentEl.addEventListener('click', event => {
    if (event.target.closest('.tenet-return-button')) unlockTenetMode();
  }, true);

  window.addEventListener('ruinlanguagechange', () => {
    unlockTenetMode();
    window.setTimeout(scheduleEnhance, 0);
  });

  scheduleEnhance();
})();