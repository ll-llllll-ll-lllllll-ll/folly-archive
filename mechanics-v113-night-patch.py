from pathlib import Path

css = Path('mechanics.css')
s = css.read_text(encoding='utf-8')
marker = '/* v113 · unified adaptive night-mode surfaces */'
if marker not in s:
    s += r'''


/* v113 · unified adaptive night-mode surfaces
   Late mechanics UI used fixed white/black rgba values. Rebase those pieces on
   the live reader palette so the same slider works continuously in light, warm
   and night modes without a separate hard-cut dark theme. */
:root{
  --mechanics-ink-strong:var(--reader-text);
  --mechanics-ink:color-mix(in srgb,var(--reader-text) 72%,transparent);
  --mechanics-ink-soft:color-mix(in srgb,var(--reader-text) 58%,transparent);
  --mechanics-ink-faint:color-mix(in srgb,var(--reader-text) 44%,transparent);
  --mechanics-tree-line:color-mix(in srgb,var(--reader-text) 24%,transparent);
  --mechanics-tree-line-strong:color-mix(in srgb,var(--reader-text) 76%,transparent);
  --mechanics-surface:var(--reader-paper);
  --mechanics-card:color-mix(in srgb,var(--reader-paper) 94%,var(--reader-text) 6%);
  --mechanics-card-hover:color-mix(in srgb,var(--reader-paper) 90%,var(--reader-text) 10%);
  --mechanics-card-active:color-mix(in srgb,var(--reader-paper) 84%,var(--reader-text) 16%);
  --mechanics-strip:color-mix(in srgb,var(--reader-paper) 89%,var(--reader-text) 11%);
  --mechanics-file-idle:color-mix(in srgb,var(--reader-paper) 86%,var(--reader-text) 14%);
  --mechanics-file-active:color-mix(in srgb,var(--reader-paper) 94%,var(--reader-text) 6%);
  --mechanics-directory:color-mix(in srgb,var(--reader-paper) 90%,var(--reader-bg) 10%);
  --mechanics-tray-mid:color-mix(in srgb,var(--reader-paper) 54%,var(--reader-bg) 46%);
  --mechanics-inactive-ink:var(--mechanics-ink-soft);
  --mechanics-secondary-ink:var(--mechanics-ink)
}

/* Left finding aid */
.project-index,
.engineering-index,
.mechanics-topbar{
  background-color:var(--reader-paper) !important
}
.project-index .project-index-head{
  color:var(--mechanics-ink) !important;
  opacity:1 !important
}
.project-index .project-index-description{
  color:var(--mechanics-ink) !important;
  opacity:1 !important
}
.project-index .project-index-kicker,
.project-index .project-index-subtitle{
  color:var(--mechanics-ink-strong) !important
}
.project-index .project-index-divider{
  background:var(--mechanics-tree-line-strong) !important;
  opacity:.58 !important
}
.project-index .selection-group-nodes > .selection-node{
  border-color:var(--reader-line) !important;
  background:var(--mechanics-card) !important
}
.project-index .selection-group-nodes > .selection-node:hover{
  border-color:var(--reader-line-strong) !important;
  background:var(--mechanics-card-hover) !important
}
.project-index .selection-group-nodes > .selection-node.is-selected-route,
.project-index .selection-group-nodes > .selection-node.is-card-selected{
  border-color:var(--reader-line-strong) !important;
  background:var(--mechanics-card-active) !important
}
.project-index .selection-group-nodes > .selection-node.has-category-label::before,
.project-index .selection-group-nodes > .selection-node.is-project-card::before{
  background:var(--mechanics-strip) !important;
  color:var(--mechanics-ink) !important;
  opacity:1 !important
}
.project-index .selection-project-select,
.project-index .selection-select,
.project-index .selection-branch-label{
  color:var(--mechanics-ink-soft) !important;
  opacity:1 !important
}
.project-index .selection-node.is-selected-route > .selection-row > .selection-branch-label,
.project-index .selection-node.is-selected > .selection-row > .selection-select,
.project-index .selection-node.is-card-selected > .selection-row > .selection-project-select{
  color:var(--mechanics-ink-strong) !important;
  opacity:1 !important
}
.project-index .tree-dash{
  color:var(--mechanics-ink-faint) !important;
  opacity:1 !important
}
.project-index .selection-node.is-selected-route > .selection-row > .tree-dash{
  color:var(--mechanics-ink-strong) !important
}
.project-index .selection-children,
.project-index .selection-group-nodes > .selection-node > .selection-children{
  border-left-color:var(--mechanics-tree-line) !important
}
.project-index .selection-node.is-selected-route > .selection-children,
.project-index .selection-group-nodes > .selection-node.is-selected-route > .selection-children{
  border-left-color:var(--mechanics-tree-line-strong) !important
}

/* Central engineering tree: keep every row readable in night mode. */
body .engineering-index::before{
  background:var(--mechanics-tree-line) !important
}
.engineering-title,
body .engineering-index .engineering-title{
  color:var(--mechanics-ink-strong) !important;
  background:var(--reader-paper) !important
}
.engineering-title > [data-i18n="engineeringDatabase"]{
  color:var(--mechanics-ink-strong) !important;
  opacity:1 !important;
  font-weight:400 !important
}
.engineering-title-square{background:var(--mechanics-ink-strong) !important}
.taxonomy-row{
  color:var(--mechanics-ink-soft) !important;
  opacity:1 !important
}
.taxonomy-label{
  color:inherit !important;
  opacity:1 !important
}
.taxonomy-row .tree-dash{
  color:var(--mechanics-ink-faint) !important;
  opacity:1 !important
}
.taxonomy-children{
  border-left-color:var(--mechanics-tree-line) !important
}
.engineering-taxonomy > .taxonomy-node > .taxonomy-row::before{
  border-top-color:var(--mechanics-tree-line) !important
}
.taxonomy-node.is-route > .taxonomy-row,
.taxonomy-node.is-target > .taxonomy-row,
.taxonomy-row.is-fisheye-near{
  color:var(--mechanics-ink-strong) !important
}
.taxonomy-node.is-route > .taxonomy-row .tree-dash,
.taxonomy-node.is-target > .taxonomy-row .tree-dash{
  color:var(--mechanics-ink-strong) !important
}
.taxonomy-node.is-route > .taxonomy-children{
  border-left-color:var(--mechanics-tree-line-strong) !important
}
.engineering-taxonomy > .taxonomy-node.is-route > .taxonomy-row::before,
.engineering-taxonomy > .taxonomy-node.is-target > .taxonomy-row::before{
  border-top-color:var(--mechanics-tree-line-strong) !important
}
#directory-connector-path,
#taxonomy-route-path{
  stroke:var(--mechanics-ink-strong) !important
}

/* Top tools */
.mechanics-topbar{
  border-bottom-color:var(--reader-line-strong) !important
}
.mechanics-nav a,
.language-switch,
.language-switch button,
.reader-tone-control{
  color:var(--mechanics-ink-soft) !important
}
.mechanics-nav a:hover,
.language-switch button:hover,
.language-switch button.active{
  color:var(--mechanics-ink-strong) !important
}
.reader-tone-slider::-webkit-slider-runnable-track{background:var(--reader-line-strong) !important}
.reader-tone-slider::-moz-range-track{background:var(--reader-line-strong) !important}
.reader-tone-slider::-webkit-slider-thumb{
  border-color:var(--reader-line-strong) !important;
  background:var(--reader-paper) !important
}
.reader-tone-slider::-moz-range-thumb{
  border-color:var(--reader-line-strong) !important;
  background:var(--reader-paper) !important
}
.reader-tone-warm-mark{background:var(--reader-line-strong) !important}

/* Archive sheet / empty state */
.archive-stage{
  background-color:var(--reader-bg) !important
}
.archive-sheet,
.sheet-visual,
.sheet-file-card,
.sheet-text-view,
.sheet-pdf-frame{
  background-color:var(--reader-paper) !important;
  color:var(--mechanics-ink-strong) !important
}
.archive-sheet{border-color:var(--reader-line-strong) !important}
.empty-drawing,
.sheet-loading,
.sheet-file-extension{
  color:var(--mechanics-ink-soft) !important
}
.empty-symbol{border-color:var(--reader-line) !important}
.sheet-register{
  border-color:var(--mechanics-ink-strong) !important
}
.sheet-title{color:var(--mechanics-ink-strong) !important}
.sheet-open-source,
.sheet-route{
  color:var(--mechanics-ink) !important;
  border-bottom-color:var(--reader-line-strong) !important
}
.sheet-open-source:hover{color:var(--mechanics-ink-strong) !important}
.sheet-asset-host>img,
.mechanics-zoom-overlay img{
  filter:none !important
}

/* Permanent directory strip + physical file rack. */
.file-extraction-tray{
  border-top-color:var(--reader-line-strong) !important;
  background:linear-gradient(
    to bottom,
    var(--reader-bg) 0%,
    var(--mechanics-tray-mid) 34%,
    var(--reader-bg) 100%
  ) !important
}
.file-tray-directory{
  background:var(--mechanics-directory) !important;
  color:var(--mechanics-ink) !important;
  border-bottom-color:var(--reader-line) !important
}
.file-tray-directory::before{color:var(--mechanics-ink-faint) !important}
.file-tray-item::before{background:var(--reader-line-strong) !important}
.file-tray-item::after{
  background:color-mix(in srgb,var(--mechanics-file-idle) 72%,transparent) !important
}
.file-tray-item.is-active::after,
.file-tray-rack.is-single-file .file-tray-item::after{
  background:var(--mechanics-file-active) !important
}
.file-tray-index{color:var(--mechanics-ink-faint) !important}
.file-tray-name{color:var(--mechanics-ink) !important}
.file-tray-item.is-active .file-tray-name,
.file-tray-rack.is-single-file .file-tray-name{
  color:var(--mechanics-ink-strong) !important
}
.file-tray-nav{
  color:var(--mechanics-ink) !important
}
.file-tray-nav svg path{
  stroke:currentColor !important
}
.file-tray-nav:hover{color:var(--mechanics-ink-strong) !important}

/* Keep placeholder cards, zoom viewer and focused states theme-aware. */
.sheet-file-card{
  border-color:var(--reader-line) !important
}
.sheet-file-card p,
.sheet-note,
.sheet-source{color:var(--mechanics-ink-soft) !important}
.archive-sheet.is-back:hover{background:var(--reader-active) !important}
.selection-node:focus-within,
.taxonomy-row:focus-visible,
.file-tray-item:focus-visible{
  outline-color:var(--mechanics-ink-strong) !important
}

/* Browsers without color-mix keep the original reader variables readable. */
@supports not (color:color-mix(in srgb,white,black)){
  :root{
    --mechanics-ink:var(--reader-muted);
    --mechanics-ink-soft:var(--reader-muted);
    --mechanics-ink-faint:var(--reader-faint);
    --mechanics-tree-line:var(--reader-line);
    --mechanics-tree-line-strong:var(--reader-line-strong);
    --mechanics-card:var(--reader-paper);
    --mechanics-card-hover:var(--reader-hover);
    --mechanics-card-active:var(--reader-active);
    --mechanics-strip:var(--reader-panel);
    --mechanics-file-idle:var(--reader-panel);
    --mechanics-file-active:var(--reader-paper);
    --mechanics-directory:var(--reader-panel);
    --mechanics-tray-mid:var(--reader-bg)
  }
}
'''
    css.write_text(s, encoding='utf-8')

html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
h = h.replace('mechanics.css?v=112', 'mechanics.css?v=113', 1)
html.write_text(h, encoding='utf-8')
