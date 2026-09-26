from pathlib import Path

html_path = Path('mechanics.html')
js_path = Path('mechanics.js')
css_path = Path('mechanics.css')

html = html_path.read_text(encoding='utf-8')
js = js_path.read_text(encoding='utf-8')
css = css_path.read_text(encoding='utf-8')

html = html.replace('mechanics.css?v=96', 'mechanics.css?v=97')
html = html.replace('mechanics-data.js?v=96', 'mechanics-data.js?v=97')
html = html.replace('mechanics.js?v=96', 'mechanics.js?v=97')

old_head = '''        <div class="project-index-subtitle" data-i18n="browseByWork">按作品检索</div>\n      </div>'''
new_head = '''        <div class="project-index-subtitle" data-i18n="browseByWork">按作品检索</div>\n        <p class="project-index-description" data-i18n="databaseIntro">以作品为入口检索技术档案。数据库将墟构实践中散落的技术信息、经验、想法、技法与功法拆解为一个个可追溯的“技术点”，持续归档与连接。</p>\n      </div>'''
if old_head not in html:
    raise SystemExit('project index head anchor not found')
html = html.replace(old_head, new_head, 1)

old_spine = '''      function syncSpineMetrics() {\n        const ir = engineeringIndex.getBoundingClientRect();\n        const sr = titleSquare.getBoundingClientRect();\n        engineeringIndex.style.setProperty('--engineering-spine-x', `${(sr.left + sr.width / 2 - ir.left).toFixed(2)}px`);\n        engineeringIndex.style.setProperty('--engineering-spine-start', `${Math.max(0, sr.bottom - ir.top).toFixed(2)}px`);\n      }'''
new_spine = '''      function syncSpineMetrics() {\n        const ir = engineeringIndex.getBoundingClientRect();\n        const sr = titleSquare.getBoundingClientRect();\n        engineeringIndex.style.setProperty('--engineering-spine-x', `${(sr.left + sr.width / 2 - ir.left).toFixed(2)}px`);\n        engineeringIndex.style.setProperty('--engineering-spine-start', `${Math.max(0, sr.bottom - ir.top).toFixed(2)}px`);\n        const lastRootRow = taxonomyRoot.lastElementChild?.querySelector(':scope > .taxonomy-row');\n        const rr = lastRootRow?.getBoundingClientRect();\n        if (rr) {\n          engineeringIndex.style.setProperty('--engineering-spine-end', `${Math.max(sr.bottom - ir.top, rr.top + rr.height / 2 - ir.top).toFixed(2)}px`);\n        }\n      }'''
if old_spine not in html:
    raise SystemExit('syncSpineMetrics anchor not found')
html = html.replace(old_spine, new_spine, 1)

old_ui = "    browseByWork:{zh:'按作品检索',en:'Browse by work',ja:'作品から検索'},"
new_ui = """    browseByWork:{zh:'按作品检索',en:'Browse by work',ja:'作品から検索'},\n    databaseIntro:{zh:'以作品为入口检索技术档案。数据库将墟构实践中散落的技术信息、经验、想法、技法与功法拆解为一个个可追溯的“技术点”，持续归档与连接。',en:'Use each work as an entry point into the technical archive. The database gathers ruinwright knowledge, experience, ideas, techniques and working methods as traceable technical points.',ja:'作品を入口に技術記録を検索します。データベースは、墟構に関する技術情報・経験・発想・技法・工法を、追跡可能な「技術点」として蓄積し結びます。'},"""
if old_ui not in js:
    raise SystemExit('UI browseByWork anchor not found')
js = js.replace(old_ui, new_ui, 1)

old_sig = '  function selectionNode(node, depth, route) {'
new_sig = '  function selectionNode(node, depth, route, categoryLabel = \'\') {'
if old_sig not in js:
    raise SystemExit('selectionNode signature not found')
js = js.replace(old_sig, new_sig, 1)

old_wrap = """    wrap.dataset.selectionNode = node.id;\n    wrap.style.setProperty('--tree-depth', depth);\n\n    if (route.has(node.id)) wrap.classList.add('is-selected-route');"""
new_wrap = """    wrap.dataset.selectionNode = node.id;\n    wrap.style.setProperty('--tree-depth', depth);\n    if (categoryLabel) {\n      wrap.dataset.categoryLabel = categoryLabel;\n      wrap.classList.add('has-category-label','is-static-branch');\n    }\n\n    if (route.has(node.id)) wrap.classList.add('is-selected-route');"""
if old_wrap not in js:
    raise SystemExit('selectionNode wrap anchor not found')
js = js.replace(old_wrap, new_wrap, 1)

old_branch = """    } else {\n      button.className = 'selection-branch-label';\n      button.textContent = local(node.label);\n      button.setAttribute('aria-expanded', 'true');\n      button.addEventListener('click', () => {\n        const collapsed = wrap.classList.toggle('is-collapsed');\n        button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');\n        scheduleConnector();\n      });\n    }"""
new_branch = """    } else {\n      button.className = 'selection-branch-label';\n      button.textContent = local(node.label);\n      button.setAttribute('aria-expanded', 'true');\n      if (categoryLabel) {\n        button.classList.add('is-static');\n        button.tabIndex = -1;\n        button.setAttribute('aria-disabled','true');\n      } else {\n        button.addEventListener('click', () => {\n          const collapsed = wrap.classList.toggle('is-collapsed');\n          button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');\n          scheduleConnector();\n        });\n      }\n    }"""
if old_branch not in js:
    raise SystemExit('selection branch block not found')
