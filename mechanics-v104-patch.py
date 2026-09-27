from pathlib import Path

# v104: clear connector paths when a work label is dismissed, and tighten the intro copy.

js = Path('mechanics.js')
s = js.read_text(encoding='utf-8')

old_intro = "    databaseIntro:{zh:'这里不是作品目录，而是“技术点”的检索入口。以作品为线索，追踪其中使用、生成或修正的技术、经验、想法、技法与工法；这些实践再归入中央的「墟构工程总数据库」，持续归档并互相连接。',en:'This is not a catalogue of works, but an index into technical points. Each work traces techniques, experience, ideas and working methods used, produced or revised through practice; those points return to the central engineering database and remain connected.',ja:'ここは作品目録ではなく「技術点」への検索入口です。作品を手掛かりに、実践で用いられ、生まれ、修正された技術・経験・発想・技法・工法を追跡し、それらを中央の墟構工程データベースへ戻して継続的に記録・接続します。'},"
new_intro = "    databaseIntro:{zh:'以作品为线索检索技术点，追踪使用、生成或修正的技术、经验、想法、技法与工法。记录汇入中央「墟构工程总数据库」，持续归档并互相连接。',en:'Use each work as a route into its technical points: techniques, experience, ideas and working methods used, generated or revised in practice. Records feed into the central Ruinwright Engineering Database and remain connected.',ja:'作品を手掛かりに技術点を検索し、実践で用いられ、生まれ、修正された技術・経験・発想・技法・工法を追跡します。記録は中央の墟構工程データベースへ集約され、継続的に整理・接続されます。'},"
if old_intro not in s:
    raise SystemExit('mechanics.js: databaseIntro source text not found')
s = s.replace(old_intro, new_intro, 1)

old_collapse = """  function collapseProjectTree() {\n    if (!activeProjectId) return;\n    activeProjectId = null;\n    renderSelection();\n    renderTaxonomy();\n    renderStack();\n    scheduleConnector();\n  }\n"""
new_collapse = """  function collapseProjectTree() {\n    if (!activeProjectId) return;\n\n    // Leaving a work card is a full dismissal: drop the selected technical point\n    // before the collapsed DOM can report a stray zero/edge rect to the connector.\n    activeProjectId = null;\n    if (activeSelection && !activeSelection.isTaxonomyBrowse) {\n      activeSelection = null;\n      activeRecordIndex = 0;\n    }\n\n    cancelAnimationFrame(connectorRaf);\n    connectorRaf = 0;\n    connector.classList.remove('is-visible');\n    connectorPath.setAttribute('d','');\n    document.getElementById('taxonomy-route-path')?.setAttribute('d','');\n\n    renderSelection();\n    renderTaxonomy();\n    renderStack();\n    history.replaceState(null, '', location.pathname + location.search);\n\n    // The later v95 overlay also redraws these paths. Clear once more after the\n    // selection/taxonomy DOM settles so no stale route can wrap to the viewport edge.\n    requestAnimationFrame(() => {\n      connector.classList.remove('is-visible');\n      connectorPath.setAttribute('d','');\n      document.getElementById('taxonomy-route-path')?.setAttribute('d','');\n    });\n  }\n"""
if old_collapse not in s:
    raise SystemExit('mechanics.js: collapseProjectTree block not found')
s = s.replace(old_collapse, new_collapse, 1)
js.write_text(s, encoding='utf-8')

html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
old_p = '<p class="project-index-description" data-i18n="databaseIntro">这里不是作品目录，而是“技术点”的检索入口。以作品为线索，追踪其中使用、生成或修正的技术、经验、想法、技法与工法；这些实践再归入中央的「墟构工程总数据库」，持续归档并互相连接。</p>'
new_p = '<p class="project-index-description" data-i18n="databaseIntro">以作品为线索检索技术点，追踪使用、生成或修正的技术、经验、想法、技法与工法。记录汇入中央「墟构工程总数据库」，持续归档并互相连接。</p>'
if old_p not in h:
    raise SystemExit('mechanics.html: intro paragraph not found')
h = h.replace(old_p, new_p, 1)
h = h.replace('mechanics.js?v=102', 'mechanics.js?v=104', 1)
html.write_text(h, encoding='utf-8')
