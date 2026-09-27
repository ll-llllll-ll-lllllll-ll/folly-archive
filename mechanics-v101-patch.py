from pathlib import Path

# 1) Restore [+]/[-] leaf-state markers and tighten the directory tree a touch more.
css = Path('mechanics.css')
text = css.read_text(encoding='utf-8')
marker = '/* v101 · bracket leaf state / precise underlined connector */'
if marker not in text:
    text += r'''


/* v101 · bracket leaf state / precise underlined connector */
/* Keep the archive-drawer grammar literal: project and technical-point states
   both use square brackets. The child rows stay compact, with no diamond glyphs. */
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash{
  width:25px !important;
  flex:0 0 25px !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash::before{
  content:"[+]" !important;
  color:var(--mechanics-inactive-ink) !important;
  font:300 10.5px/1 "IBM Plex Mono",monospace !important;
  transform:none !important;
  letter-spacing:0 !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node.is-selected > .selection-row > .tree-dash::before{
  content:"[-]" !important;
  color:var(--reader-text) !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
  padding-left:37px !important;
  gap:2px !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{
  top:5px !important
}

/* The chosen technical-point name is the actual launch point of the cross-index.
   Keep its own CSS underline off: the SVG connector now becomes that underline. */
.project-index .selection-node.is-selected > .selection-row > .selection-select{
  text-decoration:none !important
}
.directory-connector path{
  stroke-linecap:square;
  stroke-linejoin:miter
}

@media(max-width:800px){
  .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
    padding-left:35px !important;
    gap:2px !important
  }
  .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash{
    width:25px !important;
    flex-basis:25px !important
  }
}
'''
    css.write_text(text, encoding='utf-8')

# 2) Make the left-to-database line originate as an underline beneath the selected
#    child name and terminate as an underline beneath the exact target taxonomy label.
html = Path('mechanics.html')
s = html.read_text(encoding='utf-8')
s = s.replace('mechanics.css?v=100', 'mechanics.css?v=101')
s = s.replace('mechanics-data.js?v=100', 'mechanics-data.js?v=101')
s = s.replace('mechanics.js?v=100', 'mechanics.js?v=101')

old = '''        const rootNode = topLevelTaxonomyNode(targetNode);\n        const rootRow = rootNode?.querySelector(':scope > .taxonomy-row');\n        if (!rootRow) return;\n\n        const a = selected.getBoundingClientRect();\n        const rootRect = rootRow.getBoundingClientRect();\n        const pr = projectIndex.getBoundingClientRect();\n        const ir = engineeringIndex.getBoundingClientRect();\n        const sr = titleSquare.getBoundingClientRect();\n        if (a.bottom < pr.top || a.top > pr.bottom || rootRect.bottom < ir.top || rootRect.top > ir.bottom) {\n          connector.classList.remove('is-visible');\n          return;\n        }\n\n        const spineX = sr.left + sr.width / 2;\n        const y1 = a.top + a.height / 2;\n        const y2 = rootRect.top + rootRect.height / 2;\n        const x1 = Math.min(spineX - 16, Math.max(a.right + 18, pr.right - 64));\n        const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} H ${spineX.toFixed(1)} V ${y2.toFixed(1)}`;'''
new = '''        const targetRow = targetNode.querySelector(':scope > .taxonomy-row');\n        const targetLabel = targetRow?.querySelector(':scope > .taxonomy-label');\n        if (!targetRow || !targetLabel) return;\n\n        const a = selected.getBoundingClientRect();\n        const b = targetLabel.getBoundingClientRect();\n        const pr = projectIndex.getBoundingClientRect();\n        const ir = engineeringIndex.getBoundingClientRect();\n        const sr = titleSquare.getBoundingClientRect();\n        if (a.bottom < pr.top || a.top > pr.bottom || b.bottom < ir.top || b.top > ir.bottom) {\n          connector.classList.remove('is-visible');\n          return;\n        }\n\n        const spineX = sr.left + sr.width / 2;\n        // The connector is deliberately drawn on the text baseline's underside:\n        // selected technical point -> engineering spine -> exact database label.\n        const y1 = a.bottom + 1.5;\n        const y2 = b.bottom + 1.5;\n        const leftUnderline = Math.max(pr.left + 8, a.left - 1);\n        const targetUnderlineEnd = Math.min(ir.right - 5, b.right + 7);\n        const d = `M ${leftUnderline.toFixed(1)} ${y1.toFixed(1)} H ${spineX.toFixed(1)} V ${y2.toFixed(1)} H ${targetUnderlineEnd.toFixed(1)}`;'''
if old not in s:
    raise SystemExit('connector block not found')
s = s.replace(old, new, 1)
html.write_text(s, encoding='utf-8')
