from pathlib import Path
import re

# mechanics.js ---------------------------------------------------------------
p = Path('mechanics.js')
s = p.read_text(encoding='utf-8')

s = s.replace(
"    databaseIntro:{zh:'以作品为入口检索技术档案。数据库将墟构实践中散落的技术信息、经验、想法、技法与功法拆解为一个个可追溯的“技术点”，持续归档与连接。',en:'Use each work as an entry point into the technical archive. The database gathers ruinwright knowledge, experience, ideas, techniques and working methods as traceable technical points.',ja:'作品を入口に技術記録を検索します。データベースは、墟構に関する技術情報・経験・発想・技法・工法を、追跡可能な「技術点」として蓄積し結びます。'},",
"    databaseIntro:{zh:'这里不是作品目录，而是“技术点”的检索入口。以作品为线索，追踪其中使用、生成或修正的技术、经验、想法、技法与工法；这些实践再归入中央的「墟构工程总数据库」，持续归档并互相连接。',en:'This is not a catalogue of works, but an index into technical points. Each work traces techniques, experience, ideas and working methods used, produced or revised through practice; those points return to the central engineering database and remain connected.',ja:'ここは作品目録ではなく「技術点」への検索入口です。作品を手掛かりに、実践で用いられ、生まれ、修正された技術・経験・発想・技法・工法を追跡し、それらを中央の墟構工程データベースへ戻して継続的に記録・接続します。'},\n    projectPrompt:{zh:'该作品已展开。选择其中一个技术点，可继续进入中央数据库并查看对应实践档案。',en:'This work is open. Choose a technical point to enter the central database and inspect its practice records.',ja:'この作品を展開しました。技術点を選ぶと中央データベースへ進み、対応する実践記録を閲覧できます。'},"
)

s = s.replace(
"  let activeSelection = null;\n  let activeRecordIndex = 0;",
"  let activeSelection = null;\n  let activeRecordIndex = 0;\n  let activeProjectId = null;\n  const expandedProjectIds = new Set();"
)

marker = "  function taxonomyScope(id) {"
helpers = """  function projectRootId(selectionId) {\n    let id = selectionId;\n    let parent = selectionParent.get(id) || null;\n    while (parent) {\n      id = parent;\n      parent = selectionParent.get(id) || null;\n    }\n    return id || null;\n  }\n\n  function projectTaxonomyRoute(projectId) {\n    const route = new Set();\n    const root = selectionById.get(projectId);\n    const collect = node => {\n      if (!node) return;\n      if (node.taxonomy) {\n        routeSet(node.taxonomy, taxonomyParent).forEach(id => route.add(id));\n      }\n      (node.children || []).forEach(collect);\n    };\n    collect(root);\n    return route;\n  }\n\n"""
if marker not in s:
    raise SystemExit('taxonomyScope marker missing')
s = s.replace(marker, helpers + marker, 1)

selection_fn = r"  function selectionNode\(node, depth, route, categoryLabel = ''\) \{.*?\n  \}\n\n  function renderSelection\(\) \{"
selection_repl = r'''  function selectionNode(node, depth, route, categoryLabel = '') {
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
      button.textContent = local(node.label);
      button.addEventListener('click', event => {
        event.stopPropagation();
        selectArchive(node);
      });
    } else if (isProjectCard) {
      const expanded = expandedProjectIds.has(node.id) || route.has(node.id) || activeProjectId === node.id;
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

  function renderSelection() {'''
s, n = re.subn(selection_fn, selection_repl, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'selectionNode replacement count={n}')

s = s.replace(
"      const categoryLabel = group.treeLabel\n        ? local({zh:'草图项目',en:'Sketch project',ja:'スケッチプロジェクト'})\n        : local({zh:'废墟园林作品',en:'Folly work',ja:'フォリー作品'});",
"      const categoryLabel = group.treeLabel\n        ? local({zh:'草图项目 / 技术点',en:'Sketch project / technical points',ja:'スケッチプロジェクト / 技術点'})\n        : local({zh:'废墟园林作品 / 技术点',en:'Folly work / technical points',ja:'フォリー作品 / 技術点'});"
)

old_render_tax = """  function renderTaxonomy() {\n    const route = activeSelection?.taxonomy\n      ? routeSet(activeSelection.taxonomy, taxonomyParent)\n      : new Set();\n    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));\n  }"""
new_render_tax = """  function renderTaxonomy() {\n    let route = activeSelection?.taxonomy\n      ? routeSet(activeSelection.taxonomy, taxonomyParent)\n      : new Set();\n    if (!activeSelection?.taxonomy && activeProjectId) {\n      route = projectTaxonomyRoute(activeProjectId);\n    }\n    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));\n  }"""
if old_render_tax not in s:
    raise SystemExit('renderTaxonomy marker missing')
