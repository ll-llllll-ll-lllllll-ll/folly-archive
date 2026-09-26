from pathlib import Path

# ------------------------------------------------------------
# mechanics-data.js · make the left index consistently work -> technical points
# ------------------------------------------------------------
p = Path('mechanics-data.js')
s = p.read_text(encoding='utf-8')

s = s.replace(
    "label: L('材料与实验', 'Materials and experiments', '材料・実験')",
    "label: L('材料、结构与工法', 'Materials, structures and methods', '材料・構造・工法')"
)
s = s.replace("材料与实验 / 石材垒砌", "材料、结构与工法 / 石材垒砌")
s = s.replace("Materials and experiments / stone masonry", "Materials, structures and methods / stone masonry")
s = s.replace("材料・実験 / 石積み", "材料・構造・工法 / 石積み")
s = s.replace("材料与实验 / 石材与风化", "材料、结构与工法 / 石材与风化")
s = s.replace("Materials and experiments / stone and weathering", "Materials, structures and methods / stone and weathering")
s = s.replace("材料・実験 / 石材・風化", "材料・構造・工法 / 石材・風化")

marker = "  window.RUINWRIGHT_ENGINEERING_ARCHIVE = {"
if marker not in s:
    raise SystemExit('data export marker not found')
normalize = r'''
  // Every left-hand card now opens into explicit technical points. Projects that
  // previously stored their records directly on the project node are normalized
  // into one technical-point child so Works and Drawing Projects read the same way.
  const taxonomyLabels = new Map();
  const indexTaxonomyLabels = nodes => (nodes || []).forEach(node => {
    taxonomyLabels.set(node.id, node.label);
    indexTaxonomyLabels(node.children);
  });
  indexTaxonomyLabels(taxonomy);
  projects.forEach(project => {
    if (!project.taxonomy || !project.records?.length || project.children?.length) return;
    const taxonomyId = project.taxonomy;
    project.children = [{
      id: `${project.id}-technical-point`,
      label: taxonomyLabels.get(taxonomyId) || project.label,
      taxonomy: taxonomyId,
      records: project.records
    }];
    delete project.taxonomy;
    delete project.records;
  });

'''
if 'projects.forEach(project =>' not in s:
    s = s.replace(marker, normalize + marker, 1)

s = s.replace("label: L('作品', 'Works', '作品')", "label: L('废墟园林作品', 'Folly works', 'フォリー作品')")
s = s.replace("entries: projects,\n        treeLabel: true", "entries: projects,\n        treeLabel: false")
p.write_text(s, encoding='utf-8')

# ------------------------------------------------------------
# mechanics.js · card selection/expansion + technical-point framing + intro
# ------------------------------------------------------------
p = Path('mechanics.js')
s = p.read_text(encoding='utf-8')

s = s.replace(
    "    browseByWork:{zh:'按作品检索',en:'Browse by work',ja:'作品から検索'},",
    "    browseByWork:{zh:'按作品检索',en:'Browse by work',ja:'作品から検索'},\n"
    "    practiceIntro:{zh:'这里不是作品目录，而是实践入口：每件作品汇集其采用、生成或验证的技术点，并与中部数据库中的技法、工法、经验与构造思路相互索引。',en:'This is a practice index rather than a portfolio: each work gathers the technical points it uses, produces or tests, cross-indexed with methods, construction knowledge and structural ideas in the central database.',ja:'ここは作品目録ではなく実践への入口です。各作品で用いられ、生成され、検証された技術点をまとめ、中央データベースの技法・工法・経験・構造的発想と相互参照します。'},\n"
    "    technicalPoints:{zh:'技术点',en:'Technical points',ja:'技術点'},"
)

s = s.replace(
    "  let connectorRaf = 0;\n  let wheelLock = 0;",
    "  let connectorRaf = 0;\n  let wheelLock = 0;\n  let activeWorkCardId = null;\n  const expandedWorkCards = new Set();"
)

start = s.find('  function selectionNode(node, depth, route) {')
end = s.find('\n  function taxonomyNode(node, route) {', start)
if start < 0 or end < 0:
    raise SystemExit('selection renderer block not found')

