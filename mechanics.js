(() => {
  'use strict';

  const D = window.RUINWRIGHT_ENGINEERING_ARCHIVE;
  const RL = window.RuinLanguage;
  if (!D || !RL) return;

  const UI = {
    title:{zh:'墟构工程总数据库',en:'Ruinwright Engineering Database',ja:'墟構工程総データベース'},
    engineeringDatabase:{zh:'墟构工程总数据库',en:'Ruinwright Engineering Database',ja:'墟構工程総データベース'},
    manifesto:{zh:'墟构师宣言 ↗',en:'Manifesto ↗',ja:'墟構師宣言 ↗'},
    archive:{zh:'遗构馆 ↗',en:'Relic Archive ↗',ja:'遺構館 ↗'},
    worksSegments:{zh:'作品 / 档案段',en:'Works / archive sections',ja:'作品 / アーカイブ区分'},
    browseByWork:{zh:'按作品检索',en:'Browse by work',ja:'作品から検索'},
    mobileWorks:{zh:'作品',en:'Works',ja:'作品'},
    mobileDatabase:{zh:'数据库',en:'Database',ja:'データベース'},
    mobileArchive:{zh:'档案',en:'Archive',ja:'アーカイブ'},
    mobilePathEmpty:{zh:'未选择技术点',en:'No technical point selected',ja:'技術点未選択'},
    databaseIntro:{zh:'这里收集以「墟构」为目的的创作手法，包括建造废墟园林所用的工法、相关技术、工作记录与实践经验。',en:'A collection of creative methods for Ruinwrighting, including construction methods for Folly works, related techniques, work records, and practical experience.',ja:'「墟構」を目的とする創作手法を集めています。フォリーをつくるための工法、関連技術、作業記録、実践上の経験などを収録します。'},
    projectPrompt:{zh:'该作品已展开。选择其中一个技术点，可继续进入中央数据库并查看对应实践档案。',en:'This work is open. Choose a technical point to enter the central database and inspect its practice records.',ja:'この作品を展開しました。技術点を選ぶと中央データベースへ進み、対応する実践記録を閲覧できます。'},
    choose:{zh:'从左侧按作品检索，或直接翻阅中部工程数据库',en:'Browse by work on the left, or enter the engineering database directly',ja:'左側で作品から検索するか、中央の工程データベースを直接閲覧'},
    emptyTitle:{zh:'未选择工程档案',en:'No engineering archive selected',ja:'工程アーカイブ未選択'},
    emptyNote:{zh:'左侧是作品检索；中部数据库本身也可直接点击、翻阅。档案文件只在选中后加载。',en:'The left column is a work index; the central database can also be browsed directly. Files load only after selection.',ja:'左側は作品検索、中央のデータベース自体も直接閲覧できます。ファイルは選択後に読み込みます。'},
    noCategoryRecords:{zh:'这一工程分类目前尚未收入可查看档案。可继续翻阅中部目录，或从左侧按作品检索。',en:'This engineering category does not yet contain a viewable archive. Continue through the central tree or browse by work on the left.',ja:'この工程分類には、まだ閲覧可能な記録がありません。中央のツリーを続けて閲覧するか、左側から作品で検索してください。'},
    openSource:{zh:'放大浏览',en:'Enlarge view',ja:'拡大表示'},
    closeZoom:{zh:'关闭 ×',en:'Close ×',ja:'閉じる ×'},
    loading:{zh:'档案就位中',en:'PREPARING ARCHIVE',ja:'アーカイブ準備中'},
    missing:{zh:'档案文件暂不可用',en:'ARCHIVE UNAVAILABLE',ja:'アーカイブを読み込めません'},
    heic:{zh:'HEIC 原始图像',en:'Original HEIC image',ja:'HEIC 原画像'},
    heicHint:{zh:'浏览器可能无法直接预览 HEIC；原文件仍可打开。',en:'This browser may not preview HEIC directly; the source file remains available.',ja:'HEICを直接表示できない場合があります。原ファイルは開けます。'}
  };

  const $ = id => document.getElementById(id);
  const selectionTree = $('selection-tree');
  const taxonomyRoot = $('engineering-taxonomy');
  const stage = $('archive-stage');
  const stack = $('sheet-stack');
  const connector = $('directory-connector');
  const connectorPath = $('directory-connector-path');
  const projectIndex = $('project-index');
  const engineeringIndex = $('engineering-index');
  const mobileNav = $('mobile-workspace-nav');
  const mobileContext = $('mobile-workspace-context');
  const mobileArchiveCount = $('mobile-archive-count');

  let lang = RL.read();
  let activeSelection = null;
  let activeRecordIndex = 0;
  let activeProjectId = null;
  let connectorRaf = 0;
  let wheelLock = 0;
  let mobileView = 'works';
  const mobileQuery = matchMedia('(max-width:800px)');

  const selectionById = new Map();
  const selectionParent = new Map();
  const taxonomyById = new Map();
  const taxonomyParent = new Map();

  const local = value => typeof value === 'string'
    ? value
    : (value?.[lang] ?? value?.zh ?? '');

  function indexTree(nodes, byId, parentMap, parent = null) {
    (nodes || []).forEach(node => {
      byId.set(node.id, node);
      if (parent) parentMap.set(node.id, parent.id);
      if (node.children) indexTree(node.children, byId, parentMap, node);
    });
  }

  function buildIndexes() {
    selectionById.clear();
    selectionParent.clear();
    taxonomyById.clear();
    taxonomyParent.clear();
    D.selectionGroups.forEach(group => indexTree(group.entries, selectionById, selectionParent));
    indexTree(D.taxonomy, taxonomyById, taxonomyParent);
  }

  function routeSet(id, parentMap) {
    const out = new Set();
    while (id) {
      out.add(id);
      id = parentMap.get(id) || null;
    }
    return out;
  }

  function projectRootId(selectionId) {
    let id = selectionId;
    let parent = selectionParent.get(id) || null;
    while (parent) {
      id = parent;
      parent = selectionParent.get(id) || null;
    }
    return id || null;
  }

  function projectTaxonomyRoute(projectId) {
    const route = new Set();
    const root = selectionById.get(projectId);
    const collect = node => {
      if (!node) return;
      if (node.taxonomy) {
        routeSet(node.taxonomy, taxonomyParent).forEach(id => route.add(id));
      }
      (node.children || []).forEach(collect);
    };
    collect(root);
    return route;
  }

  function taxonomyScope(id) {
    const scope = new Set();
    const root = taxonomyById.get(id);
    const walk = node => {
      if (!node) return;
      scope.add(node.id);
      (node.children || []).forEach(walk);
    };
    walk(root);
    return scope;
  }

  function selectableNodes() {
    return [...selectionById.values()].filter(node => node.taxonomy && node.records?.length);
  }

  function matchingSelectionNodes(taxonomyId) {
    const scope = taxonomyScope(taxonomyId);
    return selectableNodes().filter(node => scope.has(node.taxonomy));
  }

  function browseRouteForTaxonomy(taxonomyId) {
    const out = new Set();
    matchingSelectionNodes(taxonomyId).forEach(node => {
      routeSet(node.id, selectionParent).forEach(id => out.add(id));
    });
    return out;
  }

  // v115 mobile workspace helpers
  function isMobileLayout() {
    return mobileQuery.matches;
  }

  function mobileContextText() {
    if (activeSelection?.isTaxonomyBrowse && activeSelection.taxonomy) {
      const parts = taxonomyPath(activeSelection.taxonomy);
      return parts.slice(-3).join(' / ') || local(activeSelection.label);
    }
    if (activeSelection) {
      return [ownerLabel(activeSelection), local(activeSelection.label)].filter(Boolean).join(' / ');
    }
    if (activeProjectId) {
      const project = selectionById.get(activeProjectId);
      return project ? local(project.label) : UI.mobilePathEmpty[lang];
    }
    return UI.mobilePathEmpty[lang];
  }

  function updateMobileWorkspace() {
    if (!mobileNav) return;
    if (!isMobileLayout()) {
      document.body.removeAttribute('data-mobile-view');
      return;
    }

    const view = document.body.dataset.mobileView || mobileView || 'works';
    mobileNav.querySelectorAll('[data-mobile-view-target]').forEach(button => {
      const selected = button.dataset.mobileViewTarget === view;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });

    if (mobileContext) mobileContext.textContent = mobileContextText();
    if (mobileArchiveCount) {
      const count = activeSelection?.records?.length || 0;
      mobileArchiveCount.hidden = count < 1;
      mobileArchiveCount.textContent = count ? String(count) : '';
    }
  }

  function focusMobileTaxonomyTarget(behavior = 'smooth') {
    if (!isMobileLayout()) return;
    const target = taxonomyRoot.querySelector('.taxonomy-node.is-target > .taxonomy-row');
    if (!target) return;
    target.scrollIntoView({block:'center', inline:'nearest', behavior});
  }

  function setMobileView(view, options = {}) {
    if (!isMobileLayout() || !mobileNav) return;
    const next = ['works','database','archive'].includes(view) ? view : 'works';
    mobileView = next;
    document.body.dataset.mobileView = next;
    updateMobileWorkspace();

    requestAnimationFrame(() => {
      if (next === 'database') {
        focusMobileTaxonomyTarget(options.instant ? 'auto' : 'smooth');
      } else if (next === 'works' && activeProjectId) {
        const card = selectionTree.querySelector(`[data-selection-node="${CSS.escape(activeProjectId)}"]`);
        card?.scrollIntoView({block:'nearest', inline:'nearest', behavior:options.instant ? 'auto' : 'smooth'});
      }
      // The legacy geometry/fitting overlay listens for resize; switching panels
      // changes which surface has measurable dimensions, so refresh it once.
      dispatchEvent(new Event('resize'));
    });
  }

  function bindMobileWorkspace() {
    if (!mobileNav) return;

    mobileNav.addEventListener('click', event => {
      const button = event.target.closest('[data-mobile-view-target]');
      if (!button) return;
      setMobileView(button.dataset.mobileViewTarget);
    });

    const onMediaChange = () => {
      if (isMobileLayout()) {
        const next = activeSelection ? 'database' : 'works';
        setMobileView(next, {instant:true});
      } else {
        document.body.removeAttribute('data-mobile-view');
        mobileView = 'works';
        updateMobileWorkspace();
      }
      renderTaxonomy();
    };

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', onMediaChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(onMediaChange);
    }

    if (isMobileLayout()) setMobileView('works', {instant:true});
  }

  function selectionNode(node, depth, route, categoryLabel = '') {
    const isProjectCard = Boolean(categoryLabel);
    const wrap = document.createElement('div');
    wrap.className = `selection-node ${node.children ? 'selection-branch' : 'selection-leaf'}`;
    wrap.dataset.selectionNode = node.id;
    wrap.style.setProperty('--tree-depth', depth);

    if (isProjectCard) {
      wrap.dataset.categoryLabel = categoryLabel;
      wrap.classList.add('has-category-label','is-project-card');
    }

    if (route.has(node.id)) wrap.classList.add('is-selected-route');
    if (activeProjectId === node.id) wrap.classList.add('is-card-selected');
    if (!activeSelection?.isTaxonomyBrowse && activeSelection?.id === node.id) {
      wrap.classList.add('is-selected');
    }

    const row = document.createElement('div');
    row.className = 'selection-row';

    const dash = document.createElement('span');
    dash.className = 'tree-dash';
    dash.textContent = '−';
    row.appendChild(dash);

    const button = document.createElement('button');
    button.type = 'button';

    if (node.taxonomy && node.records?.length) {
      button.className = 'selection-select';
      button.dataset.selectionId = node.id;
      button.dataset.recordCount = String(node.records.length);
      button.textContent = local(node.label);
      button.addEventListener('click', event => {
        event.stopPropagation();
        selectArchive(node);
      });
    } else if (isProjectCard) {
      const expanded = activeProjectId === node.id;
      wrap.classList.toggle('is-collapsed', !expanded);
      button.className = 'selection-project-select';
      button.textContent = local(node.label);
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.addEventListener('click', event => {
        event.stopPropagation();
        selectProjectCard(node);
      });
      // The pale register itself is a hit target, including its category strip.
      wrap.addEventListener('click', event => {
        if (event.target.closest('.selection-children')) return;
        if (event.target.closest('.selection-select')) return;
        if (event.target === button || button.contains(event.target)) return;
        selectProjectCard(node);
      });
    } else {
      button.className = 'selection-branch-label';
      button.textContent = local(node.label);
      button.setAttribute('aria-expanded', 'true');
      button.addEventListener('click', event => {
        event.stopPropagation();
        const collapsed = wrap.classList.toggle('is-collapsed');
        button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        scheduleConnector();
      });
    }

    row.appendChild(button);
    wrap.appendChild(row);

    if (node.children?.length) {
      const children = document.createElement('div');
      children.className = 'selection-children';
      node.children.forEach(child => children.appendChild(selectionNode(child, depth + 1, route)));
      wrap.appendChild(children);
    }

    return wrap;
  }

  function renderSelection() {
    let route = new Set();
    if (activeSelection?.isTaxonomyBrowse) {
      route = browseRouteForTaxonomy(activeSelection.taxonomy);
    } else if (activeSelection?.id) {
      route = routeSet(activeSelection.id, selectionParent);
    }

    selectionTree.replaceChildren();

    D.selectionGroups.forEach(group => {
      const section = document.createElement('section');
      section.className = `selection-group ${group.treeLabel ? 'selection-group-tree-label' : ''}`;
      const categoryLabel = group.treeLabel
        ? local({zh:'草图项目',en:'Sketch project',ja:'スケッチプロジェクト'})
        : local({zh:'废墟园林作品',en:'Folly work',ja:'フォリー作品'});

      if (group.treeLabel) {
        const heading = document.createElement('div');
        heading.className = 'selection-group-heading';
        const dash = document.createElement('span');
        dash.className = 'tree-dash';
        dash.textContent = '−';
        const text = document.createElement('span');
        text.textContent = local(group.label);
        heading.append(dash, text);
        section.appendChild(heading);
      }

      const nodes = document.createElement('div');
      nodes.className = 'selection-group-nodes';
      (group.entries || []).forEach(node => {
        nodes.appendChild(selectionNode(node, group.treeLabel ? 1 : 0, route, categoryLabel));
      });
      section.appendChild(nodes);
      selectionTree.appendChild(section);
    });
  }

  function taxonomyNode(node, route) {
    const wrap = document.createElement('div');
    wrap.className = `taxonomy-node ${node.children ? 'taxonomy-branch' : 'taxonomy-leaf'}`;
    wrap.dataset.taxonomyNode = node.id;

    if (route.has(node.id)) wrap.classList.add('is-route');
    if (activeSelection?.taxonomy === node.id) wrap.classList.add('is-target');

    const isMobileBranch = isMobileLayout() && Boolean(node.children?.length);
    const mobileBranchOpen = !isMobileBranch || Boolean(activeSelection?.taxonomy && route.has(node.id));
    if (isMobileBranch && !mobileBranchOpen) wrap.classList.add('is-mobile-collapsed');

    const row = document.createElement('div');
    row.className = 'taxonomy-row';
    row.dataset.taxonomyId = node.id;
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-pressed', activeSelection?.isTaxonomyBrowse && activeSelection.taxonomy === node.id ? 'true' : 'false');
    row.setAttribute('aria-label', local(node.label));
    if (isMobileBranch) row.setAttribute('aria-expanded', mobileBranchOpen ? 'true' : 'false');

    const dash = document.createElement('span');
    dash.className = 'tree-dash';
    dash.textContent = isMobileBranch ? (mobileBranchOpen ? '−' : '+') : '−';

    const label = document.createElement('span');
    label.className = 'taxonomy-label';
    label.textContent = local(node.label);

    row.append(dash, label);
    row.addEventListener('click', () => selectTaxonomy(node));
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectTaxonomy(node);
      }
    });
    wrap.appendChild(row);

    if (node.children?.length) {
      const children = document.createElement('div');
      children.className = 'taxonomy-children';
      node.children.forEach(child => children.appendChild(taxonomyNode(child, route)));
      wrap.appendChild(children);
    }

    return wrap;
  }

  function renderTaxonomy() {
    let route = activeSelection?.taxonomy
      ? routeSet(activeSelection.taxonomy, taxonomyParent)
      : new Set();
    if (!activeSelection?.taxonomy && activeProjectId) {
      route = projectTaxonomyRoute(activeProjectId);
    }
    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));
    updateMobileWorkspace();
  }

  function taxonomyPath(id) {
    const ids = [];
    while (id) {
      ids.unshift(id);
      id = taxonomyParent.get(id) || null;
    }
    return ids.map(key => local(taxonomyById.get(key)?.label)).filter(Boolean);
  }

  function ownerLabel(selection) {
    if (!selection) return '';
    let id = selection.id;
    let owner = null;
    while (id) {
      const parent = selectionParent.get(id);
      if (!parent) break;
      owner = selectionById.get(parent);
      id = parent;
    }
    return owner ? local(owner.label) : local(selection.label);
  }

  function cornerMarks() {
    const frag = document.createDocumentFragment();
    ['a','b','c','d'].forEach(key => {
      const mark = document.createElement('span');
      mark.className = `sheet-register reg-${key}`;
      frag.appendChild(mark);
    });
    return frag;
  }

  function renderEmpty() {
    stack.className = 'sheet-stack is-empty';
    stack.replaceChildren();

    const sheet = document.createElement('article');
    sheet.className = 'archive-sheet empty-sheet';

    const visual = document.createElement('div');
    visual.className = 'sheet-visual';
    visual.appendChild(cornerMarks());

    const empty = document.createElement('div');
    empty.className = 'empty-drawing';
    const symbol = document.createElement('span');
    symbol.className = 'empty-symbol';
    const hint = document.createElement('small');
    const activeProject = activeProjectId ? selectionById.get(activeProjectId) : null;
    hint.textContent = activeSelection?.isTaxonomyBrowse
      ? local(activeSelection.label)
      : activeProject
        ? local(activeProject.label)
        : UI.choose[lang];
    empty.append(symbol, hint);
    visual.appendChild(empty);

    const footer = document.createElement('footer');
    footer.className = 'sheet-footer';
    const main = document.createElement('div');
    main.className = 'sheet-footer-main';
    const title = document.createElement('div');
    title.className = 'sheet-title';
    title.textContent = activeSelection?.isTaxonomyBrowse
      ? local(activeSelection.label)
      : activeProject
        ? local(activeProject.label)
        : UI.emptyTitle[lang];
    const note = document.createElement('div');
    note.className = 'sheet-note';
    note.textContent = activeSelection?.isTaxonomyBrowse
      ? UI.noCategoryRecords[lang]
      : activeProject
        ? UI.projectPrompt[lang]
        : UI.emptyNote[lang];
    main.append(title, note);
    footer.appendChild(main);
    sheet.append(visual, footer);
    stack.appendChild(sheet);
  }

  function loading(host) {
    const el = document.createElement('div');
    el.className = 'sheet-loading';
    el.textContent = UI.loading[lang];
    host.replaceChildren(el);
  }

  function fileCard(host, record, title, copy = '') {
    const card = document.createElement('div');
    card.className = 'sheet-file-card';
    const ext = document.createElement('span');
    ext.className = 'sheet-file-extension';
    ext.textContent = (record.asset?.filename || record.asset?.src || 'FILE').split('.').pop().toUpperCase();
    const h = document.createElement('strong');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = copy;
    card.append(ext, h, p);
    host.replaceChildren(card);
  }

  function resetAdaptiveSheet() {
    ['--adaptive-sheet-w','--adaptive-sheet-h','--adaptive-sheet-right','--adaptive-sheet-bottom'].forEach(name => {
      stack.style.removeProperty(name);
    });
    delete stack.dataset.assetRatio;
  }

  function fitAdaptiveSheet(ratio = 1.35) {
    if (!stack.classList.contains('is-selected')) return;
    const stageRect = stage.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    const compact = innerWidth <= 800;
    const tray = document.getElementById('file-extraction-tray');
    const trayHeight = tray?.getBoundingClientRect().height || (compact ? 138 : 154);
    const topGuard = compact ? 18 : Math.max(42, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 60);
    const footerHeight = compact ? 76 : 84;
    const frameInset = compact ? 24 : 32;
    const safeRatio = Math.max(.42, Math.min(2.8, Number(ratio) || 1.35));

    const availableW = Math.max(260, stageRect.width - (compact ? 28 : 72));
    const availableH = Math.max(330, stageRect.height - trayHeight - topGuard - 24);
    const maxVisualW = availableW - frameInset;
    const maxVisualH = Math.max(160, availableH - footerHeight - 18);

    let visualW = Math.min(maxVisualW, maxVisualH * safeRatio);
    let visualH = visualW / safeRatio;
    if (visualH > maxVisualH) {
      visualH = maxVisualH;
      visualW = visualH * safeRatio;
    }

    const minSheetW = compact ? Math.min(availableW, 286) : Math.min(availableW, 410);
    const sheetW = Math.max(minSheetW, Math.min(availableW, visualW + frameInset));
    const sheetH = Math.max(compact ? 310 : 350, Math.min(availableH, visualH + footerHeight + 18));
    const right = Math.max(compact ? 14 : 20, (stageRect.width - sheetW) / 2);
    const freeVertical = Math.max(0, stageRect.height - trayHeight - topGuard - sheetH);
    const bottom = trayHeight + Math.max(compact ? 12 : 18, freeVertical / 2);

    stack.style.setProperty('--adaptive-sheet-w', `${sheetW.toFixed(1)}px`);
    stack.style.setProperty('--adaptive-sheet-h', `${sheetH.toFixed(1)}px`);
    stack.style.setProperty('--adaptive-sheet-right', `${right.toFixed(1)}px`);
    stack.style.setProperty('--adaptive-sheet-bottom', `${bottom.toFixed(1)}px`);
    stack.dataset.assetRatio = String(safeRatio);
  }

  let zoomViewer = null;
  let zoomContent = null;
  function ensureZoomViewer() {
    if (zoomViewer?.isConnected) return zoomViewer;
    zoomViewer = document.createElement('div');
    zoomViewer.className = 'mechanics-zoom-viewer';
    zoomViewer.setAttribute('aria-hidden','true');
    zoomViewer.setAttribute('role','dialog');
    zoomViewer.setAttribute('aria-modal','true');

    const toolbar = document.createElement('div');
    toolbar.className = 'mechanics-zoom-toolbar';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'mechanics-zoom-close';
    close.textContent = UI.closeZoom[lang];
    close.addEventListener('click', closeZoomViewer);
    toolbar.appendChild(close);

    zoomContent = document.createElement('div');
    zoomContent.className = 'mechanics-zoom-content';
    zoomViewer.append(toolbar, zoomContent);
    zoomViewer.addEventListener('pointerdown', event => {
      if (event.target === zoomViewer || event.target === zoomContent) closeZoomViewer();
    });
    document.body.appendChild(zoomViewer);
    return zoomViewer;
  }

  function closeZoomViewer() {
    if (!zoomViewer) return;
    zoomViewer.classList.remove('is-open');
    zoomViewer.setAttribute('aria-hidden','true');
    document.body.classList.remove('mechanics-zoom-open');
  }

  function openZoomViewer(record) {
    const asset = record?.asset;
    if (!asset?.src) return;
    ensureZoomViewer();
    const close = zoomViewer.querySelector('.mechanics-zoom-close');
    if (close) close.textContent = UI.closeZoom[lang];
    zoomContent.replaceChildren();

    if (asset.type === 'pdf') {
      const frame = document.createElement('iframe');
      frame.title = local(record.title);
      frame.src = encodeURI(asset.src);
      zoomContent.appendChild(frame);
    } else if (asset.type === 'text') {
      const view = document.createElement('div');
      view.className = 'sheet-text-view';
      const pre = document.createElement('pre');
      pre.textContent = UI.loading[lang];
      view.appendChild(pre);
      zoomContent.appendChild(view);
      fetch(encodeURI(asset.src))
        .then(response => { if (!response.ok) throw Error(response.status); return response.text(); })
        .then(text => { if (pre.isConnected) pre.textContent = text; })
        .catch(() => { if (pre.isConnected) pre.textContent = UI.missing[lang]; });
    } else if (asset.type === 'video') {
      const media = document.createElement('video');
      media.controls = true;
      media.preload = 'metadata';
      media.src = encodeURI(asset.src);
      zoomContent.appendChild(media);
    } else if (asset.type === 'audio') {
      const media = document.createElement('audio');
      media.controls = true;
      media.preload = 'metadata';
      media.src = encodeURI(asset.src);
      zoomContent.appendChild(media);
    } else if (asset.type === 'heic') {
      const card = document.createElement('div');
      card.className = 'sheet-file-card';
      const strong = document.createElement('strong');
      strong.textContent = UI.heic[lang];
      const note = document.createElement('p');
      note.textContent = UI.heicHint[lang];
      card.append(strong,note);
      zoomContent.appendChild(card);
    } else {
      const img = new Image();
      img.alt = local(record.title);
      img.decoding = 'async';
      img.src = encodeURI(asset.src);
      zoomContent.appendChild(img);
    }

    zoomViewer.classList.add('is-open');
    zoomViewer.setAttribute('aria-hidden','false');
    document.body.classList.add('mechanics-zoom-open');
    close?.focus({preventScroll:true});
  }

  function renderAsset(host, record) {
    const asset = record?.asset;
    if (!asset?.src) { fitAdaptiveSheet(1.28); return fileCard(host, record, UI.missing[lang]); }
    if (asset.type === 'heic') { fitAdaptiveSheet(.78); return fileCard(host, record, UI.heic[lang], UI.heicHint[lang]); }

    if (asset.type === 'pdf') {
      const frame = document.createElement('iframe');
      frame.className = 'sheet-pdf-frame';
      frame.title = local(record.title);
      frame.loading = 'eager';
      frame.src = encodeURI(asset.src);
      host.replaceChildren(frame);
      fitAdaptiveSheet(.72);
      return;
    }

    if (asset.type === 'video' || asset.type === 'audio') {
      const media = document.createElement(asset.type === 'video' ? 'video' : 'audio');
      media.className = 'sheet-media-preview';
      media.controls = true;
      media.preload = 'metadata';
      media.src = encodeURI(asset.src);
      host.replaceChildren(media);
      fitAdaptiveSheet(asset.type === 'video' ? 1.55 : 1.2);
      return;
    }

    if (asset.type === 'text') {
      loading(host);
      fetch(encodeURI(asset.src))
        .then(response => {
          if (!response.ok) throw Error(response.status);
          return response.text();
        })
        .then(text => {
          if (!host.isConnected) return;
          const view = document.createElement('div');
          view.className = 'sheet-text-view';
          const pre = document.createElement('pre');
          pre.textContent = text;
          view.appendChild(pre);
          host.replaceChildren(view);
          fitAdaptiveSheet(.82);
        })
        .catch(() => {
          if (host.isConnected) fileCard(host, record, UI.missing[lang]);
        });
      return;
    }

    loading(host);
    const img = new Image();
    img.alt = local(record.title);
    img.decoding = 'async';
    img.draggable = false;
    img.addEventListener('load', () => {
      if (!host.isConnected) return;
      host.replaceChildren(img);
      fitAdaptiveSheet(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.35);
    }, {once:true});
    img.addEventListener('error', () => {
      if (host.isConnected) fileCard(host, record, UI.missing[lang]);
    }, {once:true});
    img.src = encodeURI(asset.src);
  }

  function recordSourceSelection(record) {
    if (record?.__sourceSelectionId) return selectionById.get(record.__sourceSelectionId) || null;
    return activeSelection?.isTaxonomyBrowse ? null : activeSelection;
  }

  function makeSheet(record, recordIndex, slotIndex, lastSlot, isFront, count) {
    const sheet = document.createElement('article');
    sheet.className = `archive-sheet ${isFront ? 'is-front' : 'is-back'}`;
    sheet.style.setProperty('--sheet-z', slotIndex + 1);
    sheet.style.setProperty('--stack-x', `${-(lastSlot - slotIndex) * 28}px`);
    sheet.style.setProperty('--stack-y', `${-(lastSlot - slotIndex) * 32}px`);

    if (!isFront) {
      sheet.tabIndex = 0;
      sheet.setAttribute('role','button');
      sheet.addEventListener('click', () => setActiveRecord(recordIndex));
      sheet.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setActiveRecord(recordIndex);
        }
      });
    }

    const visual = document.createElement('div');
    visual.className = 'sheet-visual';
    const assetHost = document.createElement('div');
    assetHost.className = 'sheet-asset-host';
    visual.append(assetHost, cornerMarks());
    if (isFront) renderAsset(assetHost, record);

    const footer = document.createElement('footer');
    footer.className = 'sheet-footer';
    const main = document.createElement('div');
    main.className = 'sheet-footer-main';
    const title = document.createElement('div');
    title.className = 'sheet-title';

    const sourceSelection = recordSourceSelection(record);
    if (activeSelection?.isTaxonomyBrowse) {
      const owner = sourceSelection ? ownerLabel(sourceSelection) : local(activeSelection.label);
      title.textContent = sourceSelection
        ? `${owner} · ${local(record.title)}`
        : `${local(activeSelection.label)}${count > 1 ? ` ${recordIndex + 1}` : ''}`;
    } else {
      title.textContent = `${ownerLabel(activeSelection)} · ${local(activeSelection.label)}${count > 1 ? ` ${recordIndex + 1}` : ''}`;
    }

    const note = document.createElement('div');
    note.className = 'sheet-note';
    note.textContent = local(record.note) || '';
    const source = document.createElement('div');
    source.className = 'sheet-source';
    source.textContent = record.asset?.src || '';
    main.append(title, note, source);

    const side = document.createElement('div');
    side.className = 'sheet-footer-side';
    const route = document.createElement('div');
    route.className = 'sheet-route';
    const routeTaxonomy = sourceSelection?.taxonomy || activeSelection?.taxonomy;
    route.textContent = taxonomyPath(routeTaxonomy).slice(-2).join(' / ');

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'sheet-open-source';
    link.textContent = UI.openSource[lang];
    link.hidden = !record.asset?.src;
    link.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openZoomViewer(record);
    });

    side.append(route, link);
    footer.append(main, side);
    sheet.append(visual, footer);
    return sheet;
  }

  function renderStack() {
    if (!activeSelection?.records?.length) { resetAdaptiveSheet(); return renderEmpty(); }
    resetAdaptiveSheet();

    const records = activeSelection.records;
    activeRecordIndex = Math.max(0, Math.min(records.length - 1, activeRecordIndex));
    const order = records.map((_, i) => i)
      .filter(i => i !== activeRecordIndex)
      .concat(activeRecordIndex);

    stack.className = 'sheet-stack is-selected';
    stack.replaceChildren();
    const last = order.length - 1;
    order.forEach((recordIndex, slotIndex) => {
      stack.appendChild(makeSheet(
        records[recordIndex],
        recordIndex,
        slotIndex,
        last,
        slotIndex === last,
        records.length
      ));
    });
  }

  function setActiveRecord(index, updateHash = true) {
    if (!activeSelection?.records?.length) return;
    const n = activeSelection.records.length;
    activeRecordIndex = ((index % n) + n) % n;
    renderStack();
    if (updateHash) writeHash();
  }

  function selectProjectCard(node) {
    if (!node?.id) return;
    activeProjectId = node.id;
    activeSelection = null;
    activeRecordIndex = 0;
    renderSelection();
    renderTaxonomy();
    renderEmpty();
    connector.classList.remove('is-visible');
    connectorPath.setAttribute('d','');
    history.replaceState(null, '', location.pathname + location.search);
    if (isMobileLayout()) setMobileView('works', {instant:true});
    requestAnimationFrame(() => {
      scheduleConnector();
      engineeringIndex.scrollTop = 0;
    });
  }

  function selectArchive(selection, options = {}) {
    if (!selection?.taxonomy || !selection.records?.length) return;

    activeProjectId = projectRootId(selection.id);
    activeSelection = selection;
    activeRecordIndex = options.recordIndex ?? 0;
    renderSelection();
    renderTaxonomy();
    renderStack();
    if (isMobileLayout()) setMobileView(options.skipHistory ? 'archive' : 'database', {instant:Boolean(options.skipHistory)});

    requestAnimationFrame(() => {
      engineeringIndex.scrollTop = 0;
      if (isMobileLayout() && document.body.dataset.mobileView === 'database') focusMobileTaxonomyTarget(options.skipHistory ? 'auto' : 'smooth');
      scheduleConnector();
      setTimeout(scheduleConnector, 220);
    });

    if (!options.skipHistory) writeHash();
  }

  function collectTaxonomyRecords(taxonomyId) {
    const scope = taxonomyScope(taxonomyId);
    const collected = [];
    const seen = new Set();

    selectableNodes().forEach(selection => {
      if (!scope.has(selection.taxonomy)) return;
      (selection.records || []).forEach(record => {
        const key = `${record.id || ''}|${record.asset?.src || ''}`;
        if (seen.has(key)) return;
        seen.add(key);
        collected.push({
          ...record,
          __sourceSelectionId: selection.id
        });
      });
    });

    return collected;
  }

  function selectTaxonomy(node, options = {}) {
    if (!node?.id) return;

    activeProjectId = null;
    const records = collectTaxonomyRecords(node.id);
    activeSelection = {
      id: `taxonomy:${node.id}`,
      taxonomy: node.id,
      label: node.label,
      records,
      isTaxonomyBrowse: true
    };
    activeRecordIndex = records.length
      ? Math.max(0, Math.min(records.length - 1, options.recordIndex ?? 0))
      : 0;

    renderSelection();
    renderTaxonomy();
    renderStack();
    connector.classList.remove('is-visible');
    connectorPath.setAttribute('d','');
    if (isMobileLayout()) setMobileView('database');

    requestAnimationFrame(() => {
      engineeringIndex.scrollTop = 0;
      if (isMobileLayout()) focusMobileTaxonomyTarget();
    });

    if (!options.skipHistory) writeHash();
  }

  function writeHash() {
    if (!activeSelection) {
      history.replaceState(null, '', location.pathname + location.search);
      return;
    }

    if (activeSelection.isTaxonomyBrowse) {
      history.replaceState(
        null,
        '',
        `#taxonomy/${encodeURIComponent(activeSelection.taxonomy)}/${activeRecordIndex + 1}`
      );
      return;
    }

    history.replaceState(
      null,
      '',
      `#${encodeURIComponent(activeSelection.id)}/${activeRecordIndex + 1}`
    );
  }

  function restoreHash() {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (!raw) {
      renderEmpty();
      return;
    }

    const parts = raw.split('/');
    if (parts[0] === 'taxonomy') {
      const taxonomyId = parts[1];
      const node = taxonomyById.get(taxonomyId);
      if (!node) {
        renderEmpty();
        return;
      }
      const index = Math.max(0, (parseInt(parts[2], 10) || 1) - 1);
      selectTaxonomy(node, {recordIndex:index, skipHistory:true});
      return;
    }

    const [id, indexRaw] = parts;
    const selection = selectionById.get(id);
    if (!selection?.taxonomy || !selection.records?.length) {
      renderEmpty();
      return;
    }

    const index = Math.max(0, (parseInt(indexRaw, 10) || 1) - 1);
    selectArchive(selection, {recordIndex:index, skipHistory:true});
  }

  function scheduleConnector() {
    cancelAnimationFrame(connectorRaf);
    connectorRaf = requestAnimationFrame(drawConnector);
  }

  function drawConnector() {
    connectorPath.setAttribute('d','');
    if (!activeSelection || activeSelection.isTaxonomyBrowse) {
      connector.classList.remove('is-visible');
      return;
    }

    const selected = selectionTree.querySelector(
      `[data-selection-id="${CSS.escape(activeSelection.id)}"]`
    );
    const target = taxonomyRoot.querySelector(
      `[data-taxonomy-id="${CSS.escape(activeSelection.taxonomy)}"] .taxonomy-label`
    );

    if (!selected || !target) {
      connector.classList.remove('is-visible');
      return;
    }

    const a = selected.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const pr = projectIndex.getBoundingClientRect();
    const tr = engineeringIndex.getBoundingClientRect();

    if (
      a.bottom < pr.top || a.top > pr.bottom ||
      b.bottom < tr.top || b.top > tr.bottom
    ) {
      connector.classList.remove('is-visible');
      return;
    }

    connector.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    const x1 = Math.max(a.right + 24, pr.right - 88);
    const y1 = a.top + a.height / 2;
    const gate = pr.right - 7;
    const x2 = Math.max(tr.left + 10, b.left - 16);
    const y2 = b.top + b.height / 2;

    connectorPath.setAttribute(
      'd',
      `M ${x1.toFixed(1)} ${y1.toFixed(1)} H ${gate.toFixed(1)} V ${y2.toFixed(1)} H ${x2.toFixed(1)}`
    );
    connector.classList.add('is-visible');
  }

  function refreshLanguage(next) {
    lang = next;
    RL.applyMap(UI, lang, document, false);
    document.title = UI.title[lang];
    renderSelection();
    renderTaxonomy();
    renderStack();
    updateMobileWorkspace();
    scheduleConnector();
  }

  function collapseProjectTree() {
    if (!activeProjectId) return;

    // Leaving a work card is a full dismissal: drop the selected technical point
    // before the collapsed DOM can report a stray zero/edge rect to the connector.
    activeProjectId = null;
    if (activeSelection && !activeSelection.isTaxonomyBrowse) {
      activeSelection = null;
      activeRecordIndex = 0;
    }

    cancelAnimationFrame(connectorRaf);
    connectorRaf = 0;
    connector.classList.remove('is-visible');
    connectorPath.setAttribute('d','');
    document.getElementById('taxonomy-route-path')?.setAttribute('d','');

    renderSelection();
    renderTaxonomy();
    renderStack();
    history.replaceState(null, '', location.pathname + location.search);

    // The later v95 overlay also redraws these paths. Clear once more after the
    // selection/taxonomy DOM settles so no stale route can wrap to the viewport edge.
    requestAnimationFrame(() => {
      connector.classList.remove('is-visible');
      connectorPath.setAttribute('d','');
      document.getElementById('taxonomy-route-path')?.setAttribute('d','');
    });
  }

  function bindProjectTreeDismiss() {
    document.addEventListener('pointerdown', event => {
      if (!activeProjectId) return;

      // The archive stage and engineering database are working surfaces, not
      // dismissal zones. This keeps file cards, source links and taxonomy rows
      // interactive while a work card remains expanded.
      if (stage.contains(event.target) || engineeringIndex.contains(event.target)) return;
      if (event.target.closest('#mobile-workspace-nav')) return;

      const activeCard = selectionTree.querySelector(
        `[data-selection-node="${CSS.escape(activeProjectId)}"]`
      );
      if (activeCard?.contains(event.target)) return;
      if (event.target.closest('.selection-node.is-project-card')) return;
      collapseProjectTree();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') collapseProjectTree();
    });
  }

  function bindNavigation() {
    stage.addEventListener('keydown', event => {
      if (!activeSelection?.records?.length) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveRecord(activeRecordIndex + 1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveRecord(activeRecordIndex - 1);
      }
    });

    stage.addEventListener('wheel', event => {
      if (!activeSelection?.records?.length || activeSelection.records.length < 2) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;
      if (Math.abs(delta) < 18 || performance.now() < wheelLock) return;
      wheelLock = performance.now() + 280;
      event.preventDefault();
      setActiveRecord(activeRecordIndex + (delta > 0 ? 1 : -1));
    }, {passive:false});
  }

  addEventListener('resize', () => {
    const ratio = Number(stack.dataset.assetRatio);
    if (Number.isFinite(ratio)) fitAdaptiveSheet(ratio);
  }, {passive:true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && zoomViewer?.classList.contains('is-open')) {
      event.stopPropagation();
      closeZoomViewer();
    }
  });


  // --------------------------------------------------------------------------
  // v124 · inbound Folly record choreography
  // survey: preserve the authored mapping.pdf deep-link.
  // ruinwright: cycle the work's remaining technical tags from bottom to top,
  // then leave the uppermost remaining tag selected.
  // Direct visits to mechanics.html keep the database's ordinary startup.
  // --------------------------------------------------------------------------
  const INBOUND_FOLLY_ROUTES = Object.freeze({
    tower: {
      work: 'decayed-tower-scorched-earth',
      selection: 'tower-antenna-array',
      record: 'tower-mapping',
      archive: {zh:'朽塔焦土', en:'Rusted Tower · Scorched Earth', ja:'朽塔の焦土'}
    },
    sunken: {
      work: 'sunken-ruin-heart-chamber',
      selection: 'heart-artificial-lake',
      record: 'heart-mapping',
      archive: {zh:'沉墟心室', en:'Sunken Ventricle', ja:'沈墟の心室'}
    }
  });

  const inboundDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const inboundFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));

  function inboundRoute() {
    let params;
    try { params = new URLSearchParams(location.search); } catch (_) { return null; }
    if (params.get('from') !== 'ruin-archive') return null;
    const folly = params.get('folly') || '';
    const route = INBOUND_FOLLY_ROUTES[folly];
    if (!route) return null;
    const mode = params.get('mode') === 'ruinwright' ? 'ruinwright' : 'survey';

    // Do not allow query parameters to retarget the choreography to arbitrary
    // database nodes. They may mirror the authored route, but the route table
    // above remains authoritative.
    return {...route, folly, mode};
  }

  function inboundCopy(key, route) {
    const archiveName = local(route.archive);
    const copy = {
      returnLabel: {
        zh: `← 返回《墟域图·遗构馆 / ${archiveName}》`,
        en: `← Back to Ruin Atlas · Relic Archive / ${archiveName}`,
        ja: `← 《墟域図・遺構館 / ${archiveName}》へ戻る`
      },
      locating: {
        zh:'正在自动打开目录文件…',
        en:'Automatically opening directory file…',
        ja:'ディレクトリファイルを自動で開いています…'
      },
      work: {
        zh:'定位废墟园林',
        en:'Locating Folly work',
        ja:'フォリー作品を定位'
      },
      tag: {
        zh:'选中场域标签',
        en:'Selecting site tag',
        ja:'場域タグを選択'
      },
      route: {
        zh:'连接数据库路径',
        en:'Tracing database route',
        ja:'データベース経路を接続'
      },
      file: {
        zh:'打开 mapping.pdf',
        en:'Opening mapping.pdf',
        ja:'mapping.pdf を開く'
      },
      ruinwright: {
        zh:'轮阅墟构标签',
        en:'Cycling Ruinwright tags',
        ja:'墟構タグを巡回'
      },
      settled: {
        zh:'停留在最上层标签',
        en:'Settled on the uppermost tag',
        ja:'最上段のタグで停止'
      }
    };
    return copy[key]?.[lang] || copy[key]?.zh || '';
  }

  function ensureInboundUi(route) {
    document.body.classList.add('mechanics-inbound-folly');

    let back = document.getElementById('inbound-return-tab');
    if (!back) {
      back = document.createElement('button');
      back.id = 'inbound-return-tab';
      back.className = 'inbound-return-tab';
      back.type = 'button';
      back.addEventListener('click', () => {
        // A same-origin script-opened tab can return to the untouched atlas
        // without reloading it. If opener access is unavailable, fall back to
        // the atlas URL.
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.focus();
            window.close();
            return;
          }
        } catch (_) {}
        location.href = 'index.html';
      });
      document.body.appendChild(back);
    }

    let status = document.getElementById('inbound-auto-status');
    if (!status) {
      status = document.createElement('div');
      status.id = 'inbound-auto-status';
      status.className = 'inbound-auto-status';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      status.innerHTML = '<span class="inbound-auto-status-mark" aria-hidden="true"></span><span class="inbound-auto-status-text"></span>';
      document.body.appendChild(status);
    }

    const sync = () => {
      back.textContent = inboundCopy('returnLabel', route);
      back.setAttribute('aria-label', inboundCopy('returnLabel', route));
    };
    sync();
    return {back,status,sync};
  }

  function setInboundStatus(ui, route, key, detail = '') {
    const textNode = ui.status.querySelector('.inbound-auto-status-text');
    const base = inboundCopy(key, route);
    textNode.textContent = detail ? `${base} · ${detail}` : base;
    ui.status.dataset.stage = key;
    ui.status.classList.remove('is-pulse');
    void ui.status.offsetWidth;
    ui.status.classList.add('is-pulse');
  }

  function recordIndexFor(selection, recordId) {
    const records = selection?.records || [];
    const index = records.findIndex(record => record?.id === recordId);
    return index >= 0 ? index : 0;
  }

  async function runInboundFollyAutoOpen(route) {
    const selection = selectionById.get(route.selection);
    if (!selection?.taxonomy || !selection.records?.length) return false;
    const project = selectionById.get(route.work);
    if (!project) return false;

    const ui = ensureInboundUi(route);
    const syncLanguage = () => {
      ui.sync();
      const stage = ui.status.dataset.stage || 'locating';
      setInboundStatus(ui, route, stage);
    };
    addEventListener('ruinlanguagechange', syncLanguage);

    document.body.classList.add('inbound-auto-opening','inbound-auto-stage-project');
    setInboundStatus(ui, route, 'locating');
    if (isMobileLayout()) setMobileView('works', {instant:true});
    await inboundDelay(260);

    // 1. Open the authored Folly card while the archive stage remains empty.
    activeProjectId = route.work;
    activeSelection = null;
    activeRecordIndex = 0;
    renderSelection();
    renderTaxonomy();
    renderEmpty();
    connector.classList.remove('is-visible');
    connectorPath.setAttribute('d','');
    setInboundStatus(ui, route, 'work', local(project.label));
    await inboundDelay(520);

    if (route.mode === 'ruinwright') {
      // The work card lists its authored tags top -> bottom.  The "墟构记录"
      // bridge deliberately reads the remaining tags in reverse visual order:
      // bottom -> top.  The terrain/mapping tag is excluded because it belongs
      // to the sibling "勘景记录" route.
      const cycle = (project.children || [])
        .filter(node =>
          node?.id !== route.selection &&
          node?.taxonomy &&
          node?.records?.length
        )
        .slice()
        .reverse();

      if (!cycle.length) return false;

      document.body.classList.remove('inbound-auto-stage-project');
      document.body.classList.add('inbound-auto-stage-tag');
      if (isMobileLayout()) setMobileView('database', {instant:true});

      for (let i = 0; i < cycle.length; i += 1) {
        const node = cycle[i];
        const isLast = i === cycle.length - 1;

        document.body.classList.add('inbound-hold-connector');
        connector.classList.remove('is-visible');
        connectorPath.setAttribute('d','');

        activeProjectId = route.work;
        activeSelection = node;
        activeRecordIndex = 0;
        renderSelection();
        renderTaxonomy();
        renderEmpty();
        setInboundStatus(ui, route, 'ruinwright', local(node.label));

        await inboundFrame();
        if (isMobileLayout()) focusMobileTaxonomyTarget('smooth');
        await inboundDelay(330);

        document.body.classList.remove('inbound-hold-connector');
        scheduleConnector();
        await inboundFrame();
        scheduleConnector();
        await inboundDelay(isLast ? 620 : 430);

        if (!isLast) {
          connector.classList.remove('is-visible');
          connectorPath.setAttribute('d','');
          await inboundDelay(120);
        }
      }

      // Leave the topmost remaining work tag selected, with its taxonomy route
      // visible. Do not open a file: this branch is a tag-index tour, not a
      // single attachment deep-link.
      const finalNode = cycle[cycle.length - 1];
      activeProjectId = route.work;
      activeSelection = finalNode;
      activeRecordIndex = 0;
      renderSelection();
      renderTaxonomy();
      renderEmpty();
      scheduleConnector();
      writeHash();
      setInboundStatus(ui, route, 'settled', local(finalNode.label));
      await inboundDelay(720);

      ui.status.classList.add('is-complete');
      document.body.classList.remove('inbound-auto-opening','inbound-auto-stage-tag','inbound-hold-connector');
      document.body.classList.add('inbound-auto-complete');
      window.setTimeout(() => ui.status?.remove(), 520);
      return true;
    }

    // 2. Select the site/terrain tag.  Suppress the connector visually for one
    // beat so the selected label is legible as a discrete action.
    document.body.classList.remove('inbound-auto-stage-project');
    document.body.classList.add('inbound-auto-stage-tag','inbound-hold-connector');
    activeProjectId = route.work;
    activeSelection = selection;
    activeRecordIndex = recordIndexFor(selection, route.record);
    renderSelection();
    renderTaxonomy();
    renderEmpty();
    if (isMobileLayout()) setMobileView('database', {instant:true});
    setInboundStatus(ui, route, 'tag', local(selection.label));
    await inboundFrame();
    if (isMobileLayout()) focusMobileTaxonomyTarget('smooth');
    await inboundDelay(700);

    // 3. Reveal the tree connector after the tag is already selected.
    document.body.classList.remove('inbound-auto-stage-tag','inbound-hold-connector');
    document.body.classList.add('inbound-auto-stage-route');
    setInboundStatus(ui, route, 'route', local(taxonomyById.get(selection.taxonomy)?.label || selection.label));
    scheduleConnector();
    await inboundFrame();
    scheduleConnector();
    await inboundDelay(760);

    // 4. Finally materialize the mapping record itself.
    document.body.classList.remove('inbound-auto-stage-route');
    document.body.classList.add('inbound-auto-stage-file');
    setInboundStatus(ui, route, 'file');
    renderStack();
    if (isMobileLayout()) setMobileView('archive', {instant:false});
    writeHash();
    await inboundDelay(900);

    ui.status.classList.add('is-complete');
    document.body.classList.remove('inbound-auto-opening','inbound-auto-stage-file');
    document.body.classList.add('inbound-auto-complete');
    window.setTimeout(() => ui.status?.remove(), 520);
    return true;
  }

  function install() {
    buildIndexes();
    bindMobileWorkspace();
    renderSelection();
    renderTaxonomy();
    bindNavigation();
    bindProjectTreeDismiss();
    const inbound = inboundRoute();
    if (inbound) {
      renderEmpty();
      runInboundFollyAutoOpen(inbound);
    } else {
      restoreHash();
      if (isMobileLayout() && !location.hash) setMobileView('works', {instant:true});
    }

    addEventListener('resize', scheduleConnector, {passive:true});
    projectIndex.addEventListener('scroll', scheduleConnector, {passive:true});
    engineeringIndex.addEventListener('scroll', scheduleConnector, {passive:true});

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(scheduleConnector);
      ro.observe(projectIndex);
      ro.observe(engineeringIndex);
    }

    addEventListener('ruinlanguagechange', event => refreshLanguage(event.detail.lang));
    RL.applyMap(UI, lang, document, false);
    document.title = UI.title[lang];
  }

  install();
})();

