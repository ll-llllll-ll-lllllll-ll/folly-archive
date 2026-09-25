(() => {
  const data = window.RUINWRIGHT_MECHANICS;
  const RL = window.RuinLanguage;
  if (!data || !RL || !data.sections) return;

  const UI = {
    title:{zh:'墟构机械数据库',en:'Ruinwright Mechanism Archive',ja:'墟構機械データベース'},
    manifesto:{zh:'墟构师宣言 ↗',en:'Manifesto ↗',ja:'墟構師宣言 ↗'},
    archive:{zh:'遗构馆 ↗',en:'Relic Archive ↗',ja:'遺構館 ↗'},
    archiveSeries:{zh:'档案系',en:'Archive series',ja:'アーカイブ系'},
    mechanicsDrawing:{zh:'机械草图',en:'Mechanics drawing',ja:'機械ドローイング'},
    workArchive:{zh:'作品档案',en:'Work archive',ja:'作品アーカイブ'},
    classification:{zh:'分类',en:'Classification',ja:'分類'},
    selectDrawing:{zh:'选择左侧草图档案',en:'Select a drawing record on the left',ja:'左のドローイング記録を選択'},
    selectWork:{zh:'选择左侧作品档案',en:'Select a work record on the left',ja:'左の作品記録を選択'},
    nothingDrawing:{zh:'未选择草图档案',en:'No drawing selected',ja:'ドローイング記録が未選択'},
    nothingWork:{zh:'未选择作品档案',en:'No work record selected',ja:'作品記録が未選択'},
    loadOnSelect:{zh:'档案文件只在被选中时加载。',en:'Archive files load only after selection.',ja:'記録ファイルは選択したときだけ読み込みます。'},
    missing:{zh:'档案文件缺失或无法读取',en:'Archive file missing or unreadable',ja:'記録ファイルが見つからないか読み込めません'},
    loading:{zh:'正在加载档案…',en:'Loading archive…',ja:'記録を読み込み中…'},
    openSource:{zh:'打开原文件 ↗',en:'Open source ↗',ja:'原ファイルを開く ↗'},
    heic:{zh:'HEIC 原始图像',en:'Original HEIC image',ja:'HEIC 原画像'},
    heicHint:{zh:'当前浏览器可能无法直接预览 HEIC。原文件仍保留在档案中。',en:'This browser may not preview HEIC directly. The source file remains linked.',ja:'このブラウザではHEICを直接表示できない場合があります。原ファイルへのリンクは保持されています。'},
    collapse:{zh:'折叠',en:'Collapse',ja:'折りたたむ'},
    expand:{zh:'展开',en:'Expand',ja:'展開'},
    records:{zh:'项',en:'records',ja:'件'}
  };

  const tree = document.getElementById('taxonomy-tree');
  const recordsEl = document.getElementById('mechanism-records');
  const filterLabel = document.getElementById('record-filter-label');
  const recordCount = document.getElementById('record-count');
  const taxonomyKicker = document.getElementById('taxonomy-kicker');
  const sheetVisual = document.getElementById('sheet-visual');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetNote = document.getElementById('sheet-note');
  const sheetTags = document.getElementById('sheet-tags');
  const sheetSource = document.getElementById('sheet-source');
  const sourceLink = document.getElementById('sheet-open-source');
  const allBtn = document.querySelector('.taxonomy-all');
  const allLabel = allBtn?.querySelector('[data-role="all-label"]');
  const sectionButtons = [...document.querySelectorAll('[data-mechanics-section]')];

  let lang = RL.read();
  let activeSection = 'drawing';
  let activeFilter = 'all';
  let activeRecord = null;
  let loadToken = 0;
  let nodeById = new Map();

  const local = value => typeof value === 'string' ? value : (value?.[lang] ?? value?.zh ?? '');
  const currentSection = () => data.sections[activeSection];
  const labelForTag = tag => local(data.tagLabels[tag] || tag);
  const assetURL = src => encodeURI(src);

  function descendantTags(node) {
    if (node.tag) return [node.tag];
    return [...new Set((node.children || []).flatMap(descendantTags))];
  }

  function indexNodes() {
    nodeById = new Map();
    const walk = nodes => nodes.forEach(node => {
      nodeById.set(node.id, node);
      if (node.children) walk(node.children);
    });
    walk(currentSection().taxonomy || []);
  }

  function renderSectionSwitch() {
    sectionButtons.forEach(button => {
      const selected = button.dataset.mechanicsSection === activeSection;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });
    document.body.dataset.mechanicsSection = activeSection;
  }

  function renderTree() {
    tree.replaceChildren();

    function renderNode(node) {
      const wrap = document.createElement('div');
      wrap.className = `taxonomy-node ${node.children ? 'taxonomy-node-branch' : 'taxonomy-node-leaf'}`;
      wrap.dataset.nodeId = node.id;

      const row = document.createElement('div');
      row.className = 'taxonomy-row';

      if (node.children) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'taxonomy-toggle';
        toggle.textContent = '−';
        toggle.setAttribute('aria-label', `${UI.collapse[lang]} ${local(node.label)}`);
        toggle.addEventListener('click', event => {
          event.stopPropagation();
          const collapsed = wrap.classList.toggle('collapsed');
          toggle.textContent = collapsed ? '+' : '−';
          toggle.setAttribute('aria-label', `${collapsed ? UI.expand[lang] : UI.collapse[lang]} ${local(node.label)}`);
        });
        row.appendChild(toggle);
      }

      const filter = document.createElement('button');
      filter.type = 'button';
      filter.className = 'taxonomy-filter';
      filter.dataset.filter = node.id;
      filter.textContent = local(node.label);
      filter.classList.toggle('active', activeFilter === node.id);
      row.appendChild(filter);
      wrap.appendChild(row);

      if (node.children) {
        const children = document.createElement('div');
        children.className = 'taxonomy-node-children';
        node.children.forEach(child => children.appendChild(renderNode(child)));
        wrap.appendChild(children);
      }
      return wrap;
    }

    (currentSection().taxonomy || []).forEach(node => tree.appendChild(renderNode(node)));
  }

  function filterTags(filterId) {
    if (filterId === 'all') return null;
    const node = nodeById.get(filterId);
    return node ? descendantTags(node) : [filterId];
  }

  function matches(record, filterId) {
    const tags = filterTags(filterId);
    return !tags || (record.tags || []).some(tag => tags.includes(tag));
  }

  function currentFilteredRecords() {
    return currentSection().records.filter(record => matches(record, activeFilter));
  }

  function updateFilterHeading() {
    const section = currentSection();
    if (taxonomyKicker) taxonomyKicker.textContent = local(section.taxonomyLabel);
    if (allLabel) allLabel.textContent = local(section.allLabel);
    const node = nodeById.get(activeFilter);
    filterLabel.textContent = activeFilter === 'all' ? local(section.allLabel) : local(node?.label);
  }

  function setFilter(filterId) {
    activeFilter = filterId;
    allBtn?.classList.toggle('active', filterId === 'all');
    renderTree();
    updateFilterHeading();
    renderRecords();
  }

  allBtn?.addEventListener('click', () => setFilter('all'));
  tree?.addEventListener('click', event => {
    const btn = event.target.closest('.taxonomy-filter');
    if (btn) setFilter(btn.dataset.filter);
  });

  sectionButtons.forEach(button => {
    button.addEventListener('click', () => setSection(button.dataset.mechanicsSection));
  });

  function renderRecords() {
    const filtered = currentFilteredRecords();
    recordsEl.replaceChildren();
    const frag = document.createDocumentFragment();

    filtered.forEach(record => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mechanism-record';
      button.dataset.recordCode = record.code;
      if (activeRecord?.code === record.code) button.classList.add('active');

      const title = document.createElement('span');
      title.className = 'record-title';
      title.textContent = local(record.title);

      const meta = document.createElement('span');
      meta.className = 'record-filemeta';
      meta.textContent = record.meta || record.asset?.filename || '';

      button.append(title, meta);
      button.addEventListener('click', () => selectRecord(record));
      frag.appendChild(button);
    });

    recordsEl.appendChild(frag);
    if (recordCount) recordCount.textContent = `${filtered.length} ${UI.records[lang]}`;
  }

  function renderSheetTags(record) {
    sheetTags.replaceChildren();
    (record.tags || []).forEach(tag => {
      const matchingNode = [...nodeById.values()].find(node => node.tag === tag);
      if (!matchingNode) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sheet-tag';
      btn.textContent = labelForTag(tag);
      btn.addEventListener('click', () => setFilter(matchingNode.id));
      sheetTags.appendChild(btn);
    });
  }

  function emptyVisual(message) {
    sheetVisual.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty-drawing';
    const symbol = document.createElement('span');
    symbol.className = 'empty-symbol';
    const small = document.createElement('small');
    small.textContent = message;
    empty.append(symbol, small);
    sheetVisual.appendChild(empty);
  }

  function filePlaceholder(title, message, record) {
    sheetVisual.replaceChildren();
    const card = document.createElement('div');
    card.className = 'sheet-file-card';
    const ext = document.createElement('div');
    ext.className = 'sheet-file-extension';
    ext.textContent = (record.asset?.filename?.split('.').pop() || 'FILE').toUpperCase();
    const heading = document.createElement('strong');
    heading.textContent = title;
    const copy = document.createElement('p');
    copy.textContent = message;
    const link = document.createElement('a');
    link.className = 'sheet-file-open';
    link.href = assetURL(record.asset.src);
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = UI.openSource[lang];
    card.append(ext, heading, copy, link);
    sheetVisual.appendChild(card);
  }

  function renderAsset(record) {
    const token = ++loadToken;
    const a = record.asset;
    if (!a?.src) {
      emptyVisual(UI.missing[lang]);
      return;
    }

    if (a.type === 'heic') {
      filePlaceholder(UI.heic[lang], UI.heicHint[lang], record);
      return;
    }

    if (a.type === 'pdf') {
      sheetVisual.replaceChildren();
      const frame = document.createElement('iframe');
      frame.className = 'sheet-pdf-frame';
      frame.title = local(record.title);
      frame.loading = 'eager';
      frame.src = assetURL(a.src);
      sheetVisual.appendChild(frame);
      return;
    }

    if (a.type === 'text') {
      sheetVisual.innerHTML = `<div class="sheet-loading">${UI.loading[lang]}</div>`;
      fetch(assetURL(a.src), {cache:'no-store'})
        .then(response => {
          if (!response.ok) throw new Error(String(response.status));
          return response.text();
        })
        .then(text => {
          if (token !== loadToken || activeRecord?.code !== record.code) return;
          const scroller = document.createElement('div');
          scroller.className = 'sheet-text-view';
          const pre = document.createElement('pre');
          pre.textContent = text;
          scroller.appendChild(pre);
          sheetVisual.replaceChildren(scroller);
        })
        .catch(() => {
          if (token !== loadToken || activeRecord?.code !== record.code) return;
          emptyVisual(UI.missing[lang]);
        });
      return;
    }

    sheetVisual.innerHTML = `<div class="sheet-loading">${UI.loading[lang]}</div>`;
    const img = new Image();
    img.alt = local(record.title);
    img.decoding = 'async';
    img.draggable = false;
    img.addEventListener('load', () => {
      if (token !== loadToken || activeRecord?.code !== record.code) return;
      sheetVisual.replaceChildren(img);
    }, {once:true});
    img.addEventListener('error', () => {
      if (token !== loadToken || activeRecord?.code !== record.code) return;
      emptyVisual(UI.missing[lang]);
    }, {once:true});
    img.src = assetURL(a.src);
  }

  function updateSource(record) {
    const src = record?.asset?.src || '';
    if (sheetSource) sheetSource.textContent = src;
    if (sourceLink) {
      sourceLink.hidden = !src;
      if (src) sourceLink.href = assetURL(src);
      sourceLink.textContent = UI.openSource[lang];
    }
  }

  function selectRecord(record, options = {}) {
    activeRecord = record;
    sheetTitle.textContent = local(record.title);
    sheetNote.textContent = local(record.note) || '';
    renderSheetTags(record);
    updateSource(record);
    renderRecords();
    renderAsset(record);

    if (!options.skipHistory) {
      history.replaceState(null, '', `#${activeSection}/${encodeURIComponent(record.code)}`);
    }
  }

  function resetSheet() {
    activeRecord = null;
    loadToken++;
    const isWork = activeSection === 'work';
    sheetTitle.textContent = isWork ? UI.nothingWork[lang] : UI.nothingDrawing[lang];
    sheetNote.textContent = UI.loadOnSelect[lang];
    sheetTags.replaceChildren();
    if (sheetSource) sheetSource.textContent = '';
    if (sourceLink) sourceLink.hidden = true;
    emptyVisual(isWork ? UI.selectWork[lang] : UI.selectDrawing[lang]);
  }

  function setSection(sectionId, options = {}) {
    if (!data.sections[sectionId]) return;
    activeSection = sectionId;
    activeFilter = 'all';
    activeRecord = null;
    indexNodes();
    renderSectionSwitch();
    allBtn?.classList.add('active');
    renderTree();
    updateFilterHeading();
    renderRecords();
    resetSheet();

    if (!options.skipHistory) history.replaceState(null, '', `#${activeSection}`);
  }

  function refreshLanguage(nextLang, animated) {
    lang = nextLang;
    RL.applyMap(UI, lang, document, animated);
    document.title = UI.title[lang];
    indexNodes();
    renderSectionSwitch();
    renderTree();
    updateFilterHeading();
    renderRecords();

    if (activeRecord) {
      sheetTitle.textContent = local(activeRecord.title);
      sheetNote.textContent = local(activeRecord.note) || '';
      renderSheetTags(activeRecord);
      updateSource(activeRecord);
      if (activeRecord.asset?.type === 'heic') {
        filePlaceholder(UI.heic[lang], UI.heicHint[lang], activeRecord);
      }
    } else {
      resetSheet();
    }
  }

  function restoreFromHash() {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (!raw) {
      setSection('drawing', {skipHistory:true});
      return;
    }

    let sectionId = 'drawing';
    let code = raw;
    const slash = raw.indexOf('/');
    if (slash > -1) {
      const maybeSection = raw.slice(0, slash);
      if (data.sections[maybeSection]) {
        sectionId = maybeSection;
        code = raw.slice(slash + 1);
      }
    } else {
      for (const [key, section] of Object.entries(data.sections)) {
        if (section.records.some(item => item.code === code)) {
          sectionId = key;
          break;
        }
      }
    }

    setSection(sectionId, {skipHistory:true});
    const found = currentSection().records.find(item => item.code === code);
    if (found) selectRecord(found, {skipHistory:true});
  }

  window.addEventListener('ruinlanguagechange', event => {
    document.body.classList.add('language-changing');
    refreshLanguage(event.detail.lang, event.detail.animated);
    setTimeout(() => document.body.classList.remove('language-changing'), 260);
  });

  RL.bind();
  refreshLanguage(RL.read(), false);
  restoreFromHash();
})();
