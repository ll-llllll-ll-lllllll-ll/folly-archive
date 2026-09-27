from pathlib import Path

# --- mechanics.css ---------------------------------------------------------
p = Path('mechanics.css')
s = p.read_text(encoding='utf-8')
marker = '/* v102 · precise route emphasis / spine-only launch connector */'
if marker not in s:
    s += r'''


/* v102 · precise route emphasis / spine-only launch connector */
/* The left work-index connector now stops at the engineering spine. The central
   taxonomy itself carries the rest of the route with a precise, heavier overlay. */
.project-index .selection-node.is-selected > .selection-row > .selection-select,
.project-index .selection-node.is-project-card.is-card-selected > .selection-row > .selection-project-select{
  font-weight:500 !important;
  color:var(--reader-text) !important
}
.engineering-index .taxonomy-node.is-route > .taxonomy-row > .taxonomy-label,
.engineering-index .taxonomy-node.is-target > .taxonomy-row > .taxonomy-label{
  font-weight:500 !important;
  color:var(--reader-text) !important;
  opacity:1 !important
}

/* Do not darken a whole descendant rail just because one leaf is active. The
   regular tree stays thin; #taxonomy-route-path paints only the travelled part. */
.engineering-index .taxonomy-node.is-route > .taxonomy-children{
  border-left-color:var(--tree-line) !important
}
.engineering-index .engineering-taxonomy > .taxonomy-node.is-route > .taxonomy-row::before,
.engineering-index .engineering-taxonomy > .taxonomy-node.is-target > .taxonomy-row::before{
  border-top-color:var(--tree-line) !important
}

#directory-connector-path{
  fill:none;
  stroke:var(--reader-text);
  stroke-width:1.05px;
  stroke-linecap:square;
  stroke-linejoin:miter;
  vector-effect:non-scaling-stroke
}
#taxonomy-route-path{
  fill:none;
  stroke:var(--reader-text);
  stroke-width:1.65px;
  stroke-linecap:square;
  stroke-linejoin:miter;
  vector-effect:non-scaling-stroke;
  pointer-events:none
}

@media(max-width:800px){
  #taxonomy-route-path{stroke-width:1.45px}
}
'''
    p.write_text(s, encoding='utf-8')

# --- mechanics.html --------------------------------------------------------
p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
s = s.replace('mechanics.css?v=101', 'mechanics.css?v=102')
s = s.replace('mechanics-data.js?v=101', 'mechanics-data.js?v=102')
s = s.replace('mechanics.js?v=101', 'mechanics.js?v=102')

s = s.replace(
'''    <svg id="directory-connector" class="directory-connector" aria-hidden="true">\n      <path id="directory-connector-path"></path>\n    </svg>''',
'''    <svg id="directory-connector" class="directory-connector" aria-hidden="true">\n      <path id="directory-connector-path"></path>\n      <path id="taxonomy-route-path"></path>\n    </svg>'''
)

s = s.replace(
"      const path = document.getElementById('directory-connector-path');\n",
"      const path = document.getElementById('directory-connector-path');\n      const routePath = document.getElementById('taxonomy-route-path');\n"
)
s = s.replace(
"      if (!engineeringIndex || !titleSquare || !selectionTree || !taxonomyRoot || !connector || !path || !projectIndex || !stage || !stack || !tray || !rack) return;",
"      if (!engineeringIndex || !titleSquare || !selectionTree || !taxonomyRoot || !connector || !path || !routePath || !projectIndex || !stage || !stack || !tray || !rack) return;"
)

old_clear = '''          if (path.getAttribute('d')) {\n            writingConnector = true;\n            path.setAttribute('d','');\n            writingConnector = false;\n          }\n          return;'''
new_clear = '''          if (path.getAttribute('d') || routePath.getAttribute('d')) {\n            writingConnector = true;\n            path.setAttribute('d','');\n            routePath.setAttribute('d','');\n            writingConnector = false;\n          }\n          return;'''
if old_clear not in s:
    raise SystemExit('connector clear block not found')
