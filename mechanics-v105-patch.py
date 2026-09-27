from pathlib import Path

# v105: protect file/database interactions from outside-dismiss, keep the file rack
# permanently present, add idle/empty-directory states, and tighten the intro.

js = Path('mechanics.js')
s = js.read_text(encoding='utf-8')

old_intro = "    databaseIntro:{zh:'以作品为线索检索技术点，追踪使用、生成或修正的技术、经验、想法、技法与工法。记录汇入中央「墟构工程总数据库」，持续归档并互相连接。',en:'Use each work as a route into its technical points: techniques, experience, ideas and working methods used, generated or revised in practice. Records feed into the central Ruinwright Engineering Database and remain connected.',ja:'作品を手掛かりに技術点を検索し、実践で用いられ、生まれ、修正された技術・経験・発想・技法・工法を追跡します。記録は中央の墟構工程データベースへ集約され、継続的に整理・接続されます。'},"
new_intro = "    databaseIntro:{zh:'以作品为线索检索技术点，追踪实践中使用、生成或修正的技术、经验、想法、技法与工法，并将记录汇入中央「墟构工程总数据库」。',en:'Use each work as a route into its technical points, tracing techniques, experience, ideas and working methods used, generated or revised in practice, with those records feeding into the central Ruinwright Engineering Database.',ja:'作品を手掛かりに技術点を検索し、実践で用いられ、生まれ、修正された技術・経験・発想・技法・工法を追跡し、その記録を中央の墟構工程データベースへ集約します。'},"
if old_intro not in s:
    raise SystemExit('mechanics.js: current databaseIntro not found')
s = s.replace(old_intro, new_intro, 1)

old_dismiss = """    document.addEventListener('pointerdown', event => {\n      if (!activeProjectId) return;\n      const activeCard = selectionTree.querySelector(\n"""
new_dismiss = """    document.addEventListener('pointerdown', event => {\n      if (!activeProjectId) return;\n\n      // The archive stage and engineering database are working surfaces, not\n      // dismissal zones. This keeps file cards, source links and taxonomy rows\n      // interactive while a work card remains expanded.\n      if (stage.contains(event.target) || engineeringIndex.contains(event.target)) return;\n\n      const activeCard = selectionTree.querySelector(\n"""
if old_dismiss not in s:
    raise SystemExit('mechanics.js: dismiss listener anchor not found')
s = s.replace(old_dismiss, new_dismiss, 1)
js.write_text(s, encoding='utf-8')

html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
old_static_intro = '<p class="project-index-description" data-i18n="databaseIntro">以作品为线索检索技术点，追踪使用、生成或修正的技术、经验、想法、技法与工法。记录汇入中央「墟构工程总数据库」，持续归档并互相连接。</p>'
new_static_intro = '<p class="project-index-description" data-i18n="databaseIntro">以作品为线索检索技术点，追踪实践中使用、生成或修正的技术、经验、想法、技法与工法，并将记录汇入中央「墟构工程总数据库」。</p>'
if old_static_intro not in h:
    raise SystemExit('mechanics.html: current static intro not found')
h = h.replace(old_static_intro, new_static_intro, 1)

if 'mechanics.js?v=104' not in h:
    raise SystemExit('mechanics.html: mechanics.js?v=104 not found')
h = h.replace('mechanics.js?v=104', 'mechanics.js?v=105', 1)

old_threshold = "      const THRESHOLD = 5;\n      let raf = 0;\n      let signature = '';"
new_threshold = """      let raf = 0;\n      let signature = '';\n\n      const rackStatus = {\n        zh:{none:'未选择目录',empty:'空文件夹'},\n        en:{none:'NO DIRECTORY SELECTED',empty:'EMPTY FOLDER'},\n        ja:{none:'ディレクトリ未選択',empty:'空のフォルダ'}\n      };\n      const rackLang = () => window.RuinLanguage?.read?.() || 'zh';\n      const rackStatusText = key => (rackStatus[rackLang()] || rackStatus.zh)[key];"""
if old_threshold not in h:
    raise SystemExit('mechanics.html: v96 threshold block not found')
h = h.replace(old_threshold, new_threshold, 1)

old_sync = """      function sync() {\n        cancelAnimationFrame(raf);\n        raf = requestAnimationFrame(() => {\n          const records = sheetData();\n          const enabled = stack.classList.contains('is-selected') && records.length > THRESHOLD;\n          document.body.classList.toggle('has-file-extraction-tray', enabled);\n          tray.setAttribute('aria-hidden', enabled ? 'false' : 'true');\n          if (!enabled) {\n            signature = '';\n            rack.replaceChildren();\n            directory.textContent = '';\n            return;\n          }\n\n          setRackGeometry(records.length);\n          const active = records.find(record => record.active) || records[records.length - 1];\n          directory.textContent = dirname(active?.source || '');\n          const nextSignature = records.map(record => record.source).join('|');\n          if (nextSignature !== signature) {\n            signature = nextSignature;\n            buildRack(records);\n            requestAnimationFrame(() => updateSelectedPush(active?.source || ''));\n          } else {\n            updateSelectedPush(active?.source || '');\n          }\n        });\n      }\n"""
new_sync = """      function sync() {\n        cancelAnimationFrame(raf);\n        raf = requestAnimationFrame(() => {\n          const records = sheetData();\n          const hasDirectorySelection = Boolean(\n            document.querySelector('#engineering-taxonomy .taxonomy-node.is-target') ||\n            document.querySelector('#selection-tree .selection-node.is-selected')\n          );\n\n          // The rack is a permanent part of the right-hand archive stage. Empty\n          // states keep the tray visible instead of collapsing the interface.\n          document.body.classList.add('has-file-extraction-tray');\n          tray.setAttribute('aria-hidden', 'false');\n\n          if (!records.length) {\n            signature = '';\n            rack.replaceChildren();\n            tray.dataset.state = hasDirectorySelection ? 'empty' : 'idle';\n            directory.textContent = hasDirectorySelection\n              ? rackStatusText('empty')\n              : rackStatusText('none');\n            return;\n          }\n\n          tray.dataset.state = 'files';\n          setRackGeometry(records.length);\n          const active = records.find(record => record.active) || records[records.length - 1];\n          directory.textContent = dirname(active?.source || '');\n          const nextSignature = records.map(record => record.source).join('|');\n          if (nextSignature !== signature) {\n            signature = nextSignature;\n            buildRack(records);\n            requestAnimationFrame(() => updateSelectedPush(active?.source || ''));\n          } else {\n            updateSelectedPush(active?.source || '');\n          }\n        });\n      }\n"""
if old_sync not in h:
    raise SystemExit('mechanics.html: v96 sync block not found')
h = h.replace(old_sync, new_sync, 1)

html.write_text(h, encoding='utf-8')
