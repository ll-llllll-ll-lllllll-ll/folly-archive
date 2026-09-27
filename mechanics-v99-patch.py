from pathlib import Path


def replace_once(path: Path, old: str, new: str):
    text = path.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Expected block not found in {path}: {old[:90]!r}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')


js = Path('mechanics.js')
replace_once(js, "  const expandedProjectIds = new Set();\n", "")
replace_once(
    js,
    "      button.dataset.selectionId = node.id;\n      button.textContent = local(node.label);",
    "      button.dataset.selectionId = node.id;\n      button.dataset.recordCount = String(node.records.length);\n      button.textContent = local(node.label);"
)
replace_once(
    js,
    "      const expanded = expandedProjectIds.has(node.id) || route.has(node.id) || activeProjectId === node.id;",
    "      const expanded = activeProjectId === node.id;"
)
replace_once(js, "    expandedProjectIds.add(node.id);\n", "")
replace_once(js, "    if (activeProjectId) expandedProjectIds.add(activeProjectId);\n", "")

insert_before = "  function bindNavigation() {\n"
project_dismiss = """  function collapseProjectTree() {
    if (!activeProjectId) return;
    activeProjectId = null;
    renderSelection();
    renderTaxonomy();
    renderStack();
    scheduleConnector();
  }

  function bindProjectTreeDismiss() {
    document.addEventListener('pointerdown', event => {
      if (!activeProjectId) return;
      const activeCard = selectionTree.querySelector(
        `[data-selection-node=\"${CSS.escape(activeProjectId)}\"]`
      );
      if (activeCard?.contains(event.target)) return;
      if (event.target.closest('.selection-node.is-project-card')) return;
      collapseProjectTree();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') collapseProjectTree();
    });
  }

"""
replace_once(js, insert_before, project_dismiss + insert_before)
replace_once(
    js,
    "    bindNavigation();\n    restoreHash();",
    "    bindNavigation();\n    bindProjectTreeDismiss();\n    restoreHash();"
)

css = Path('mechanics.css')
css_text = css.read_text(encoding='utf-8')
marker = '/* v99 · inherited archive-drawer ASCII tree */'
if marker not in css_text:
    css_text += r'''


/* v99 · inherited archive-drawer ASCII tree */
/*
   The work cards now use the exact visual grammar of the main site's
   archive drawer: [+]/[-] state blocks plus ├── / └── branches. Only the
   active card is expanded; JS collapses it when focus moves elsewhere.
*/
.project-index .selection-node.is-project-card > .selection-row{
  min-height:27px !important;
  align-items:baseline !important;
  gap:8px !important
}
.project-index .selection-node.is-project-card > .selection-row > .tree-dash{
  width:31px !important;
  flex:0 0 31px !important;
  opacity:1 !important;
  color:var(--mechanics-inactive-ink) !important;
  font-size:0 !important;
  line-height:1 !important
}
.project-index .selection-node.is-project-card > .selection-row > .tree-dash::before{
  content:"[+]";
  display:inline-block;
  color:inherit;
  font:300 12px/1 "IBM Plex Mono",monospace;
  letter-spacing:0
}
.project-index .selection-node.is-project-card.is-card-selected > .selection-row > .tree-dash::before{
  content:"[-]";
  color:var(--reader-text)
}
.project-index .selection-node.is-project-card > .selection-row > .selection-project-select{
  padding:1px 0 3px !important;
  text-decoration:none !important
}

.project-index .selection-node.is-project-card > .selection-children{
  margin:5px 0 0 0 !important;
  padding:0 0 1px 30px !important;
  border-left:0 !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
  position:relative !important;
  min-height:27px !important;
  padding-left:47px !important;
  gap:7px !important;
  align-items:baseline !important;
  font-size:11px !important;
  line-height:1.45 !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{
  content:"├──" !important;
  position:absolute !important;
  left:0 !important;
  top:7px !important;
  width:auto !important;
  border:0 !important;
  transform:none !important;
  color:var(--reader-line-strong);
  font:300 11px/1 "IBM Plex Mono",monospace;
  letter-spacing:0;
  pointer-events:none
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node:last-child > .selection-row::before{
  content:"└──" !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash{
  width:29px !important;
  flex:0 0 29px !important;
  opacity:1 !important;
  color:var(--mechanics-inactive-ink) !important;
  font-size:0 !important;
  line-height:1 !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash::before{
  content:"[+]";
  display:inline-block;
  color:inherit;
  font:300 11px/1 "IBM Plex Mono",monospace;
  letter-spacing:0
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node.is-selected > .selection-row > .tree-dash::before{
  content:"[-]";
  color:var(--reader-text)
}
.project-index .selection-node.is-project-card > .selection-children .selection-select{
  padding:1px 0 3px !important;
  text-decoration:none !important;
  white-space:nowrap
}
.project-index .selection-node.is-project-card > .selection-children .selection-select[data-record-count]::after{
  content:" (" attr(data-record-count) ")";
  opacity:.72;
  font-weight:300;
  text-decoration:none
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node.is-selected > .selection-row::before,
.project-index .selection-node.is-project-card > .selection-children > .selection-node.is-selected > .selection-row > .tree-dash{
  color:var(--reader-text) !important
}

@media(max-width:800px){
  .project-index .selection-node.is-project-card > .selection-children{
    padding-left:24px !important
  }
  .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
    padding-left:44px !important;
    min-height:29px !important;
    font-size:12px !important
  }
  .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{
    top:8px !important
  }
}
'''
    css.write_text(css_text, encoding='utf-8')

html = Path('mechanics.html')
html_text = html.read_text(encoding='utf-8')
html_text = html_text.replace('mechanics.css?v=98', 'mechanics.css?v=99')
html_text = html_text.replace('mechanics.js?v=98', 'mechanics.js?v=99')
html.write_text(html_text, encoding='utf-8')