js = js.replace(old_branch, new_branch, 1)

old_section = """      const section = document.createElement('section');\n      section.className = `selection-group ${group.treeLabel ? 'selection-group-tree-label' : ''}`;\n\n      if (group.treeLabel) {"""
new_section = """      const section = document.createElement('section');\n      section.className = `selection-group ${group.treeLabel ? 'selection-group-tree-label' : ''}`;\n      const categoryLabel = group.treeLabel\n        ? local({zh:'草图项目',en:'Sketch project',ja:'スケッチプロジェクト'})\n        : local({zh:'废墟园林作品',en:'Folly work',ja:'フォリー作品'});\n\n      if (group.treeLabel) {"""
if old_section not in js:
    raise SystemExit('selection section anchor not found')
js = js.replace(old_section, new_section, 1)

old_call = "nodes.appendChild(selectionNode(node, group.treeLabel ? 1 : 0, route));"
new_call = "nodes.appendChild(selectionNode(node, group.treeLabel ? 1 : 0, route, categoryLabel));"
if old_call not in js:
    raise SystemExit('selectionNode render call not found')
js = js.replace(old_call, new_call, 1)

old_archive_scroll = '''    requestAnimationFrame(() => {\n      taxonomyRoot\n        .querySelector(`[data-taxonomy-id="${CSS.escape(selection.taxonomy)}"]`)\n        ?.scrollIntoView?.({block:'nearest'});\n      scheduleConnector();\n      setTimeout(scheduleConnector, 220);\n    });'''
new_archive_scroll = '''    requestAnimationFrame(() => {\n      engineeringIndex.scrollTop = 0;\n      scheduleConnector();\n      setTimeout(scheduleConnector, 220);\n    });'''
if old_archive_scroll not in js:
    raise SystemExit('archive taxonomy scroll block not found')
js = js.replace(old_archive_scroll, new_archive_scroll, 1)

old_tax_scroll = '''    requestAnimationFrame(() => {\n      taxonomyRoot\n        .querySelector(`[data-taxonomy-id="${CSS.escape(node.id)}"]`)\n        ?.scrollIntoView?.({block:'nearest'});\n    });'''
new_tax_scroll = '''    requestAnimationFrame(() => {\n      engineeringIndex.scrollTop = 0;\n    });'''
if old_tax_scroll not in js:
    raise SystemExit('taxonomy browse scroll block not found')
js = js.replace(old_tax_scroll, new_tax_scroll, 1)

marker = '/* v97 · technical-point index / bounded spine / file foreground */'
if marker not in css:
    css += r'''

/* v97 · technical-point index / bounded spine / file foreground */
.project-index .project-index-description{
  margin:11px 0 0 !important;
  max-width:310px;
  color:var(--reader-muted);
  font-size:10px;
  line-height:1.52;
  letter-spacing:.018em;
  opacity:.72
}
.project-index .selection-group-heading{display:none !important}
.project-index .selection-group-nodes > .selection-node.has-category-label{
  padding-top:29px !important
}
.project-index .selection-group-nodes > .selection-node.has-category-label::before{
  content:attr(data-category-label);
  position:absolute;
  left:0;
  right:0;
  top:0;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 9px;
  border-bottom:1px solid var(--reader-line);
  background:rgba(255,255,251,.30);
  color:var(--reader-muted);
  font-size:9px;
  line-height:1;
  letter-spacing:.065em;
  opacity:.76;
  pointer-events:none
}
.project-index .selection-node.is-static-branch > .selection-row > .selection-branch-label.is-static{
  cursor:default !important;
  pointer-events:none !important;
  text-decoration:none !important
}
.project-index .selection-node.is-static-branch.is-selected-route > .selection-row > .selection-branch-label.is-static{
  text-decoration:none !important
}

body .engineering-index{
  background-image:none !important;
  --engineering-spine-end:calc(100% - 22px)
}
body .engineering-index::before{
  content:"";
  position:absolute;
  z-index:1;
  left:var(--engineering-spine-x);
  top:var(--engineering-spine-start);
  width:1px;
  height:calc(var(--engineering-spine-end) - var(--engineering-spine-start));
  background:var(--tree-line);
  pointer-events:none
}
body .engineering-index .engineering-title{
  position:relative !important;
  top:auto !important;
  z-index:4 !important;
  margin-bottom:17px !important;
  background:var(--reader-paper) !important
}
body .engineering-index .engineering-taxonomy{
  position:relative !important;
  z-index:2 !important;
  margin-top:0 !important
}

body.has-file-extraction-tray .file-tray-directory{
  z-index:5 !important
}
body.has-file-extraction-tray .file-tray-rack{
  z-index:8 !important
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active{
  --base-y:-76px !important;
  --rack-z:90 !important;
  z-index:90 !important
}
@media(max-width:800px){
  body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active{
    --base-y:-50px !important
  }
}
'''

html_path.write_text(html, encoding='utf-8')
js_path.write_text(js, encoding='utf-8')
css_path.write_text(css, encoding='utf-8')
