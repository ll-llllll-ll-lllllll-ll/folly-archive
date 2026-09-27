from pathlib import Path

ROOT = Path('.')

# mechanics.html ------------------------------------------------------------
p = ROOT / 'mechanics.html'
s = p.read_text(encoding='utf-8')
s = s.replace('mechanics.css?v=107', 'mechanics.css?v=108')
s = s.replace('mechanics-data.js?v=107', 'mechanics-data.js?v=108')
s = s.replace('mechanics.js?v=107', 'mechanics.js?v=108')

old_tray = '''      <div id="file-extraction-tray" class="file-extraction-tray" aria-label="archive file rack" aria-hidden="true">\n        <div id="file-tray-directory" class="file-tray-directory" aria-live="polite"></div>\n        <div id="file-tray-rack" class="file-tray-rack"></div>\n      </div>'''
new_tray = '''      <div id="file-extraction-tray" class="file-extraction-tray" aria-label="archive file rack" aria-hidden="true">\n        <div id="file-tray-directory" class="file-tray-directory" aria-live="polite"></div>\n        <button id="file-tray-prev" class="file-tray-nav file-tray-prev" type="button" aria-label="previous file" hidden>\n          <svg viewBox="0 0 40 60" aria-hidden="true"><path d="M32 6 L8 30 L32 54 Z" /></svg>\n        </button>\n        <div id="file-tray-rack" class="file-tray-rack"></div>\n        <button id="file-tray-next" class="file-tray-nav file-tray-next" type="button" aria-label="next file" hidden>\n          <svg viewBox="0 0 40 60" aria-hidden="true"><path d="M8 6 L32 30 L8 54 Z" /></svg>\n        </button>\n      </div>'''
if old_tray not in s:
    raise SystemExit('tray markup marker not found')
s = s.replace(old_tray, new_tray, 1)

old_refs = '''      const directory = document.getElementById('file-tray-directory');\n      if (!stack || !stage || !tray || !rack || !directory) return;'''
new_refs = '''      const directory = document.getElementById('file-tray-directory');\n      const prevButton = document.getElementById('file-tray-prev');\n      const nextButton = document.getElementById('file-tray-next');\n      if (!stack || !stage || !tray || !rack || !directory || !prevButton || !nextButton) return;'''
if old_refs not in s:
    raise SystemExit('v96 refs marker not found')
s = s.replace(old_refs, new_refs, 1)

old_activate = '''      function activatePath(path) {\n        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];\n        const target = sheets.find(sheet => sheet.querySelector('.sheet-source')?.textContent?.trim() === path);\n        if (!target || target.classList.contains('is-front')) return;\n        target.click();\n      }\n\n      function buildRack(records) {'''
new_activate = '''      function activatePath(path) {\n        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];\n        const target = sheets.find(sheet => sheet.querySelector('.sheet-source')?.textContent?.trim() === path);\n        if (!target || target.classList.contains('is-front')) return;\n        target.click();\n      }\n\n      function stepRack(delta) {\n        const records = sheetData();\n        if (records.length < 2) return;\n        const found = records.findIndex(record => record.active);\n        const activeIndex = found >= 0 ? found : 0;\n        const nextIndex = (activeIndex + delta + records.length) % records.length;\n        activatePath(records[nextIndex].source);\n      }\n\n      prevButton.addEventListener('click', event => {\n        event.preventDefault();\n        event.stopPropagation();\n        stepRack(-1);\n      });\n      nextButton.addEventListener('click', event => {\n        event.preventDefault();\n        event.stopPropagation();\n        stepRack(1);\n      });\n\n      function buildRack(records) {'''
if old_activate not in s:
    raise SystemExit('activatePath marker not found')
s = s.replace(old_activate, new_activate, 1)

old_sync = '''          const records = sheetData();\n          const hasDirectorySelection = Boolean('''
new_sync = '''          const records = sheetData();\n          const multipleFiles = records.length > 1;\n          prevButton.hidden = !multipleFiles;\n          nextButton.hidden = !multipleFiles;\n          const hasDirectorySelection = Boolean('''
if old_sync not in s:
    raise SystemExit('sync records marker not found')
s = s.replace(old_sync, new_sync, 1)
p.write_text(s, encoding='utf-8')

# mechanics.js --------------------------------------------------------------
p = ROOT / 'mechanics.js'
s = p.read_text(encoding='utf-8')
old_footer = '    const footerHeight = compact ? 132 : 154;'
if old_footer not in s:
    raise SystemExit('adaptive footer height marker not found')
s = s.replace(old_footer, '    const footerHeight = compact ? 76 : 84;', 1)
p.write_text(s, encoding='utf-8')

