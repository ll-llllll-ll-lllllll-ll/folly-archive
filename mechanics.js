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
    choose:{zh:'从左侧按作品检索，或直接翻阅中部工程数据库',en:'Browse by work on the left, or enter the engineering database directly',ja:'左側で作品から検索するか、中央の工程データベースを直接閲覧'},
    emptyTitle:{zh:'未选择工程档案',en:'No engineering archive selected',ja:'工程アーカイブ未選択'},
    emptyNote:{zh:'左侧是作品检索；中部数据库本身也可直接点击、翻阅。档案文件只在选中后加载。',en:'The left column is a work index; the central database can also be browsed directly. Files load only after selection.',ja:'左側は作品検索、中央のデータベース自体も直接閲覧できます。ファイルは選択後に読み込みます。'},
    noCategoryRecords:{zh:'这一工程分类目前尚未收入可查看档案。可继续翻阅中部目录，或从左侧按作品检索。',en:'This engineering category does not yet contain a viewable archive. Continue through the central tree or browse by work on the left.',ja:'この工程分類には、まだ閲覧可能な記録がありません。中央のツリーを続けて閲覧するか、左側から作品で検索してください。'},
    openSource:{zh:'打开原文件 ↗',en:'Open source ↗',ja:'原ファイルを開く ↗'},
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

  let lang = RL.read();
  let activeSelection = null;
  let activeRecordIndex = 0;
  let connectorRaf = 0;
  let wheelLock = 0;

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

  function selectionNode(node, depth, route) {
    const wrap = document.createElement('div');
    wrap.className = `selection-node ${node.children ? 'selection-branch' : 'selection-leaf'}`;
    wrap.dataset.selectionNode = node.id;
    wrap.style.setProperty('--tree-depth', depth);

    if (route.has(node.id)) wrap.classList.add('is-selected-route');
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
      button.textContent = local(node.label);
      button.addEventListener('click', () => selectArchive(node));
    } else {
      button.className = 'selection-branch-label';
      button.textContent = local(node.label);
      button.setAttribute('aria-expanded', 'true');
      button.addEventListener('click', () => {
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
        nodes.appendChild(selectionNode(node, group.treeLabel ? 1 : 0, route));
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

    const row = document.createElement('div');
    row.className = 'taxonomy-row';
    row.dataset.taxonomyId = node.id;
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-pressed', activeSelection?.isTaxonomyBrowse && activeSelection.taxonomy === node.id ? 'true' : 'false');
    row.setAttribute('aria-label', local(node.label));

    const dash = document.createElement('span');
    dash.className = 'tree-dash';
    dash.textContent = '−';

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
    const route = activeSelection?.taxonomy
      ? routeSet(activeSelection.taxonomy, taxonomyParent)
      : new Set();
    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));
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
    hint.textContent = activeSelection?.isTaxonomyBrowse
      ? local(activeSelection.label)
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
      : UI.emptyTitle[lang];
    const note = document.createElement('div');
    note.className = 'sheet-note';
    note.textContent = activeSelection?.isTaxonomyBrowse
      ? UI.noCategoryRecords[lang]
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

  function renderAsset(host, record) {
    const asset = record?.asset;
    if (!asset?.src) return fileCard(host, record, UI.missing[lang]);
    if (asset.type === 'heic') return fileCard(host, record, UI.heic[lang], UI.heicHint[lang]);

    if (asset.type === 'pdf') {
      const frame = document.createElement('iframe');
      frame.className = 'sheet-pdf-frame';
      frame.title = local(record.title);
      frame.loading = 'eager';
      frame.src = encodeURI(asset.src);
      host.replaceChildren(frame);
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
      if (host.isConnected) host.replaceChildren(img);
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

    const link = document.createElement('a');
    link.className = 'sheet-open-source';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = UI.openSource[lang];
    if (record.asset?.src) link.href = encodeURI(record.asset.src);
    else link.hidden = true;

    side.append(route, link);
    footer.append(main, side);
    sheet.append(visual, footer);
    return sheet;
  }

  function renderStack() {
    if (!activeSelection?.records?.length) return renderEmpty();

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

  function selectArchive(selection, options = {}) {
    if (!selection?.taxonomy || !selection.records?.length) return;

    activeSelection = selection;
    activeRecordIndex = options.recordIndex ?? selection.records.length - 1;
    renderSelection();
    renderTaxonomy();
    renderStack();

    requestAnimationFrame(() => {
      taxonomyRoot
        .querySelector(`[data-taxonomy-id="${CSS.escape(selection.taxonomy)}"]`)
        ?.scrollIntoView?.({block:'nearest'});
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

    const records = collectTaxonomyRecords(node.id);
    activeSelection = {
      id: `taxonomy:${node.id}`,
      taxonomy: node.id,
      label: node.label,
      records,
      isTaxonomyBrowse: true
    };
    activeRecordIndex = records.length
      ? Math.max(0, Math.min(records.length - 1, options.recordIndex ?? records.length - 1))
      : 0;

    renderSelection();
    renderTaxonomy();
    renderStack();
    connector.classList.remove('is-visible');
    connectorPath.setAttribute('d','');

    requestAnimationFrame(() => {
      taxonomyRoot
        .querySelector(`[data-taxonomy-id="${CSS.escape(node.id)}"]`)
        ?.scrollIntoView?.({block:'nearest'});
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

    const index = Math.max(0, (parseInt(indexRaw, 10) || selection.records.length) - 1);
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
    scheduleConnector();
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

  function install() {
    buildIndexes();
    renderSelection();
    renderTaxonomy();
    bindNavigation();
    restoreHash();

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