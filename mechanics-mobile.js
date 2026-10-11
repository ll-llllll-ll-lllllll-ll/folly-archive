/* Mechanics mobile workspace · consolidated v116 behavior + v118 presentation. */
(() => {
  'use strict';

  const mq = matchMedia('(max-width:800px)');
  const nav = document.getElementById('mobile-workspace-nav');
  const tabs = nav?.querySelector('.mobile-workspace-tabs');
  const context = document.getElementById('mobile-workspace-context');
  const projectIndex = document.getElementById('project-index');
  const selectionTree = document.getElementById('selection-tree');
  const engineeringIndex = document.getElementById('engineering-index');
  const taxonomy = document.getElementById('engineering-taxonomy');
  const stage = document.getElementById('archive-stage');
  const tray = document.getElementById('file-extraction-tray');
  if (!nav || !tabs || !projectIndex || !selectionTree || !engineeringIndex || !taxonomy || !stage || !tray) return;

  const strings = {
    zh:{title:'墟构工程总数据库',back:'返回作品'},
    en:{title:'Ruinwright Engineering Database',back:'Back to works'},
    ja:{title:'墟構工程総データベース',back:'作品へ戻る'}
  };
  const lang = () => window.RuinLanguage?.read?.() || 'zh';
  const mobile = () => mq.matches;
  let baseView = ['works','archive'].includes(document.body.dataset.mobileView)
    ? document.body.dataset.mobileView
    : 'works';
  let syncing = false;

  const style = document.createElement('style');
  style.id = 'mechanics-mobile-v116-style';
  style.textContent = `
    .mobile-database-titlebar,.mobile-archive-back{display:none}
    @media(max-width:800px){
      :root{--mobile-workspace-h:106px !important;--mobile-db-title-h:46px;--mobile-tab-h:34px;--mobile-context-h:26px}
      .mobile-workspace-nav{height:var(--mobile-workspace-h) !important;grid-template-rows:var(--mobile-db-title-h) var(--mobile-tab-h) var(--mobile-context-h) !important;overflow:visible !important;z-index:82 !important}
      .mobile-database-titlebar{display:block;position:relative;z-index:84;min-width:0;border-bottom:1px solid var(--reader-line);background:var(--reader-paper)}
      .mobile-database-toggle{appearance:none;width:100%;height:100%;border:0;background:transparent;padding:0 13px 0 14px;display:flex;align-items:center;justify-content:space-between;gap:14px;color:var(--mechanics-ink-strong,var(--reader-text));text-align:left;font:600 16px/1.1 "IBM Plex Sans JP","Noto Sans SC",sans-serif;letter-spacing:.018em}
      .mobile-database-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .mobile-database-tree-icon{width:27px;height:22px;flex:0 0 27px;overflow:visible;color:var(--mechanics-ink-soft,var(--reader-muted));transition:transform 280ms cubic-bezier(.22,.72,.18,1),color 180ms ease}
      .mobile-database-tree-icon path{fill:none;stroke:currentColor;stroke-width:1.15;vector-effect:non-scaling-stroke;stroke-linecap:square;stroke-linejoin:miter}
      body[data-mobile-database-open="true"] .mobile-database-tree-icon{transform:translateY(2px) rotate(180deg);color:var(--mechanics-ink-strong,var(--reader-text))}
      .mobile-workspace-tabs{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
      .mobile-workspace-tab{font-size:11px !important}
      .mobile-workspace-context{padding:0 12px !important;font-size:8px !important}

      html body .mechanics-shell > #project-index.project-index,
      html body .mechanics-shell > #archive-stage.archive-stage{display:block !important;opacity:1 !important;visibility:visible !important;transition:transform 310ms cubic-bezier(.22,.72,.18,1) !important;will-change:transform}
      html body.mobile-view-instant .mechanics-shell > #project-index.project-index,
      html body.mobile-view-instant .mechanics-shell > #archive-stage.archive-stage{transition:none !important}
      html body[data-mobile-v116-view="works"] .mechanics-shell > #project-index.project-index{transform:translate3d(0,0,0) !important;pointer-events:auto !important}
      html body[data-mobile-v116-view="works"] .mechanics-shell > #archive-stage.archive-stage{transform:translate3d(100%,0,0) !important;pointer-events:none !important}
      html body[data-mobile-v116-view="archive"] .mechanics-shell > #project-index.project-index{transform:translate3d(-100%,0,0) !important;pointer-events:none !important}
      html body[data-mobile-v116-view="archive"] .mechanics-shell > #archive-stage.archive-stage{transform:translate3d(0,0,0) !important;pointer-events:auto !important}

      html body .mechanics-shell > #engineering-index.engineering-index{display:block !important;inset:0 0 auto 0 !important;width:100% !important;height:min(72dvh,calc(100% - 10px)) !important;max-height:calc(100% - 10px) !important;padding:0 10px calc(20px + var(--mobile-safe-bottom)) 0 !important;overflow-x:hidden !important;overflow-y:auto !important;z-index:83 !important;opacity:0 !important;pointer-events:none !important;transform:translate3d(0,calc(-100% - 12px),0) !important;transition:transform 330ms cubic-bezier(.22,.72,.18,1),opacity 190ms ease !important;border-bottom:1px solid var(--reader-line-strong) !important;box-shadow:0 12px 26px color-mix(in srgb,var(--reader-text) 10%,transparent) !important;background:var(--reader-paper) !important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
      html body[data-mobile-database-open="true"] .mechanics-shell > #engineering-index.engineering-index{opacity:1 !important;pointer-events:auto !important;transform:translate3d(0,var(--mobile-db-title-h),0) !important}
      html body .engineering-index .engineering-title{display:none !important}
      html body .engineering-index .engineering-taxonomy{margin:12px 0 24px 20px !important;padding:1px 0 0 14px !important;border-left:1px solid var(--mechanics-tree-line,var(--tree-line)) !important}
      html body .engineering-index .taxonomy-node.is-mobile-collapsed > .taxonomy-children{display:block !important}

      html body #project-index .selection-node.is-project-card > .selection-children{display:block !important;margin:4px 0 3px 9px !important;padding:1px 0 2px 12px !important}
      html body #project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{position:relative !important;min-height:30px !important;padding-left:44px !important;gap:6px !important;align-items:center !important;font-size:11px !important}
      html body #project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{left:0 !important;top:50% !important;width:35px !important;transform:translateY(-50%) !important;white-space:nowrap !important;line-height:1 !important}
      html body #project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash{width:26px !important;flex:0 0 26px !important;margin:0 !important}
      html body #project-index .selection-node.is-selected > .selection-row > .selection-select{color:var(--mechanics-ink-strong,var(--reader-text)) !important;font-weight:500 !important}

      .mobile-archive-back{appearance:none;position:absolute;z-index:68;left:12px;top:18px;width:34px;height:34px;display:none;align-items:center;justify-content:center;border:1px solid var(--reader-line-strong);background:var(--reader-paper);padding:0;color:var(--mechanics-ink,var(--reader-text));font:300 27px/1 "IBM Plex Sans JP",sans-serif;opacity:.92;box-shadow:0 2px 8px var(--reader-shadow)}
      body[data-mobile-v116-view="archive"] .mobile-archive-back{display:flex}
      .mobile-archive-back:active{opacity:1}

      html body #file-extraction-tray.file-extraction-tray{--tray-card-w:clamp(30px,9.2vw,44px) !important;--tray-card-h:clamp(56px,16.8vw,78px) !important;--tray-overlap:clamp(-22px,-4.6vw,-13px) !important;height:calc(104px + var(--mobile-safe-bottom)) !important}
      html body #file-tray-rack.file-tray-rack{top:21px !important;bottom:var(--mobile-safe-bottom) !important;padding:9px 38px 4px !important;gap:0 !important}
      html body #file-tray-rack .file-tray-item{width:var(--tray-card-w) !important;height:var(--tray-card-h) !important;flex:0 0 var(--tray-card-w) !important;margin-left:var(--tray-overlap) !important}
      html body #file-tray-rack .file-tray-item:first-child{margin-left:0 !important}
      html body #file-tray-rack .file-tray-name{font-size:clamp(4.8px,1.35vw,6px) !important;line-height:1.03 !important}
      html body #file-tray-rack .file-tray-index{right:4px !important;bottom:4px !important;font-size:5.3px !important}
      html body .file-tray-nav{top:21px !important;width:30px !important}
      html body .file-tray-nav svg{width:18px !important;height:28px !important}

      @media(prefers-reduced-motion:reduce){html body .mechanics-shell > #project-index.project-index,html body .mechanics-shell > #archive-stage.archive-stage,html body .mechanics-shell > #engineering-index.engineering-index,.mobile-database-tree-icon{transition:none !important}}
    }
  `;
  document.head.appendChild(style);

  const databaseTab = tabs.querySelector('[data-mobile-view-target="database"]');
  databaseTab?.remove();

  const titlebar = document.createElement('div');
  titlebar.className = 'mobile-database-titlebar';
  const toggle = document.createElement('button');
  toggle.id = 'mobile-database-toggle';
  toggle.className = 'mobile-database-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls','engineering-index');
  toggle.setAttribute('aria-expanded','false');
  const title = document.createElement('span');
  title.className = 'mobile-database-title';
  const icon = document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.classList.add('mobile-database-tree-icon');
  icon.setAttribute('viewBox','0 0 28 24');
  icon.setAttribute('aria-hidden','true');
  icon.innerHTML = '<rect x="2.5" y="3.5" width="6" height="6"></rect><path d="M8.5 6.5 H14 V18 M14 11 H20 M14 16 H20"></path><path d="M20 13 L23 16 L20 19"></path>';
  toggle.append(title,icon);
  titlebar.appendChild(toggle);
  nav.insertBefore(titlebar,tabs);

  const back = document.createElement('button');
  back.id = 'mobile-archive-back';
  back.className = 'mobile-archive-back';
  back.type = 'button';
  back.textContent = '‹';
  stage.prepend(back);

  function syncLanguage() {
    const copy = strings[lang()] || strings.zh;
    title.textContent = copy.title;
    toggle.setAttribute('aria-label',copy.title);
    back.setAttribute('aria-label',copy.back);
    back.title = copy.back;
  }

  function setTabState(view) {
    tabs.querySelectorAll('[data-mobile-view-target]').forEach(button => {
      const selected = button.dataset.mobileViewTarget === view;
      button.setAttribute('aria-selected',selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function setView(view, instant = false) {
    if (!mobile()) return;
    baseView = view === 'archive' ? 'archive' : 'works';
    if (instant) document.body.classList.add('mobile-view-instant');
    document.body.dataset.mobileV116View = baseView;
    document.body.dataset.mobileView = baseView;
    setTabState(baseView);
    closeDatabase();
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('mobile-view-instant')));
    dispatchEvent(new Event('resize'));
  }

  function openDatabase() {
    if (!mobile()) return;
    document.body.dataset.mobileDatabaseOpen = 'true';
    toggle.setAttribute('aria-expanded','true');
    expandTrees();
    requestAnimationFrame(() => {
      const target = taxonomy.querySelector('.taxonomy-node.is-target > .taxonomy-row');
      target?.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});
    });
  }

  function closeDatabase() {
    document.body.dataset.mobileDatabaseOpen = 'false';
    toggle.setAttribute('aria-expanded','false');
  }

  function expandTrees() {
    if (!mobile()) return;
    selectionTree.querySelectorAll('.selection-node.is-project-card.is-collapsed').forEach(node => node.classList.remove('is-collapsed'));
    selectionTree.querySelectorAll('.selection-node.is-project-card .selection-project-select[aria-expanded]').forEach(button => button.setAttribute('aria-expanded','true'));
    taxonomy.querySelectorAll('.taxonomy-node.is-mobile-collapsed').forEach(node => node.classList.remove('is-mobile-collapsed'));
    taxonomy.querySelectorAll('.taxonomy-row[aria-expanded]').forEach(row => {
      row.setAttribute('aria-expanded','true');
      const dash = row.querySelector(':scope > .tree-dash');
      if (dash) dash.textContent = '−';
    });
  }

  toggle.addEventListener('click', event => {
    event.preventDefault();
    if (document.body.dataset.mobileDatabaseOpen === 'true') closeDatabase();
    else openDatabase();
  });

  back.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const works = tabs.querySelector('[data-mobile-view-target="works"]');
    works?.click();
    setView('works');
  });

  document.addEventListener('click', event => {
    if (!mobile()) return;
    const leaf = event.target.closest('#selection-tree .selection-select');
    if (leaf) {
      setTimeout(() => { expandTrees(); setView('archive'); },0);
      return;
    }
    const taxonomyRow = event.target.closest('#engineering-taxonomy .taxonomy-row');
    if (taxonomyRow) {
      const keep = baseView;
      setTimeout(() => {
        baseView = keep;
        document.body.dataset.mobileView = keep;
        document.body.dataset.mobileV116View = keep;
        setTabState(keep);
        expandTrees();
        openDatabase();
      },0);
      return;
    }
    const tab = event.target.closest('#mobile-workspace-nav [data-mobile-view-target]');
    if (tab) {
      const view = tab.dataset.mobileViewTarget === 'archive' ? 'archive' : 'works';
      setTimeout(() => { expandTrees(); setView(view); },0);
    }
  },true);

  document.addEventListener('pointerdown', event => {
    if (!mobile() || document.body.dataset.mobileDatabaseOpen !== 'true') return;
    if (engineeringIndex.contains(event.target) || toggle.contains(event.target)) return;
    closeDatabase();
  },true);

  const bodyObserver = new MutationObserver(() => {
    if (!mobile() || syncing) return;
    const coreView = document.body.dataset.mobileView;
    if (coreView === 'database') {
      syncing = true;
      document.body.dataset.mobileView = baseView;
      document.body.dataset.mobileV116View = baseView;
      setTabState(baseView);
      queueMicrotask(() => { syncing = false; });
    } else if (coreView === 'works' || coreView === 'archive') {
      baseView = coreView;
      document.body.dataset.mobileV116View = baseView;
      setTabState(baseView);
    }
  });
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['data-mobile-view']});

  const treeObserver = new MutationObserver(() => requestAnimationFrame(expandTrees));
  treeObserver.observe(selectionTree,{childList:true,subtree:true});
  treeObserver.observe(taxonomy,{childList:true,subtree:true});

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.dataset.mobileDatabaseOpen === 'true') closeDatabase();
  });
  addEventListener('ruinlanguagechange',syncLanguage);
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change',() => {
    if (mobile()) { setView(baseView,true); expandTrees(); }
    else {
      document.body.removeAttribute('data-mobile-v116-view');
      document.body.removeAttribute('data-mobile-database-open');
    }
  });

  syncLanguage();
  if (mobile()) {
    const initial = document.body.dataset.mobileView === 'archive' ? 'archive' : 'works';
    setView(initial,true);
    expandTrees();
  }
})();