/* Consolidated from mechanics.html: mechanics-layout-runtime-1 */
(() => {
      const engineeringIndex = document.getElementById('engineering-index');
      const titleSquare = document.querySelector('.engineering-title-square');
      const selectionTree = document.getElementById('selection-tree');
      const taxonomyRoot = document.getElementById('engineering-taxonomy');
      const connector = document.getElementById('directory-connector');
      const path = document.getElementById('directory-connector-path');
      const routePath = document.getElementById('taxonomy-route-path');
      const projectIndex = document.getElementById('project-index');
      const stage = document.getElementById('archive-stage');
      const stack = document.getElementById('sheet-stack');
      const tray = document.getElementById('file-extraction-tray');
      const rack = document.getElementById('file-tray-rack');
      if (!engineeringIndex || !titleSquare || !selectionTree || !taxonomyRoot || !connector || !path || !routePath || !projectIndex || !stage || !stack || !tray || !rack) return;

      const TRAY_THRESHOLD = 5;
      let connectorRaf = 0;
      let fitRaf = 0;
      let trayRaf = 0;
      let writingConnector = false;
      let fishInside = false;
      let fishY = null;

      function topLevelTaxonomyNode(node) {
        let current = node;
        while (current?.parentElement?.classList.contains('taxonomy-children')) {
          current = current.parentElement.closest('.taxonomy-node');
        }
        return current;
      }

      function syncSpineMetrics() {
        const ir = engineeringIndex.getBoundingClientRect();
        const sr = titleSquare.getBoundingClientRect();
        engineeringIndex.style.setProperty('--engineering-spine-x', `${(sr.left + sr.width / 2 - ir.left).toFixed(2)}px`);
        engineeringIndex.style.setProperty('--engineering-spine-start', `${Math.max(0, sr.bottom - ir.top).toFixed(2)}px`);
        const lastRootRow = taxonomyRoot.lastElementChild?.querySelector(':scope > .taxonomy-row');
        const rr = lastRootRow?.getBoundingClientRect();
        if (rr) {
          engineeringIndex.style.setProperty('--engineering-spine-end', `${Math.max(sr.bottom - ir.top, rr.top + rr.height / 2 - ir.top).toFixed(2)}px`);
        }
      }

      function redrawConnector() {
        connectorRaf = 0;
        syncSpineMetrics();

        const selected = selectionTree.querySelector('.selection-node.is-selected .selection-select');
        const targetNode = taxonomyRoot.querySelector('.taxonomy-node.is-target');
        if (!selected || !targetNode) {
          connector.classList.remove('is-visible');
          if (path.getAttribute('d') || routePath.getAttribute('d')) {
            writingConnector = true;
            path.setAttribute('d','');
            routePath.setAttribute('d','');
            writingConnector = false;
          }
          return;
        }

        const targetRow = targetNode.querySelector(':scope > .taxonomy-row');
        const targetLabel = targetRow?.querySelector(':scope > .taxonomy-label');
        if (!targetRow || !targetLabel) return;

        const a = selected.getBoundingClientRect();
        const b = targetLabel.getBoundingClientRect();
        const pr = projectIndex.getBoundingClientRect();
        const ir = engineeringIndex.getBoundingClientRect();
        const sr = titleSquare.getBoundingClientRect();
        if (a.bottom < pr.top || a.top > pr.bottom || b.bottom < ir.top || b.top > ir.bottom) {
          connector.classList.remove('is-visible');
          return;
        }

        const spineX = sr.left + sr.width / 2;
        // The work-index launch line behaves like an underline and stops exactly
        // at the database spine (the purple reference line in the design sketch).
        const y1 = a.bottom + 1.5;
        const leftUnderline = Math.max(pr.left + 8, a.left - 1);
        const d = `M ${leftUnderline.toFixed(1)} ${y1.toFixed(1)} H ${spineX.toFixed(1)}`;

        // Build a second, heavier path only along the actual taxonomy route. This
        // avoids the old behaviour where an entire child rail became dark even
        // below the selected technical point.
        const routeNodes = [];
        let cursor = targetNode;
        while (cursor?.classList.contains('taxonomy-node')) {
          routeNodes.unshift(cursor);
          const parentChildren = cursor.parentElement;
          if (!parentChildren?.classList.contains('taxonomy-children')) break;
          cursor = parentChildren.parentElement?.closest('.taxonomy-node');
        }

        const routeSegments = [];
        if (routeNodes.length) {
          const rootRow = routeNodes[0].querySelector(':scope > .taxonomy-row');
          const rootRect = rootRow?.getBoundingClientRect();
          if (rootRect) {
            const rootY = rootRect.top + rootRect.height / 2;
            routeSegments.push(`M ${spineX.toFixed(1)} ${y1.toFixed(1)} V ${rootY.toFixed(1)} H ${rootRect.left.toFixed(1)}`);
          }

          for (let i = 1; i < routeNodes.length; i += 1) {
            const parentRow = routeNodes[i - 1].querySelector(':scope > .taxonomy-row');
            const childRow = routeNodes[i].querySelector(':scope > .taxonomy-row');
            const rail = routeNodes[i].parentElement;
            const parentRect = parentRow?.getBoundingClientRect();
            const childRect = childRow?.getBoundingClientRect();
            const railRect = rail?.getBoundingClientRect();
            if (!parentRect || !childRect || !railRect) continue;
            const parentY = parentRect.top + parentRect.height / 2;
            const childY = childRect.top + childRect.height / 2;
            const railX = railRect.left;
            routeSegments.push(`M ${railX.toFixed(1)} ${parentY.toFixed(1)} V ${childY.toFixed(1)} H ${childRect.left.toFixed(1)}`);
          }
        }

        const routeD = routeSegments.join(' ');
        connector.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
        connector.classList.add('is-visible');
        if (path.getAttribute('d') !== d || routePath.getAttribute('d') !== routeD) {
          writingConnector = true;
          path.setAttribute('d', d);
          routePath.setAttribute('d', routeD);
          writingConnector = false;
        }
      }

      function scheduleConnector() {
        cancelAnimationFrame(connectorRaf);
        connectorRaf = requestAnimationFrame(redrawConnector);
      }

      function taxonomyDepth(row) {
        let depth = 0;
        let cursor = row.parentElement;
        while (cursor && cursor !== taxonomyRoot) {
          if (cursor.classList.contains('taxonomy-children')) depth += 1;
          cursor = cursor.parentElement;
        }
        return depth;
      }

      function fitTaxonomy() {
        fitRaf = 0;
        const rows = [...taxonomyRoot.querySelectorAll('.taxonomy-row')];
        if (!rows.length || innerWidth <= 800) return;
        rows.forEach(row => { row.dataset.taxonomyDepth = String(taxonomyDepth(row)); });
        const er = engineeringIndex.getBoundingClientRect();
        const tr = taxonomyRoot.getBoundingClientRect();
        const available = Math.max(250, er.bottom - tr.top - 5);
        const rowHeight = Math.max(13.5, Math.min(23, available / rows.length));
        engineeringIndex.style.setProperty('--taxonomy-row-h', `${rowHeight.toFixed(2)}px`);
        if (fishInside && Number.isFinite(fishY)) requestAnimationFrame(() => applyFisheye(fishY));
      }

      function scheduleFit() {
        cancelAnimationFrame(fitRaf);
        fitRaf = requestAnimationFrame(fitTaxonomy);
      }

      function resetFisheye() {
        taxonomyRoot.querySelectorAll('.taxonomy-row').forEach(row => {
          row.style.setProperty('--fish-scale','1');
          row.style.setProperty('--fish-shift','0px');
          row.classList.remove('is-fisheye-near');
        });
      }

      function applyFisheye(clientY) {
        if (!fishInside || innerWidth <= 800) return;
        const rows = [...taxonomyRoot.querySelectorAll('.taxonomy-row')];
        const radius = Math.max(54, Math.min(82, engineeringIndex.clientHeight * .085));
        rows.forEach(row => {
          const rect = row.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = Math.abs(clientY - center);
          const proximity = Math.max(0, 1 - distance / radius);
          const depth = Number(row.dataset.taxonomyDepth || taxonomyDepth(row));
          const maxScale = depth >= 2 ? 1.22 : depth === 1 ? 1.15 : 1.09;
          const eased = proximity * proximity * (3 - 2 * proximity);
          const scale = 1 + (maxScale - 1) * eased;
          row.style.setProperty('--fish-scale', scale.toFixed(3));
          row.style.setProperty('--fish-shift', `${((scale - 1) * 2.4).toFixed(2)}px`);
          row.classList.toggle('is-fisheye-near', proximity > .13);
        });
      }

      engineeringIndex.addEventListener('mousemove', event => {
        if (innerWidth <= 800) return;
        fishInside = true;
        fishY = event.clientY;
        applyFisheye(fishY);
      }, {passive:true});
      engineeringIndex.addEventListener('mouseleave', () => {
        fishInside = false;
        fishY = null;
        resetFisheye();
      }, {passive:true});

      function currentRecordIndex(count) {
        const raw = decodeURIComponent(location.hash.slice(1));
        const pieces = raw.split('/').filter(Boolean);
        const parsed = parseInt(pieces[pieces.length - 1],10);
        if (Number.isFinite(parsed) && parsed >= 1) return Math.min(count - 1, parsed - 1);
        return Math.max(0, count - 1);
      }

      function activateTrayIndex(targetIndex, count, activeIndex) {
        if (targetIndex === activeIndex) return;
        const backs = [...stack.querySelectorAll('.archive-sheet.is-back')];
        const order = Array.from({length:count},(_,index) => index).filter(index => index !== activeIndex);
        const slot = order.indexOf(targetIndex);
        if (slot >= 0 && backs[slot]) backs[slot].click();
      }

      function applySelectedPush(activeIndex) {
        const items = [...rack.querySelectorAll('.file-tray-item')];
        items.forEach((item,index) => {
          if (index === activeIndex) {
            item.style.setProperty('--selected-push','0px');
            return;
          }
          const distance = Math.abs(index - activeIndex);
          const strength = Math.max(0, 1 - distance / 4.5);
          const direction = index < activeIndex ? -1 : 1;
          item.style.setProperty('--selected-push', `${(direction * strength * 24).toFixed(1)}px`);
        });
      }

      function clearRackHover() {
        rack.querySelectorAll('.file-tray-item').forEach(item => {
          item.style.setProperty('--hover-x','0px');
          item.style.setProperty('--hover-lift','0px');
          item.classList.remove('is-near');
        });
      }

      rack.addEventListener('pointermove', event => {
        const items = [...rack.querySelectorAll('.file-tray-item')];
        if (!items.length) return;
        const radius = 128;
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const dx = center - event.clientX;
          const distance = Math.abs(dx);
          const proximity = Math.max(0, 1 - distance / radius);
          const eased = proximity * proximity * (3 - 2 * proximity);
          const direction = dx < 0 ? -1 : 1;
          item.style.setProperty('--hover-x', `${(direction * eased * 18).toFixed(1)}px`);
          item.style.setProperty('--hover-lift', `${(eased * 12).toFixed(1)}px`);
          item.classList.toggle('is-near', proximity > .14);
        });
      }, {passive:true});
      rack.addEventListener('pointerleave', clearRackHover, {passive:true});

      function syncTray() {
        trayRaf = 0;
        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];
        const count = sheets.length;
        const enabled = stack.classList.contains('is-selected') && count > TRAY_THRESHOLD;
        document.body.classList.toggle('has-file-extraction-tray', enabled);
        tray.setAttribute('aria-hidden', enabled ? 'false' : 'true');
        if (!enabled) {
          rack.replaceChildren();
          return;
        }

        const activeIndex = currentRecordIndex(count);
        const usableWidth = Math.max(280, stage.clientWidth - 72);
        const cardWidth = Math.max(52, Math.min(82, usableWidth / Math.max(5.2, count * .68)));
        const cardHeight = Math.max(96, Math.min(148, cardWidth * 1.86));
        const overlap = -Math.max(18, Math.min(38, cardWidth * .43));
        tray.style.setProperty('--tray-card-w', `${cardWidth.toFixed(1)}px`);
        tray.style.setProperty('--tray-card-h', `${cardHeight.toFixed(1)}px`);
        tray.style.setProperty('--tray-overlap', `${overlap.toFixed(1)}px`);

        const fragment = document.createDocumentFragment();
        for (let index = 0; index < count; index += 1) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `file-tray-item${index === activeIndex ? ' is-active' : ''}`;
          button.setAttribute('aria-label', `档案 ${index + 1} / ${count}`);
          button.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');
          button.title = `${index + 1} / ${count}`;
          const number = document.createElement('span');
          number.className = 'file-tray-index';
          number.textContent = String(index + 1).padStart(2,'0');
          button.appendChild(number);
          button.addEventListener('click', () => activateTrayIndex(index,count,activeIndex));
          fragment.appendChild(button);
        }
        rack.replaceChildren(fragment);
        applySelectedPush(activeIndex);
      }

      function scheduleTray() {
        if (typeof window.__mechanicsRackSyncV96 === 'function') {
          window.__mechanicsRackSyncV96();
        }
      }

      const pathObserver = new MutationObserver(() => {
        if (!writingConnector) scheduleConnector();
      });
      pathObserver.observe(path,{attributes:true,attributeFilter:['d']});

      const treeObserver = new MutationObserver(() => {
        scheduleConnector();
        scheduleFit();
        if (fishInside && Number.isFinite(fishY)) requestAnimationFrame(() => applyFisheye(fishY));
      });
      treeObserver.observe(selectionTree,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      treeObserver.observe(taxonomyRoot,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});

      const stackObserver = new MutationObserver(scheduleTray);
      stackObserver.observe(stack,{childList:true,subtree:false,attributes:true,attributeFilter:['class']});

      addEventListener('resize',() => {
        scheduleConnector();
        scheduleFit();
        scheduleTray();
      },{passive:true});
      projectIndex.addEventListener('scroll',scheduleConnector,{passive:true});
      engineeringIndex.addEventListener('scroll',() => {
        scheduleConnector();
        if (fishInside && Number.isFinite(fishY)) requestAnimationFrame(() => applyFisheye(fishY));
      },{passive:true});
      addEventListener('ruinlanguagechange',() => {
        scheduleConnector();
        scheduleFit();
        scheduleTray();
      });

      scheduleConnector();
      scheduleFit();
      scheduleTray();
    })();