s = s.replace(old_render_tax, new_render_tax, 1)

# Project-level selection: open the card/tree but do not pretend the whole work is one archive file.
select_marker = "  function selectArchive(selection, options = {}) {"
project_select = """  function selectProjectCard(node) {\n    if (!node?.id) return;\n    activeProjectId = node.id;\n    expandedProjectIds.add(node.id);\n    activeSelection = null;\n    activeRecordIndex = 0;\n    renderSelection();\n    renderTaxonomy();\n    renderEmpty();\n    connector.classList.remove('is-visible');\n    connectorPath.setAttribute('d','');\n    history.replaceState(null, '', location.pathname + location.search);\n    requestAnimationFrame(() => {\n      scheduleConnector();\n      engineeringIndex.scrollTop = 0;\n    });\n  }\n\n"""
if select_marker not in s:
    raise SystemExit('selectArchive marker missing')
s = s.replace(select_marker, project_select + select_marker, 1)

s = s.replace(
"  function selectArchive(selection, options = {}) {\n    if (!selection?.taxonomy || !selection.records?.length) return;\n\n    activeSelection = selection;",
"  function selectArchive(selection, options = {}) {\n    if (!selection?.taxonomy || !selection.records?.length) return;\n\n    activeProjectId = projectRootId(selection.id);\n    if (activeProjectId) expandedProjectIds.add(activeProjectId);\n    activeSelection = selection;",
1
)

s = s.replace(
"  function selectTaxonomy(node, options = {}) {\n    if (!node?.id) return;\n\n    const records = collectTaxonomyRecords(node.id);",
"  function selectTaxonomy(node, options = {}) {\n    if (!node?.id) return;\n\n    activeProjectId = null;\n    const records = collectTaxonomyRecords(node.id);",
1
)

# Give project-level selection a useful empty-stage caption.
old_empty_hint = """    hint.textContent = activeSelection?.isTaxonomyBrowse\n      ? local(activeSelection.label)\n      : UI.choose[lang];"""
new_empty_hint = """    const activeProject = activeProjectId ? selectionById.get(activeProjectId) : null;\n    hint.textContent = activeSelection?.isTaxonomyBrowse\n      ? local(activeSelection.label)\n      : activeProject\n        ? local(activeProject.label)\n        : UI.choose[lang];"""
s = s.replace(old_empty_hint, new_empty_hint, 1)
old_empty_title = """    title.textContent = activeSelection?.isTaxonomyBrowse\n      ? local(activeSelection.label)\n      : UI.emptyTitle[lang];"""
new_empty_title = """    title.textContent = activeSelection?.isTaxonomyBrowse\n      ? local(activeSelection.label)\n      : activeProject\n        ? local(activeProject.label)\n        : UI.emptyTitle[lang];"""
s = s.replace(old_empty_title, new_empty_title, 1)
old_empty_note = """    note.textContent = activeSelection?.isTaxonomyBrowse\n      ? UI.noCategoryRecords[lang]\n      : UI.emptyNote[lang];"""
new_empty_note = """    note.textContent = activeSelection?.isTaxonomyBrowse\n      ? UI.noCategoryRecords[lang]\n      : activeProject\n        ? UI.projectPrompt[lang]\n        : UI.emptyNote[lang];"""
s = s.replace(old_empty_note, new_empty_note, 1)

p.write_text(s, encoding='utf-8')

