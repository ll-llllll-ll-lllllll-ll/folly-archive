(() => {
  'use strict';
  const D = window.RUINWRIGHT_ENGINEERING_ARCHIVE;
  const RL = window.RuinLanguage;
  if (!D || !RL) return;

  const UI = {
    title:{zh:'墟构机械数据库',en:'Ruinwright Mechanism Archive',ja:'墟構機械データベース'},
    engineeringDatabase:{zh:'墟构工程总数据库',en:'Ruinwright Engineering Database',ja:'墟構工程総データベース'},
    manifesto:{zh:'墟构师宣言 ↗',en:'Manifesto ↗',ja:'墟構師宣言 ↗'},
    archive:{zh:'遗构馆 ↗',en:'Relic Archive ↗',ja:'遺構館 ↗'},
    worksSegments:{zh:'作品 / 档案段',en:'Works / archive sections',ja:'作品 / アーカイブ区分'},
    browseByWork:{zh:'按作品检索',en:'Browse by work',ja:'作品から検索'},
    choose:{zh:'选择左侧草图档案',en:'Select an archive from the left',ja:'左側のアーカイブを選択'},
    emptyTitle:{zh:'未选择草图档案',en:'No archive selected',ja:'アーカイブ未選択'},
    emptyNote:{zh:'档案文件只在被选中时加载。',en:'Archive files load only after selection.',ja:'記録ファイルは選択したときだけ読み込みます。'},
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

  const selectionById = new Map(), selectionParent = new Map();
  const taxonomyById = new Map(), taxonomyParent = new Map();
  const local = value => typeof value === 'string' ? value : (value?.[lang] ?? value?.zh ?? '');

  function indexTree(nodes, byId, parentMap, parent = null) {
    (nodes || []).forEach(node => {
      byId.set(node.id, node);
      if (parent) parentMap.set(node.id, parent.id);
      if (node.children) indexTree(node.children, byId, parentMap, node);
    });
  }
  function buildIndexes() {
    selectionById.clear(); selectionParent.clear(); taxonomyById.clear(); taxonomyParent.clear();
    D.selectionGroups.forEach(group => indexTree(group.entries, selectionById, selectionParent));
    indexTree(D.taxonomy, taxonomyById, taxonomyParent);
  }
  function routeSet(id, parentMap) {
    const out = new Set();
    while (id) { out.add(id); id = parentMap.get(id) || null; }
    return out;
  }

  function selectionNode(node, depth, route) {
    const wrap = document.createElement('div');
    wrap.className = `selection-node ${node.children ? 'selection-branch' : 'selection-leaf'}`;
    wrap.dataset.selectionNode = node.id;
    wrap.style.setProperty('--tree-depth', depth);
    if (route.has(node.id)) wrap.classList.add('is-selected-route');
    if (activeSelection?.id === node.id) wrap.classList.add('is-selected');

    const row = document.createElement('div'); row.className = 'selection-row';
    const dash = document.createElement('span'); dash.className = 'tree-dash'; dash.textContent = '−';
    row.appendChild(dash);

    const button = document.createElement('button'); button.type = 'button';
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
    row.appendChild(button); wrap.appendChild(row);

    if (node.children?.length) {
      const children = document.createElement('div'); children.className = 'selection-children';
      node.children.forEach(child => children.appendChild(selectionNode(child, depth + 1, route)));
      wrap.appendChild(children);
    }
    return wrap;
  }

  function renderSelection() {
    const route = activeSelection ? routeSet(activeSelection.id, selectionParent) : new Set();
    selectionTree.replaceChildren();
    D.selectionGroups.forEach(group => {
      const section = document.createElement('section');
      section.className = `selection-group ${group.treeLabel ? 'selection-group-tree-label' : ''}`;
      if (group.treeLabel) {
        const heading = document.createElement('div'); heading.className = 'selection-group-heading';
        const dash = document.createElement('span'); dash.className = 'tree-dash'; dash.textContent = '−';
        const text = document.createElement('span'); text.textContent = local(group.label);
        heading.append(dash, text); section.appendChild(heading);
      }
      const nodes = document.createElement('div'); nodes.className = 'selection-group-nodes';
      (group.entries || []).forEach(node => nodes.appendChild(selectionNode(node, group.treeLabel ? 1 : 0, route)));
      section.appendChild(nodes); selectionTree.appendChild(section);
    });
  }

  function taxonomyNode(node, route) {
    const wrap = document.createElement('div');
    wrap.className = `taxonomy-node ${node.children ? 'taxonomy-branch' : 'taxonomy-leaf'}`;
    wrap.dataset.taxonomyNode = node.id;
    if (route.has(node.id)) wrap.classList.add('is-route');
    if (activeSelection?.taxonomy === node.id) wrap.classList.add('is-target');
    const row = document.createElement('div'); row.className = 'taxonomy-row'; row.dataset.taxonomyId = node.id;
    const dash = document.createElement('span'); dash.className = 'tree-dash'; dash.textContent = '−';
    const label = document.createElement('span'); label.className = 'taxonomy-label'; label.textContent = local(node.label);
    row.append(dash, label); wrap.appendChild(row);
    if (node.children?.length) {
      const children = document.createElement('div'); children.className = 'taxonomy-children';
      node.children.forEach(child => children.appendChild(taxonomyNode(child, route)));
      wrap.appendChild(children);
    }
    return wrap;
  }
  function renderTaxonomy() {
    const route = activeSelection?.taxonomy ? routeSet(activeSelection.taxonomy, taxonomyParent) : new Set();
    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));
  }

  function taxonomyPath(id) {
    const ids = [];
    while (id) { ids.unshift(id); id = taxonomyParent.get(id) || null; }
    return ids.map(key => local(taxonomyById.get(key)?.label)).filter(Boolean);
  }
  function ownerLabel(selection) {
    let id = selection?.id, owner = null;
    while (id) {
      const parent = selectionParent.get(id);
      if (!parent) break;
      owner = selectionById.get(parent); id = parent;
    }
    return owner ? local(owner.label) : local(selection?.label);
  }
  function cornerMarks() {
    const frag = document.createDocumentFragment();
    ['a','b','c','d'].forEach(key => { const mark = document.createElement('span'); mark.className = `sheet-register reg-${key}`; frag.appendChild(mark); });
    return frag;
  }

  function renderEmpty() {
    stack.className = 'sheet-stack is-empty'; stack.replaceChildren();
    const sheet = document.createElement('article'); sheet.className = 'archive-sheet empty-sheet';
    const visual = document.createElement('div'); visual.className = 'sheet-visual'; visual.appendChild(cornerMarks());
    const empty = document.createElement('div'); empty.className = 'empty-drawing';
    const symbol = document.createElement('span'); symbol.className = 'empty-symbol';
    const hint = document.createElement('small'); hint.textContent = UI.choose[lang];
    empty.append(symbol, hint); visual.appendChild(empty);
    const footer = document.createElement('footer'); footer.className = 'sheet-footer';
    const main = document.createElement('div'); main.className = 'sheet-footer-main';
    const title = document.createElement('div'); title.className = 'sheet-title'; title.textContent = UI.emptyTitle[lang];
    const note = document.createElement('div'); note.className = 'sheet-note'; note.textContent = UI.emptyNote[lang];
    main.append(title, note); footer.appendChild(main); sheet.append(visual, footer); stack.appendChild(sheet);
  }

  function loading(host) { const el = document.createElement('div'); el.className = 'sheet-loading'; el.textContent = UI.loading[lang]; host.replaceChildren(el); }
  function fileCard(host, record, title, copy = '') {
    const card = document.createElement('div'); card.className = 'sheet-file-card';
    const ext = document.createElement('span'); ext.className = 'sheet-file-extension'; ext.textContent = (record.asset?.filename || record.asset?.src || 'FILE').split('.').pop().toUpperCase();
    const h = document.createElement('strong'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = copy;
    card.append(ext, h, p); host.replaceChildren(card);
  }
  function renderAsset(host, record) {
    const asset = record?.asset;
    if (!asset?.src) return fileCard(host, record, UI.missing[lang]);
    if (asset.type === 'heic') return fileCard(host, record, UI.heic[lang], UI.heicHint[lang]);
    if (asset.type === 'pdf') {
      const frame = document.createElement('iframe'); frame.className = 'sheet-pdf-frame'; frame.title = local(record.title); frame.loading = 'eager'; frame.src = encodeURI(asset.src); host.replaceChildren(frame); return;
    }
    if (asset.type === 'text') {
      loading(host);
      fetch(encodeURI(asset.src), {cache:'no-store'}).then(r => { if (!r.ok) throw Error(r.status); return r.text(); }).then(text => {
        if (!host.isConnected) return;
        const view = document.createElement('div'); view.className = 'sheet-text-view';
        const pre = document.createElement('pre'); pre.textContent = text; view.appendChild(pre); host.replaceChildren(view);
      }).catch(() => { if (host.isConnected) fileCard(host, record, UI.missing[lang]); });
      return;
    }
    loading(host);
    const img = new Image(); img.alt = local(record.title); img.decoding = 'async'; img.draggable = false;
    img.addEventListener('load', () => { if (host.isConnected) host.replaceChildren(img); }, {once:true});
    img.addEventListener('error', () => { if (host.isConnected) fileCard(host, record, UI.missing[lang]); }, {once:true});
    img.src = encodeURI(asset.src);
  }

  function makeSheet(record, recordIndex, slotIndex, lastSlot, isFront, count) {
    const sheet = document.createElement('article');
    sheet.className = `archive-sheet ${isFront ? 'is-front' : 'is-back'}`;
    sheet.style.setProperty('--sheet-z', slotIndex + 1);
    sheet.style.setProperty('--stack-x', `${-(lastSlot - slotIndex) * 28}px`);
    sheet.style.setProperty('--stack-y', `${-(lastSlot - slotIndex) * 32}px`);
    if (!isFront) {
      sheet.tabIndex = 0; sheet.setAttribute('role','button');
      sheet.addEventListener('click', () => setActiveRecord(recordIndex));
      sheet.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveRecord(recordIndex); } });
    }
    const visual = document.createElement('div'); visual.className = 'sheet-visual';
    const assetHost = document.createElement('div'); assetHost.className = 'sheet-asset-host';
    visual.append(assetHost, cornerMarks()); if (isFront) renderAsset(assetHost, record);

    const footer = document.createElement('footer'); footer.className = 'sheet-footer';
    const main = document.createElement('div'); main.className = 'sheet-footer-main';
    const title = document.createElement('div'); title.className = 'sheet-title';
    title.textContent = `${ownerLabel(activeSelection)} · ${local(activeSelection.label)}${count > 1 ? ` ${recordIndex + 1}` : ''}`;
    const note = document.createElement('div'); note.className = 'sheet-note'; note.textContent = local(record.note) || '';
    const source = document.createElement('div'); source.className = 'sheet-source'; source.textContent = record.asset?.src || '';
    main.append(title, note, source);
    const side = document.createElement('div'); side.className = 'sheet-footer-side';
    const route = document.createElement('div'); route.className = 'sheet-route'; route.textContent = taxonomyPath(activeSelection.taxonomy).slice(-2).join(' / ');
    const link = document.createElement('a'); link.className = 'sheet-open-source'; link.target = '_blank'; link.rel = 'noopener'; link.textContent = UI.openSource[lang];
    if (record.asset?.src) link.href = encodeURI(record.asset.src); else link.hidden = true;
    side.append(route, link); footer.append(main, side); sheet.append(visual, footer); return sheet;
  }

  function renderStack() {
    if (!activeSelection?.records?.length) return renderEmpty();
    const records = activeSelection.records;
    activeRecordIndex = Math.max(0, Math.min(records.length - 1, activeRecordIndex));
    const order = records.map((_,i) => i).filter(i => i !== activeRecordIndex).concat(activeRecordIndex);
    stack.className = 'sheet-stack is-selected'; stack.replaceChildren();
    const last = order.length - 1;
    order.forEach((recordIndex, slotIndex) => stack.appendChild(makeSheet(records[recordIndex], recordIndex, slotIndex, last, slotIndex === last, records.length)));
  }
  function setActiveRecord(index, updateHash = true) {
    if (!activeSelection?.records?.length) return;
    const n = activeSelection.records.length; activeRecordIndex = ((index % n) + n) % n; renderStack(); if (updateHash) writeHash();
  }
  function selectArchive(selection, options = {}) {
    if (!selection?.taxonomy || !selection.records?.length) return;
    activeSelection = selection; activeRecordIndex = options.recordIndex ?? selection.records.length - 1;
    renderSelection(); renderTaxonomy(); renderStack();
    requestAnimationFrame(() => {
      taxonomyRoot.querySelector(`[data-taxonomy-id="${CSS.escape(selection.taxonomy)}"]`)?.scrollIntoView?.({block:'nearest'});
      scheduleConnector(); setTimeout(scheduleConnector, 220);
    });
    if (!options.skipHistory) writeHash();
  }

  function writeHash() {
    if (!activeSelection) return history.replaceState(null,'',location.pathname + location.search);
    history.replaceState(null,'',`#${encodeURIComponent(activeSelection.id)}/${activeRecordIndex + 1}`);
  }
  function restoreHash() {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (!raw) return renderEmpty();
    const [id, indexRaw] = raw.split('/'); const selection = selectionById.get(id);
    if (!selection?.taxonomy || !selection.records?.length) return renderEmpty();
    const index = Math.max(0, (parseInt(indexRaw,10) || selection.records.length) - 1);
    selectArchive(selection, {recordIndex:index, skipHistory:true});
  }

  function scheduleConnector() { cancelAnimationFrame(connectorRaf); connectorRaf = requestAnimationFrame(drawConnector); }
  function drawConnector() {
    connectorPath.setAttribute('d','');
    if (!activeSelection) return connector.classList.remove('is-visible');
    const selected = selectionTree.querySelector(`[data-selection-id="${CSS.escape(activeSelection.id)}"]`);
    const target = taxonomyRoot.querySelector(`[data-taxonomy-id="${CSS.escape(activeSelection.taxonomy)}"] .taxonomy-label`);
    if (!selected || !target) return connector.classList.remove('is-visible');
    const a = selected.getBoundingClientRect(), b = target.getBoundingClientRect();
    const pr = projectIndex.getBoundingClientRect(), tr = engineeringIndex.getBoundingClientRect();
    if (a.bottom < pr.top || a.top > pr.bottom || b.bottom < tr.top || b.top > tr.bottom) return connector.classList.remove('is-visible');
    connector.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
    const x1 = Math.max(a.right + 24, pr.right - 88), y1 = a.top + a.height/2, gate = pr.right - 7;
    const x2 = Math.max(tr.left + 10, b.left - 16), y2 = b.top + b.height/2;
    connectorPath.setAttribute('d',`M ${x1.toFixed(1)} ${y1.toFixed(1)} H ${gate.toFixed(1)} V ${y2.toFixed(1)} H ${x2.toFixed(1)}`);
    connector.classList.add('is-visible');
  }

  function refreshLanguage(next) {
    lang = next; RL.applyMap(UI, lang, document, false); document.title = UI.title[lang];
    renderSelection(); renderTaxonomy(); renderStack(); scheduleConnector();
  }
  function bindNavigation() {
    stage.addEventListener('keydown', e => {
      if (!activeSelection?.records?.length) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setActiveRecord(activeRecordIndex + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setActiveRecord(activeRecordIndex - 1); }
    });
    stage.addEventListener('wheel', e => {
      if (!activeSelection?.records?.length || activeSelection.records.length < 2) return;
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 18 || performance.now() < wheelLock) return;
      wheelLock = performance.now() + 280; e.preventDefault(); setActiveRecord(activeRecordIndex + (d > 0 ? 1 : -1));
    }, {passive:false});
  }

  function install() {
    buildIndexes(); renderSelection(); renderTaxonomy(); bindNavigation(); restoreHash();
    addEventListener('resize',scheduleConnector,{passive:true});
    projectIndex.addEventListener('scroll',scheduleConnector,{passive:true});
    engineeringIndex.addEventListener('scroll',scheduleConnector,{passive:true});
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(scheduleConnector); ro.observe(projectIndex); ro.observe(engineeringIndex); }
    addEventListener('ruinlanguagechange', e => refreshLanguage(e.detail.lang));
    RL.applyMap(UI, lang, document, false); document.title = UI.title[lang];
  }
  install();
})();