/* Consolidated from mechanics.html: mechanics-v96-rack-script */
(() => {
      const stack = document.getElementById('sheet-stack');
      const stage = document.getElementById('archive-stage');
      const tray = document.getElementById('file-extraction-tray');
      const rack = document.getElementById('file-tray-rack');
      const directory = document.getElementById('file-tray-directory');
      const prevButton = document.getElementById('file-tray-prev');
      const nextButton = document.getElementById('file-tray-next');
      if (!stack || !stage || !tray || !rack || !directory || !prevButton || !nextButton) return;

      let raf = 0;
      let signature = '';

      const rackStatus = {
        zh:{none:'未选择目录',empty:'空文件夹'},
        en:{none:'NO DIRECTORY SELECTED',empty:'EMPTY FOLDER'},
        ja:{none:'ディレクトリ未選択',empty:'空のフォルダ'}
      };
      const rackLang = () => window.RuinLanguage?.read?.() || 'zh';
      const rackStatusText = key => (rackStatus[rackLang()] || rackStatus.zh)[key];

      const basename = path => String(path || '').split('/').filter(Boolean).pop() || 'untitled';
      const dirname = path => {
        const parts = String(path || '').split('/').filter(Boolean);
        parts.pop();
        return parts.join('/') + (parts.length ? '/' : '');
      };

      function sheetData() {
        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];
        const records = sheets.map(sheet => {
          const source = sheet.querySelector('.sheet-source')?.textContent?.trim() || '';
          return {sheet, source, name:basename(source), active:sheet.classList.contains('is-front')};
        }).filter(record => record.source);
        records.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric:true,sensitivity:'base'}));
        return records;
      }

      function setRackGeometry(count) {
        const usable = Math.max(290, stage.clientWidth - 86);
        const width = Math.max(58, Math.min(78, usable / Math.max(4.7, count * .58)));
        const height = Math.max(78, Math.min(102, width * 1.31));
        const overlap = -Math.max(27, Math.min(43, width * .52));
        tray.style.setProperty('--tray-card-w', `${width.toFixed(1)}px`);
        tray.style.setProperty('--tray-card-h', `${height.toFixed(1)}px`);
        tray.style.setProperty('--tray-overlap', `${overlap.toFixed(1)}px`);
      }

      function updateSelectedPush(activePath) {
        const items = [...rack.querySelectorAll('.file-tray-item')];
        const singleFile = items.length === 1;
        rack.classList.toggle('is-single-file', singleFile);
        const activeIndex = items.findIndex(item => item.dataset.path === activePath);
        items.forEach((item,index) => {
          const active = index === activeIndex;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
          if (singleFile || activeIndex < 0 || active) {
            item.style.setProperty('--selected-shift','0px');
            return;
          }
          const distance = Math.abs(index - activeIndex);
          const force = Math.max(0, 1 - distance / 4.2);
          const direction = index < activeIndex ? -1 : 1;
          item.style.setProperty('--selected-shift', `${(direction * force * 17).toFixed(1)}px`);
        });
      }

      function activatePath(path) {
        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];
        const target = sheets.find(sheet => sheet.querySelector('.sheet-source')?.textContent?.trim() === path);
        if (!target || target.classList.contains('is-front')) return;
        target.click();
      }

      function stepRack(delta) {
        const records = sheetData();
        if (records.length < 2) return;
        const found = records.findIndex(record => record.active);
        const activeIndex = found >= 0 ? found : 0;
        const nextIndex = (activeIndex + delta + records.length) % records.length;
        activatePath(records[nextIndex].source);
      }

      prevButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        stepRack(-1);
      });
      nextButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        stepRack(1);
      });

      function buildRack(records) {
        const fragment = document.createDocumentFragment();
        records.forEach((record,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'file-tray-item';
          button.dataset.path = record.source;
          button.style.setProperty('--tray-order', String(index));
          button.style.setProperty('--tray-name-rise', `${(index * 1.1).toFixed(1)}px`);
          button.title = record.name;
          button.setAttribute('aria-label', record.name);
          button.setAttribute('aria-pressed','false');

          const number = document.createElement('span');
          number.className = 'file-tray-index';
          number.textContent = String(index + 1).padStart(2,'0');

          const name = document.createElement('span');
          name.className = 'file-tray-name';
          name.textContent = record.name;

          button.append(number,name);
          button.addEventListener('click', () => activatePath(record.source));
          fragment.appendChild(button);
        });
        rack.replaceChildren(fragment);
      }

      function clearHover() {
        rack.querySelectorAll('.file-tray-item').forEach(item => {
          item.style.setProperty('--hover-spread','0px');
          item.style.setProperty('--hover-lift','0px');
          item.classList.remove('is-near');
        });
      }

      rack.addEventListener('pointermove', event => {
        const items = [...rack.querySelectorAll('.file-tray-item')];
        const radius = 104;
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const dx = center - event.clientX;
          const proximity = Math.max(0, 1 - Math.abs(dx) / radius);
          const eased = proximity * proximity * (3 - 2 * proximity);
          const direction = dx < 0 ? -1 : 1;
          item.style.setProperty('--hover-spread', `${(direction * eased * 14).toFixed(1)}px`);
          item.style.setProperty('--hover-lift', `${(eased * 9).toFixed(1)}px`);
          item.classList.toggle('is-near', proximity > .16);
        });
      }, {capture:true,passive:true});
      rack.addEventListener('pointerleave', clearHover, {capture:true,passive:true});

      function sync() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const records = sheetData();
          const multipleFiles = records.length > 1;
          prevButton.hidden = !multipleFiles;
          nextButton.hidden = !multipleFiles;
          const hasDirectorySelection = Boolean(
            document.querySelector('#engineering-taxonomy .taxonomy-node.is-target') ||
            document.querySelector('#selection-tree .selection-node.is-selected')
          );

          // The rack is a permanent part of the right-hand archive stage. Empty
          // states keep the tray visible instead of collapsing the interface.
          document.body.classList.add('has-file-extraction-tray');
          tray.setAttribute('aria-hidden', 'false');

          if (!records.length) {
            signature = '';
            rack.replaceChildren();
            rack.classList.remove('is-single-file');
            tray.dataset.state = hasDirectorySelection ? 'empty' : 'idle';
            directory.textContent = hasDirectorySelection
              ? rackStatusText('empty')
              : rackStatusText('none');
            return;
          }

          tray.dataset.state = 'files';
          setRackGeometry(records.length);
          const active = records.find(record => record.active) || records[records.length - 1];
          directory.textContent = dirname(active?.source || '');
          const nextSignature = records.map(record => record.source).join('|');
          if (nextSignature !== signature) {
            signature = nextSignature;
            buildRack(records);
            requestAnimationFrame(() => updateSelectedPush(active?.source || ''));
          } else {
            updateSelectedPush(active?.source || '');
          }
        });
      }

      window.__mechanicsRackSyncV96 = sync;
      const observer = new MutationObserver(sync);
      observer.observe(stack,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
      addEventListener('resize',sync,{passive:true});
      addEventListener('ruinlanguagechange',sync);
      sync();
    })();