/* v118 presentation layer (formerly mechanics-mobile-v118.js). */
(() => {
  'use strict';

  const mq = matchMedia('(max-width:800px)');
  const topbar = document.querySelector('.mechanics-topbar');
  const nav = document.getElementById('mobile-workspace-nav');
  const tabs = nav?.querySelector('.mobile-workspace-tabs');
  const engineeringIndex = document.getElementById('engineering-index');
  const taxonomy = document.getElementById('engineering-taxonomy');
  const titlebar = nav?.querySelector('.mobile-database-titlebar');
  const toggle = titlebar?.querySelector('#mobile-database-toggle');
  const title = toggle?.querySelector('.mobile-database-title');
  if (!topbar || !nav || !tabs || !engineeringIndex || !taxonomy || !titlebar || !toggle || !title) return;
  if (document.getElementById('mechanics-mobile-v118-style')) return;

  const oldIcon = toggle.querySelector('.mobile-database-tree-icon');
  oldIcon?.remove();

  const rootSquare = document.createElement('span');
  rootSquare.className = 'mobile-database-root-square';
  rootSquare.setAttribute('aria-hidden','true');
  toggle.prepend(rootSquare);

  titlebar.classList.add('mobile-database-titlebar-v118');
  topbar.prepend(titlebar);

  const handlebar = document.createElement('div');
  handlebar.className = 'mobile-database-handlebar';
  const handle = document.createElement('button');
  handle.id = 'mobile-database-handle';
  handle.className = 'mobile-database-handle';
  handle.type = 'button';
  handle.setAttribute('aria-controls','engineering-index');
  handle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') || 'false');
  handle.setAttribute('aria-label', toggle.getAttribute('aria-label') || title.textContent || 'database');
  handle.innerHTML = `
    <svg class="mobile-database-handle-icon" viewBox="0 0 46 30" aria-hidden="true">
      <rect class="handle-root" x="2.5" y="3.5" width="9" height="9"></rect>
      <path class="handle-branch" d="M11.5 8 H21 V22 H34 M21 15 H29"></path>
      <path class="handle-arrow" d="M29 17 L35 22 L29 27"></path>
    </svg>`;
  handlebar.appendChild(handle);
  nav.insertBefore(handlebar, tabs);

  handle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    toggle.click();
  });

  toggle.addEventListener('click', () => {
    requestAnimationFrame(() => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      handle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });

  const bodyObserver = new MutationObserver(() => {
    const expanded = document.body.dataset.mobileDatabaseOpen === 'true';
    handle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['data-mobile-database-open']});

  const languageObserver = new MutationObserver(() => {
    handle.setAttribute('aria-label', toggle.getAttribute('aria-label') || title.textContent || 'database');
  });
  languageObserver.observe(title,{childList:true,characterData:true,subtree:true});

  const style = document.createElement('style');
  style.id = 'mechanics-mobile-v118-style';
  style.textContent = `
    .mobile-database-handlebar{display:none}

    @media(max-width:800px){
      :root{
        --mobile-topbar-h:78px !important;
        --mobile-workspace-h:122px !important;
        --mobile-db-handle-h:44px;
        --mobile-tab-h:44px;
        --mobile-context-h:34px;
        --mobile-shell-top:calc(var(--mobile-safe-top) + var(--mobile-topbar-h) + var(--mobile-workspace-h)) !important
      }

      html body .mechanics-topbar{
        height:calc(var(--mobile-safe-top) + var(--mobile-topbar-h)) !important;
        padding:var(--mobile-safe-top) 11px 0 !important;
        justify-content:flex-end !important;
        align-items:flex-start !important;
        gap:12px !important;
        border-bottom:0 !important;
        overflow:visible !important
      }
      html body .mechanics-topbar .reader-tone-control{
        height:46px !important;
        margin:0 !important;
        padding-top:11px !important;
        flex:0 0 auto
      }
      html body .mechanics-topbar .reader-tone-track-wrap,
      html body .mechanics-topbar .reader-tone-slider{
        width:clamp(76px,15vw,98px) !important;
        height:27px !important
      }
      html body .mechanics-topbar .reader-tone-warm-mark{top:11px !important}
      html body .mechanics-topbar .language-switch{
        height:46px !important;
        align-items:center !important;
        padding-top:2px !important;
        flex:0 0 auto
      }

      .mobile-database-titlebar.mobile-database-titlebar-v118{
        display:flex !important;
        position:absolute !important;
        z-index:96 !important;
        left:15px !important;
        top:var(--mobile-safe-top) !important;
        width:min(58vw,365px) !important;
        height:62px !important;
        min-width:0 !important;
        border:0 !important;
        background:transparent !important;
        pointer-events:auto
      }
      .mobile-database-titlebar-v118 .mobile-database-toggle{
        appearance:none !important;
        width:auto !important;
        max-width:100% !important;
        height:62px !important;
        padding:0 !important;
        border:0 !important;
        background:transparent !important;
        display:flex !important;
        align-items:center !important;
        justify-content:flex-start !important;
        gap:13px !important;
        color:var(--mechanics-ink-strong,var(--reader-text)) !important;
        font:500 clamp(20px,5vw,30px)/1.04 "IBM Plex Sans JP","Noto Sans SC",sans-serif !important;
        letter-spacing:.015em !important;
        white-space:nowrap !important;
        text-align:left !important
      }
      html[data-lang="en"] .mobile-database-titlebar-v118 .mobile-database-toggle{
        font-size:clamp(13px,3.1vw,19px) !important;
        letter-spacing:.005em !important
      }
      html[data-lang="ja"] .mobile-database-titlebar-v118 .mobile-database-toggle{
        font-size:clamp(17px,4.1vw,24px) !important
      }
      .mobile-database-titlebar-v118 .mobile-database-title{
        display:block !important;
        min-width:0 !important;
        overflow:visible !important;
        text-overflow:clip !important;
        white-space:nowrap !important
      }
      .mobile-database-root-square{
        display:block;
        width:clamp(18px,3.9vw,25px);
        height:clamp(18px,3.9vw,25px);
        flex:0 0 clamp(18px,3.9vw,25px);
        background:var(--mechanics-ink-strong,var(--reader-text))
      }

      .mobile-workspace-nav{
        top:calc(var(--mobile-safe-top) + var(--mobile-topbar-h)) !important;
        height:var(--mobile-workspace-h) !important;
        grid-template-rows:var(--mobile-db-handle-h) var(--mobile-tab-h) var(--mobile-context-h) !important;
        z-index:86 !important;
        overflow:visible !important;
        background:var(--reader-paper) !important
      }
      .mobile-database-handlebar{
        display:flex;
        align-items:center;
        height:var(--mobile-db-handle-h);
        border-bottom:1px solid var(--reader-line);
        background:var(--reader-paper)
      }
      .mobile-database-handle{
        appearance:none;
        width:70px;
        height:100%;
        padding:0 0 0 22px;
        border:0;
        background:transparent;
        display:flex;
        align-items:center;
        justify-content:flex-start;
        color:var(--mechanics-ink-soft,var(--reader-muted))
      }
      .mobile-database-handle-icon{
        width:40px;
        height:28px;
        overflow:visible
      }
      .mobile-database-handle-icon .handle-root{
        fill:var(--mechanics-ink-strong,var(--reader-text));
        stroke:none
      }
      .mobile-database-handle-icon .handle-branch,
      .mobile-database-handle-icon .handle-arrow{
        fill:none;
        stroke:var(--mechanics-ink-soft,var(--reader-muted));
        stroke-width:1.15;
        vector-effect:non-scaling-stroke;
        stroke-linecap:square;
        stroke-linejoin:miter
      }
      .mobile-database-handle[aria-expanded="true"] .handle-branch,
      .mobile-database-handle[aria-expanded="true"] .handle-arrow{
        stroke:var(--mechanics-ink-strong,var(--reader-text))
      }
      .mobile-workspace-tabs{
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        min-height:var(--mobile-tab-h) !important
      }
      .mobile-workspace-tab{font-size:11px !important}
      .mobile-workspace-context{
        min-height:var(--mobile-context-h) !important;
        padding:0 13px !important;
        font-size:8px !important
      }

      html body[data-mobile-database-open="true"] .mechanics-shell{
        z-index:94 !important;
        overflow:visible !important
      }
      html body .mechanics-shell > #engineering-index.engineering-index{
        display:block !important;
        top:calc(0px - var(--mobile-workspace-h)) !important;
        left:0 !important;
        right:0 !important;
        bottom:auto !important;
        width:100% !important;
        height:calc(100% + var(--mobile-workspace-h)) !important;
        max-height:none !important;
        margin:0 !important;
        padding:0 10px calc(30px + var(--mobile-safe-bottom)) 0 !important;
        overflow-x:hidden !important;
        overflow-y:auto !important;
        z-index:95 !important;
        opacity:0 !important;
        pointer-events:none !important;
        transform:translate3d(0,calc(-100% - 12px),0) !important;
        transition:transform 360ms cubic-bezier(.22,.72,.18,1),opacity 170ms ease !important;
        border:0 !important;
        box-shadow:none !important;
        background:var(--reader-paper) !important;
        background-image:none !important;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch
      }
      html body[data-mobile-database-open="true"] .mechanics-shell > #engineering-index.engineering-index{
        opacity:1 !important;
        pointer-events:auto !important;
        transform:translate3d(0,0,0) !important
      }
      html body .engineering-index .engineering-title{display:none !important}
      html body .engineering-index::before{display:none !important}
      html body .engineering-index .engineering-taxonomy{
        margin:0 0 28px 20px !important;
        padding:1px 0 36px 30px !important;
        border-left:1px solid var(--mechanics-tree-line,var(--tree-line)) !important
      }
      html body .engineering-index .engineering-taxonomy > .taxonomy-node > .taxonomy-row::before{
        left:-30px !important;
        width:30px !important;
        border-top-color:var(--mechanics-tree-line,var(--tree-line)) !important
      }
      html body .engineering-index .taxonomy-row{
        min-height:48px !important;
        height:auto !important;
        gap:7px !important;
        padding:0 !important;
        overflow:visible !important;
        color:var(--mechanics-ink-soft,var(--reader-muted)) !important;
        scroll-margin-top:12px !important
      }
      html body .engineering-index .taxonomy-row .tree-dash{
        width:18px !important;
        flex:0 0 18px !important;
        min-height:48px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        color:var(--mechanics-ink-faint,var(--reader-faint)) !important;
        font-size:12px !important;
        font-weight:300 !important;
        opacity:1 !important
      }
      html body .engineering-index .taxonomy-label{
        color:inherit !important;
        font-size:15px !important;
        font-weight:300 !important;
        line-height:1.22 !important;
        transform:none !important;
        opacity:.72 !important
      }
      html body .engineering-index .engineering-taxonomy > .taxonomy-node > .taxonomy-row .taxonomy-label{
        font-size:16px !important;
        font-weight:300 !important;
        opacity:.78 !important
      }
      html body .engineering-index .taxonomy-children{
        margin-left:12px !important;
        padding-left:25px !important;
        border-left:1px solid var(--mechanics-tree-line,var(--tree-line)) !important
      }
      html body .engineering-index .taxonomy-node.is-mobile-collapsed > .taxonomy-children{
        display:block !important
      }
      html body .engineering-index .taxonomy-node.is-route > .taxonomy-row,
      html body .engineering-index .taxonomy-node.is-target > .taxonomy-row{
        color:var(--mechanics-ink-strong,var(--reader-text)) !important;
        font-weight:400 !important
      }
      html body .engineering-index .taxonomy-node.is-route > .taxonomy-row .taxonomy-label,
      html body .engineering-index .taxonomy-node.is-target > .taxonomy-row .taxonomy-label{
        opacity:1 !important;
        font-weight:400 !important
      }

      @media(max-width:430px){
        .mobile-database-titlebar.mobile-database-titlebar-v118{width:min(59vw,238px) !important}
        .mobile-database-titlebar-v118 .mobile-database-toggle{gap:9px !important}
        html body .mechanics-topbar .reader-tone-track-wrap,
        html body .mechanics-topbar .reader-tone-slider{width:76px !important}
        html body .mechanics-topbar{gap:8px !important;padding-right:8px !important}
        html body .mechanics-topbar .language-switch{font-size:8px !important}
      }

      @media(prefers-reduced-motion:reduce){
        html body .mechanics-shell > #engineering-index.engineering-index{transition:none !important}
      }
    }
  `;
  document.head.appendChild(style);

  if (mq.matches) {
    taxonomy.querySelectorAll('.taxonomy-node.is-mobile-collapsed').forEach(node => node.classList.remove('is-mobile-collapsed'));
  }
})();