# mechanics.css -------------------------------------------------------------
p = ROOT / 'mechanics.css'
s = p.read_text(encoding='utf-8')
marker = '/* v108 · file rack navigation / full-image viewer / compact footer */'
if marker not in s:
    s += '''\n\n\n/* v108 · file rack navigation / full-image viewer / compact footer */\n@media(min-width:801px){\n  html body .mechanics-shell > .project-index{\n    padding-top:92px !important\n  }\n}\n.project-index-description{\n  max-width:350px !important;\n  font-size:11.5px !important;\n  line-height:1.56 !important;\n  letter-spacing:.012em !important\n}\n\n/* Give the paper icon a visibly steeper lower edge while keeping the tab top. */\nbody.has-file-extraction-tray .file-tray-rack .file-tray-item::before,\nbody.has-file-extraction-tray .file-tray-rack .file-tray-item::after{\n  clip-path:polygon(0 100%,0 35%,28% 0,100% 0,100% 86%) !important\n}\n\n/* The pulled file always carries its actual filename on the face of the sheet. */\nbody.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active .file-tray-name{\n  display:block !important;\n  left:50% !important;\n  top:56% !important;\n  right:auto !important;\n  bottom:auto !important;\n  width:78% !important;\n  max-width:78% !important;\n  transform:translate(-50%,-50%) !important;\n  color:var(--reader-text) !important;\n  opacity:1 !important;\n  font-size:9px !important;\n  line-height:1.16 !important;\n  font-weight:400 !important;\n  text-align:center !important;\n  white-space:normal !important;\n  overflow-wrap:anywhere !important;\n  text-overflow:clip !important;\n  z-index:1005 !important\n}\n\n/* Previous / next controls for playing through the current directory. */\n.file-tray-nav{\n  appearance:none;\n  position:absolute;\n  z-index:1200;\n  top:27px;\n  bottom:0;\n  width:74px;\n  display:grid;\n  place-items:center;\n  border:0;\n  background:transparent;\n  padding:0;\n  color:var(--reader-text);\n  opacity:.86;\n  transition:opacity 140ms ease,transform 140ms ease\n}\n.file-tray-nav:hover{opacity:1}\n.file-tray-nav:active{transform:translateY(1px)}\n.file-tray-nav[hidden]{display:none !important}\n.file-tray-prev{left:18px}\n.file-tray-next{right:18px}\n.file-tray-nav svg{\n  width:42px;\n  height:58px;\n  overflow:visible\n}\n.file-tray-nav path{\n  fill:none;\n  stroke:currentColor;\n  stroke-width:1.45;\n  stroke-linejoin:miter;\n  vector-effect:non-scaling-stroke\n}\nbody.has-file-extraction-tray .file-tray-rack{\n  padding-left:96px !important;\n  padding-right:96px !important\n}\n\n/* Show the complete asset. No crop, no forced monochrome treatment. */\n.sheet-asset-host > img{\n  width:100% !important;\n  height:100% !important;\n  max-width:100% !important;\n  max-height:100% !important;\n  object-fit:contain !important;\n  object-position:center !important;\n  filter:none !important\n}\n.mechanics-zoom-content > img{\n  object-fit:contain !important;\n  filter:none !important\n}\n\n/* The record footer is reduced to title + enlarge control only. The source node\n   stays in the DOM (hidden) because the physical rack reads its real path. */\n.sheet-footer{\n  min-height:84px !important;\n  grid-template-columns:minmax(0,1fr) auto !important;\n  gap:18px !important;\n  align-items:center !important;\n  padding:13px 16px 14px !important\n}\n.sheet-note,\n.sheet-source,\n.sheet-route{\n  display:none !important\n}\n.sheet-footer-side{\n  width:auto !important;\n  min-width:auto !important;\n  height:auto !important;\n  flex-direction:row !important;\n  align-items:center !important;\n  justify-content:flex-end !important;\n  gap:0 !important\n}\n.sheet-open-source{\n  font-size:9px !important\n}\n\n@media(max-width:800px){\n  html body .mechanics-shell > .project-index{padding-top:46px !important}\n  .project-index-description{font-size:10.5px !important;line-height:1.5 !important}\n  .file-tray-nav{width:48px}\n  .file-tray-prev{left:2px}\n  .file-tray-next{right:2px}\n  .file-tray-nav svg{width:30px;height:42px}\n  body.has-file-extraction-tray .file-tray-rack{\n    padding-left:54px !important;\n    padding-right:54px !important\n  }\n  .sheet-footer{\n    min-height:76px !important;\n    padding:11px 12px 12px !important\n  }\n  .sheet-title{font-size:16px !important}\n}\n'''
p.write_text(s, encoding='utf-8')
