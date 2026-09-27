from pathlib import Path

css = Path('mechanics.css')
s = css.read_text(encoding='utf-8')
marker = '/* v114 · night-safe expanded project cards */'
if marker not in s:
    s += r'''


/* v114 · night-safe expanded project cards
   v98 used a higher-specificity fixed pale rgba background on project cards.
   In night mode that rule could beat the later adaptive v113 palette whenever
   a work was expanded. Match that specificity and keep the whole register on
   the live reader palette, including hover and selected-route states. */
.project-index .selection-group-nodes > .selection-node.is-project-card{
  background:var(--mechanics-card) !important
}
.project-index .selection-group-nodes > .selection-node.is-project-card:hover{
  background:var(--mechanics-card-hover) !important
}
.project-index .selection-group-nodes > .selection-node.is-project-card.is-card-selected,
.project-index .selection-group-nodes > .selection-node.is-project-card.is-selected-route{
  border-color:var(--reader-line-strong) !important;
  background:var(--mechanics-card-active) !important
}
.project-index .selection-group-nodes > .selection-node.is-project-card.is-card-selected > .selection-children,
.project-index .selection-group-nodes > .selection-node.is-project-card.is-selected-route > .selection-children{
  background:transparent !important
}
'''
    css.write_text(s, encoding='utf-8')

html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
h = h.replace('mechanics.css?v=113', 'mechanics.css?v=114', 1)
html.write_text(h, encoding='utf-8')