replacement = r'''  function topSelectionOwnerId(id) {
    let current = id;
    let parent = selectionParent.get(current);
    while (parent) {
      current = parent;
      parent = selectionParent.get(current);
    }
    return current;
  }

  function ensureProjectIntro() {
    const head = projectIndex?.querySelector('.project-index-head');
    if (!head) return;
    let intro = head.querySelector('.project-index-intro');
    if (!intro) {
      intro = document.createElement('p');
      intro.className = 'project-index-intro';
      intro.dataset.i18n = 'practiceIntro';
      head.appendChild(intro);
    }
    intro.textContent = UI.practiceIntro[lang];
  }

  function selectionNode(node, depth, route, meta = {}) {
    const isCard = !!meta.topLevel;
    const wrap = document.createElement('div');
    wrap.className = `selection-node ${node.children ? 'selection-branch' : 'selection-leaf'}${isCard ? ' selection-card' : ''}`;
    wrap.dataset.selectionNode = node.id;
    wrap.style.setProperty('--tree-depth', depth);

    if (route.has(node.id)) wrap.classList.add('is-selected-route');
    if (!activeSelection?.isTaxonomyBrowse && activeSelection?.id === node.id) {
      wrap.classList.add('is-selected');
    }

    if (isCard) {
      const routeOwnsCard = !activeSelection?.isTaxonomyBrowse && route.has(node.id);
      if (routeOwnsCard) expandedWorkCards.add(node.id);
      const open = expandedWorkCards.has(node.id) || routeOwnsCard;
      if (open) wrap.classList.add('is-open');
      if (activeWorkCardId === node.id || routeOwnsCard) wrap.classList.add('is-card-selected');
    }

    const row = document.createElement('div');
    row.className = `selection-row${isCard ? ' selection-card-row' : ''}`;

    if (isCard) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'selection-card-toggle';
      button.setAttribute('aria-expanded', wrap.classList.contains('is-open') ? 'true' : 'false');

      const type = document.createElement('span');
      type.className = 'selection-card-type';
      type.textContent = local(meta.groupLabel);

      const title = document.createElement('span');
      title.className = 'selection-card-title';
      title.textContent = local(node.label);

      button.append(type, title);
      button.addEventListener('click', () => {
        const wasOpen = expandedWorkCards.has(node.id);
        activeWorkCardId = node.id;
        if (wasOpen) expandedWorkCards.delete(node.id);
        else expandedWorkCards.add(node.id);
        renderSelection();
        scheduleConnector();
      });
      row.appendChild(button);
    } else {
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
    }

    wrap.appendChild(row);

    if (node.children?.length) {
      if (isCard) {
        const legend = document.createElement('div');
        legend.className = 'selection-card-tech-label';
        legend.textContent = UI.technicalPoints[lang];
        wrap.appendChild(legend);
      }
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

    ensureProjectIntro();
    selectionTree.replaceChildren();

    D.selectionGroups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'selection-group';

      const nodes = document.createElement('div');
      nodes.className = 'selection-group-nodes';
      (group.entries || []).forEach(node => {
        nodes.appendChild(selectionNode(node, 0, route, {
          topLevel: true,
          groupId: group.id,
          groupLabel: group.label
        }));
      });
      section.appendChild(nodes);
      selectionTree.appendChild(section);
    });
  }
'''
s = s[:start] + replacement + s[end:]