# mechanics.css --------------------------------------------------------------
p = Path('mechanics.css')
c = p.read_text(encoding='utf-8')
append = r'''

/* ==========================================================================
   v98 · technical-point finding aid / archive-tree cards / foreground file
   ========================================================================== */
:root{
  --mechanics-inactive-ink:rgba(23,23,23,.50);
  --mechanics-secondary-ink:rgba(23,23,23,.56)
}

/* The left rail is a finding aid, not a disabled-looking secondary menu. */
.project-index .project-index-head{
  color:var(--mechanics-secondary-ink) !important;
  opacity:1 !important
}
.project-index .project-index-description{
  max-width:330px !important;
  color:rgba(23,23,23,.52) !important;
  opacity:1 !important;
  line-height:1.56 !important
}
.project-index .selection-group-nodes > .selection-node.is-project-card{
  cursor:crosshair;
  transition:border-color .16s ease,background .16s ease,opacity .16s ease
}
.project-index .selection-group-nodes > .selection-node.is-project-card::before{
  color:rgba(23,23,23,.54) !important;
  opacity:1 !important
}
.project-index .selection-group-nodes > .selection-node.is-project-card:hover{
  border-color:var(--reader-line-strong) !important;
  background:rgba(255,255,251,.39) !important
}
.project-index .selection-group-nodes > .selection-node.is-project-card.is-card-selected{
  border-color:var(--reader-line-strong) !important;
  background:rgba(255,255,251,.68) !important
}
.selection-project-select{
  appearance:none;
  border:0;
  background:none;
  padding:2px 0 3px;
  text-align:left;
  color:var(--mechanics-inactive-ink);
  font:inherit;
  font-weight:300;
  opacity:1;
  cursor:crosshair
}
.selection-node.is-card-selected > .selection-row > .selection-project-select,
.selection-node.is-selected-route > .selection-row > .selection-project-select{
  color:var(--reader-text);
  opacity:1
}

/* Archive-popup tree language: a vertical stem, short branch joints, quiet dashes. */
.project-index .selection-node.is-project-card > .selection-children{
  position:relative;
  margin:7px 0 0 14px !important;
  padding:3px 0 2px 17px !important;
  border-left:1px solid var(--tree-line) !important
}
.project-index .selection-node.is-project-card.is-card-selected > .selection-children,
.project-index .selection-node.is-project-card.is-selected-route > .selection-children{
  border-left-color:var(--reader-line-strong) !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
  position:relative;
  min-height:25px !important;
  padding-left:0 !important;
  gap:8px !important;
  font-size:11px !important;
  line-height:1.5 !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{
  content:"";
  position:absolute;
  left:-17px;
  top:50%;
  width:10px;
  border-top:1px solid var(--tree-line);
  transform:translateY(-.5px);
  pointer-events:none
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node.is-selected > .selection-row::before{
  border-top-color:var(--reader-text)
}
.project-index .selection-node.is-collapsed > .selection-children{display:none !important}

/* Unselected content should be legible medium grey, not faint-grey × opacity. */
.project-index .selection-node:not(.is-selected):not(.is-selected-route):not(.is-card-selected) > .selection-row,
.project-index .selection-node:not(.is-selected):not(.is-selected-route):not(.is-card-selected) > .selection-row > .selection-select,
.project-index .selection-node:not(.is-selected):not(.is-selected-route):not(.is-card-selected) > .selection-row > .selection-branch-label,
.project-index .selection-node:not(.is-selected):not(.is-selected-route):not(.is-card-selected) > .selection-row > .selection-project-select{
  color:var(--mechanics-inactive-ink) !important;
  opacity:1 !important
}
.engineering-index .taxonomy-node:not(.is-route):not(.is-target) > .taxonomy-row{
  color:var(--mechanics-inactive-ink) !important;
  opacity:1 !important
}
.engineering-index .taxonomy-node:not(.is-route):not(.is-target) > .taxonomy-row .taxonomy-label{
  opacity:1 !important
}

/* The selected physical file passes in front of the directory register. */
body.has-file-extraction-tray .file-tray-directory{
  z-index:3 !important
}
body.has-file-extraction-tray .file-tray-rack{
  z-index:20 !important;
  overflow:visible !important
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active{
  --base-y:-82px !important;
  --rack-z:400 !important;
  z-index:400 !important;
  isolation:isolate
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active::before,
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active::after,
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active .file-tray-index,
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active .file-tray-name{
  z-index:401 !important
}

@media(max-width:800px){
  .project-index .selection-group-nodes > .selection-node.is-project-card{
    padding-bottom:9px !important
  }
  .project-index .selection-node.is-project-card > .selection-row{
    min-height:34px !important
  }
  .project-index .selection-node.is-project-card > .selection-children{
    margin-top:5px !important;
    padding-left:18px !important
  }
  body.has-file-extraction-tray .file-extraction-tray{
    overflow:visible !important
  }
  body.has-file-extraction-tray .file-tray-rack{
    overflow:visible !important;
    justify-content:center !important
  }
  body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active{
    --base-y:-66px !important;
    z-index:500 !important
  }
}
'''
if 'v98 · technical-point finding aid' not in c:
    c += append
p.write_text(c, encoding='utf-8')

# mechanics.html -------------------------------------------------------------
p = Path('mechanics.html')
h = p.read_text(encoding='utf-8')
h = h.replace('mechanics.css?v=97', 'mechanics.css?v=98')
h = h.replace('mechanics-data.js?v=97', 'mechanics-data.js?v=98')
h = h.replace('mechanics.js?v=97', 'mechanics.js?v=98')
h = h.replace(
'以作品为入口检索技术档案。数据库将墟构实践中散落的技术信息、经验、想法、技法与功法拆解为一个个可追溯的“技术点”，持续归档与连接。',
'这里不是作品目录，而是“技术点”的检索入口。以作品为线索，追踪其中使用、生成或修正的技术、经验、想法、技法与工法；这些实践再归入中央的「墟构工程总数据库」，持续归档并互相连接。'
)
p.write_text(h, encoding='utf-8')