s = s.replace(old_clear, new_clear, 1)

old_geometry = '''        const spineX = sr.left + sr.width / 2;\n        // The connector is deliberately drawn on the text baseline's underside:\n        // selected technical point -> engineering spine -> exact database label.\n        const y1 = a.bottom + 1.5;\n        const y2 = b.bottom + 1.5;\n        const leftUnderline = Math.max(pr.left + 8, a.left - 1);\n        const targetUnderlineEnd = Math.min(ir.right - 5, b.right + 7);\n        const d = `M ${leftUnderline.toFixed(1)} ${y1.toFixed(1)} H ${spineX.toFixed(1)} V ${y2.toFixed(1)} H ${targetUnderlineEnd.toFixed(1)}`;\n        connector.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);\n        connector.classList.add('is-visible');\n        if (path.getAttribute('d') !== d) {\n          writingConnector = true;\n          path.setAttribute('d', d);\n          writingConnector = false;\n        }'''
new_geometry = '''        const spineX = sr.left + sr.width / 2;\n        // The work-index launch line behaves like an underline and stops exactly\n        // at the database spine (the purple reference line in the design sketch).\n        const y1 = a.bottom + 1.5;\n        const leftUnderline = Math.max(pr.left + 8, a.left - 1);\n        const d = `M ${leftUnderline.toFixed(1)} ${y1.toFixed(1)} H ${spineX.toFixed(1)}`;\n\n        // Build a second, heavier path only along the actual taxonomy route. This\n        // avoids the old behaviour where an entire child rail became dark even\n        // below the selected technical point.\n        const routeNodes = [];\n        let cursor = targetNode;\n        while (cursor?.classList.contains('taxonomy-node')) {\n          routeNodes.unshift(cursor);\n          const parentChildren = cursor.parentElement;\n          if (!parentChildren?.classList.contains('taxonomy-children')) break;\n          cursor = parentChildren.parentElement?.closest('.taxonomy-node');\n        }\n\n        const routeSegments = [];\n        if (routeNodes.length) {\n          const rootRow = routeNodes[0].querySelector(':scope > .taxonomy-row');\n          const rootRect = rootRow?.getBoundingClientRect();\n          if (rootRect) {\n            const rootY = rootRect.top + rootRect.height / 2;\n            routeSegments.push(`M ${spineX.toFixed(1)} ${y1.toFixed(1)} V ${rootY.toFixed(1)} H ${rootRect.left.toFixed(1)}`);\n          }\n\n          for (let i = 1; i < routeNodes.length; i += 1) {\n            const parentRow = routeNodes[i - 1].querySelector(':scope > .taxonomy-row');\n            const childRow = routeNodes[i].querySelector(':scope > .taxonomy-row');\n            const rail = routeNodes[i].parentElement;\n            const parentRect = parentRow?.getBoundingClientRect();\n            const childRect = childRow?.getBoundingClientRect();\n            const railRect = rail?.getBoundingClientRect();\n            if (!parentRect || !childRect || !railRect) continue;\n            const parentY = parentRect.top + parentRect.height / 2;\n            const childY = childRect.top + childRect.height / 2;\n            const railX = railRect.left;\n            routeSegments.push(`M ${railX.toFixed(1)} ${parentY.toFixed(1)} V ${childY.toFixed(1)} H ${childRect.left.toFixed(1)}`);\n          }\n        }\n\n        const routeD = routeSegments.join(' ');\n        connector.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);\n        connector.classList.add('is-visible');\n        if (path.getAttribute('d') !== d || routePath.getAttribute('d') !== routeD) {\n          writingConnector = true;\n          path.setAttribute('d', d);\n          routePath.setAttribute('d', routeD);\n          writingConnector = false;\n        }'''
if old_geometry not in s:
    raise SystemExit('v101 connector geometry block not found')
s = s.replace(old_geometry, new_geometry, 1)

p.write_text(s, encoding='utf-8')