old = "  function selectArchive(selection, options = {}) {\n    if (!selection?.taxonomy || !selection.records?.length) return;\n\n    activeSelection = selection;"
new = "  function selectArchive(selection, options = {}) {\n    if (!selection?.taxonomy || !selection.records?.length) return;\n\n    const ownerId = topSelectionOwnerId(selection.id);\n    activeWorkCardId = ownerId;\n    expandedWorkCards.add(ownerId);\n    activeSelection = selection;"
if old not in s:
    raise SystemExit('selectArchive marker not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# ------------------------------------------------------------
# mechanics.html · cache bust, visual polish, finite central spine, file priority
# ------------------------------------------------------------
p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
s = s.replace('mechanics.css?v=96', 'mechanics.css?v=97')
s = s.replace('mechanics-data.js?v=96', 'mechanics-data.js?v=97')
s = s.replace('mechanics.js?v=96', 'mechanics.js?v=97')

old_sync = '''      function syncSpineMetrics() {\n        const ir = engineeringIndex.getBoundingClientRect();\n        const sr = titleSquare.getBoundingClientRect();\n        engineeringIndex.style.setProperty('--engineering-spine-x', `${(sr.left + sr.width / 2 - ir.left).toFixed(2)}px`);\n        engineeringIndex.style.setProperty('--engineering-spine-start', `${Math.max(0, sr.bottom - ir.top).toFixed(2)}px`);\n      }'''
new_sync = '''      function syncSpineMetrics() {\n        const ir = engineeringIndex.getBoundingClientRect();\n        const sr = titleSquare.getBoundingClientRect();\n        const rows = [...taxonomyRoot.querySelectorAll('.taxonomy-row')];\n        const last = rows.length ? rows[rows.length - 1].getBoundingClientRect() : null;\n        const start = Math.max(0, sr.bottom - ir.top);\n        const end = last ? Math.max(start, last.top + last.height / 2 - ir.top) : start;\n        engineeringIndex.style.setProperty('--engineering-spine-x', `${(sr.left + sr.width / 2 - ir.left).toFixed(2)}px`);\n        engineeringIndex.style.setProperty('--engineering-spine-start', `${start.toFixed(2)}px`);\n        engineeringIndex.style.setProperty('--engineering-spine-height', `${Math.max(0, end - start).toFixed(2)}px`);\n      }'''
if old_sync not in s:
    raise SystemExit('syncSpineMetrics marker not found')
s = s.replace(old_sync, new_sync, 1)

v97 = r'''
  <style id="mechanics-v97-technical-index">
    /* v97 · technical-point semantics / legible grey / finite central spine */
    .project-index-head{opacity:.72 !important;margin-bottom:18px !important}
    .project-index-intro{
      max-width:300px;
      margin:13px 0 0;
      color:var(--reader-text);
      opacity:.70;
      font-size:9px;
      line-height:1.62;
      letter-spacing:.02em
    }
    .selection-tree{gap:10px !important}
    .selection-group{gap:9px !important}
    .selection-group-heading{display:none !important}
    .selection-group-nodes{display:grid !important;gap:9px !important}
    .selection-group-nodes > .selection-card{
      padding:0 !important;
      overflow:hidden;
      border-color:var(--reader-line) !important;
      background:rgba(255,255,251,.20) !important;
      transition:border-color .18s ease,background .18s ease
    }
    .selection-group-nodes > .selection-card:hover{border-color:var(--reader-line-strong) !important;background:rgba(255,255,251,.36) !important}
    .selection-group-nodes > .selection-card.is-card-selected{border-color:var(--reader-line-strong) !important;background:rgba(255,255,251,.58) !important}
    .selection-card-row{min-height:0 !important;padding:0 !important}
    .selection-card-toggle{
      appearance:none;
      width:100%;
      display:grid;
      grid-template-columns:1fr auto;
      grid-template-areas:"type state" "title state";
      gap:2px 8px;
      padding:7px 10px 8px;
      border:0;
      background:none;
      color:var(--reader-text);
      text-align:left;
      opacity:.70;
      transition:opacity .14s ease
    }
    .selection-card-toggle:hover,.selection-card.is-card-selected > .selection-card-row .selection-card-toggle{opacity:1}
    .selection-card-toggle::after{
      content:"+";
      grid-area:state;
      align-self:center;
      color:var(--reader-text);
      opacity:.52;
      font:300 10px/1 "IBM Plex Mono",monospace
    }
    .selection-card.is-open > .selection-card-row .selection-card-toggle::after{content:"−"}
    .selection-card-type{grid-area:type;color:var(--reader-text);opacity:.68;font-size:7.5px;line-height:1.1;letter-spacing:.09em}
    .selection-card-title{grid-area:title;font-size:12.5px;line-height:1.2}
    .selection-card-tech-label{
      margin:0 10px 0 24px;
      padding:7px 0 3px;
      border-top:1px solid var(--reader-line);
      color:var(--reader-text);
      opacity:.66;
      font-size:7.5px;
      letter-spacing:.08em
    }
    .selection-card:not(.is-open) > .selection-card-tech-label,
    .selection-card:not(.is-open) > .selection-children{display:none !important}
    .selection-card > .selection-children{margin:0 10px 7px 24px !important;padding:0 0 1px 10px !important;border-left:1px solid var(--tree-line) !important}
    .selection-card > .selection-children .selection-row{min-height:21px !important;padding-left:0 !important;font-size:10px !important}
    .selection-select,.selection-branch-label{color:var(--reader-text) !important;opacity:.70 !important}
    .selection-node.is-selected-route > .selection-row > .selection-branch-label,
    .selection-node.is-selected > .selection-row > .selection-select{opacity:1 !important}

    .engineering-index{scroll-padding-top:70px !important;background-size:1px var(--engineering-spine-height,0px) !important}
    .engineering-title{z-index:18 !important;margin-bottom:0 !important;padding-bottom:11px !important;background:var(--reader-paper) !important}
    .engineering-title::after{
      content:"";
      position:absolute;
      left:0;
      right:0;
      top:100%;
      height:10px;
      background:linear-gradient(to bottom,var(--reader-paper),rgba(255,255,251,0));
      pointer-events:none
    }
    .engineering-title > [data-i18n="engineeringDatabase"]{opacity:.72 !important}
    .engineering-taxonomy{margin-top:14px !important;padding-top:0 !important}
    .taxonomy-row{color:var(--reader-text) !important;opacity:.70}
    .taxonomy-label{opacity:1 !important}
    .taxonomy-node.is-route > .taxonomy-row,.taxonomy-node.is-target > .taxonomy-row{opacity:1}

    .file-extraction-tray{z-index:90 !important}
    .file-tray-directory{z-index:20 !important}
    .file-tray-rack{z-index:30 !important;padding-bottom:15px !important}
    .file-tray-item.is-active{--base-y:-76px !important;--rack-z:999 !important;z-index:999 !important;opacity:1 !important}
    .file-tray-item.is-active .file-tray-name{opacity:1 !important}

    @media(max-width:800px){
      .project-index-intro{font-size:8.5px}
      .engineering-taxonomy{margin-top:8px !important}
      .file-tray-item.is-active{--base-y:-52px !important}
    }
  </style>
'''
needle = '  <script src="ruin-language.js?v=74"></script>'
if 'mechanics-v97-technical-index' not in s:
    if needle not in s:
        raise SystemExit('ruin language script marker not found')
    s = s.replace(needle, v97 + '\n' + needle, 1)

p.write_text(s, encoding='utf-8')
