from pathlib import Path
import re

# ---------------- mechanics.html ----------------
p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')

s = s.replace('mechanics.css?v=106', 'mechanics.css?v=107')
s = s.replace('mechanics-data.js?v=104', 'mechanics-data.js?v=107')
s = s.replace('mechanics.js?v=106', 'mechanics.js?v=107')

old_head = '''      <div class="project-index-head">\n        <div class="project-index-kicker" data-i18n="worksSegments">作品 / 档案段</div>\n        <div class="project-index-subtitle" data-i18n="browseByWork">按作品检索</div>\n        <p class="project-index-description" data-i18n="databaseIntro">以作品为线索检索技术点，追踪实践中使用、生成或修正的技术、经验、想法、技法与工法，并将记录汇入中央「墟构工程总数据库」。</p>\n      </div>'''
new_head = '''      <div class="project-index-head">\n        <p class="project-index-description" data-i18n="databaseIntro">以作品为线索检索技术点，追踪实践中使用、生成或修正的技术、经验、想法、技法与工法，并将记录汇入中央「墟构工程总数据库」。</p>\n        <span class="project-index-divider" aria-hidden="true"></span>\n        <div class="project-index-kicker" data-i18n="worksSegments">作品 / 档案段</div>\n        <div class="project-index-subtitle" data-i18n="browseByWork">按作品检索</div>\n      </div>'''
if old_head not in s:
    raise SystemExit('project index head markup not found')
s = s.replace(old_head, new_head, 1)

# Remove the historical Exploding Whale hard-coded merge. The generated asset index
# now owns this relationship and reads the real directory contents.
s = re.sub(
    r'(\s*<script src="mechanics-data\.js\?v=107"></script>)\s*<script>\s*/\* Keep Exploding Whale as one searchable branch:.*?</script>\s*(<script src="mechanics\.js\?v=107"></script>)',
    r'\1\n\n  \2',
    s,
    count=1,
    flags=re.S,
)

# Add per-file ordering metadata so labels can share the same perspective plane
# while stepping slightly instead of colliding.
old_build = '''          button.className = 'file-tray-item';\n          button.dataset.path = record.source;'''
new_build = '''          button.className = 'file-tray-item';\n          button.dataset.path = record.source;\n          button.style.setProperty('--tray-order', String(index));'''
if old_build not in s:
    raise SystemExit('rack build marker not found')
s = s.replace(old_build, new_build, 1)

# Explicitly flag the single-file state and remove neighbour-push mechanics there.
old_push = '''      function updateSelectedPush(activePath) {\n        const items = [...rack.querySelectorAll('.file-tray-item')];\n        const activeIndex = items.findIndex(item => item.dataset.path === activePath);\n        items.forEach((item,index) => {'''
new_push = '''      function updateSelectedPush(activePath) {\n        const items = [...rack.querySelectorAll('.file-tray-item')];\n        const singleFile = items.length === 1;\n        rack.classList.toggle('is-single-file', singleFile);\n        const activeIndex = items.findIndex(item => item.dataset.path === activePath);\n        items.forEach((item,index) => {'''
if old_push not in s:
    raise SystemExit('updateSelectedPush marker not found')
s = s.replace(old_push, new_push, 1)

old_active_branch = '''          if (activeIndex < 0 || active) {\n            item.style.setProperty('--selected-shift','0px');\n            return;\n          }'''
new_active_branch = '''          if (singleFile || activeIndex < 0 || active) {\n            item.style.setProperty('--selected-shift','0px');\n            return;\n          }'''
if old_active_branch not in s:
    raise SystemExit('selected push branch not found')
s = s.replace(old_active_branch, new_active_branch, 1)

# Clear the single-file flag in idle/empty states.
old_empty = '''            signature = '';\n            rack.replaceChildren();\n            tray.dataset.state = hasDirectorySelection ? 'empty' : 'idle';'''
new_empty = '''            signature = '';\n            rack.replaceChildren();\n            rack.classList.remove('is-single-file');\n            tray.dataset.state = hasDirectorySelection ? 'empty' : 'idle';'''
if old_empty not in s:
    raise SystemExit('empty rack state marker not found')
s = s.replace(old_empty, new_empty, 1)

p.write_text(s, encoding='utf-8')

# ---------------- mechanics.css ----------------
p = Path('mechanics.css')
s = p.read_text(encoding='utf-8')
marker = '/* v107 · intro register / perspective file rack */'
if marker not in s:
    s += r'''


/* v107 · intro register / perspective file rack */
@media(min-width:801px){
  /* Match the new reference: quiet air first, then intro, rule, search heading. */
  html body .mechanics-shell > .project-index{
    padding-top:132px !important
  }
}
.project-index-head{
  display:flex !important;
  flex-direction:column !important;
  margin:0 0 34px !important;
  color:var(--reader-text) !important;
  opacity:1 !important
}
.project-index-description{
  order:1;
  margin:0 !important;
  max-width:330px;
  color:rgba(23,23,23,.78) !important;
  opacity:1 !important;
  font-size:10px !important;
  line-height:1.48 !important;
  letter-spacing:.015em
}
.project-index-divider{
  order:2;
  display:block;
  width:100%;
  height:1px;
  margin:25px 0 28px;
  background:var(--reader-line-strong);
  opacity:.55
}
.project-index-kicker{
  order:3;
  color:var(--reader-text) !important;
  opacity:1 !important;
  font-size:15px !important;
  line-height:1.06 !important;
  letter-spacing:.01em !important;
  font-weight:400 !important
}
.project-index-subtitle{
  order:4;
  margin-top:2px !important;
  color:var(--reader-text) !important;
  opacity:1 !important;
  font-size:15px !important;
  line-height:1.06 !important;
  letter-spacing:.01em !important;
  font-weight:400 !important
}

/* Stronger physical perspective. Labels stay on the same plane instead of
   counter-rotating back to the screen, and form a shallow staircase by index. */
body.has-file-extraction-tray .file-tray-rack{
  perspective:760px !important;
  perspective-origin:82% 100% !important
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item{
  transform-origin:100% 100% !important;
  transform:
    translate3d(calc(var(--selected-shift) + var(--hover-spread)),calc(var(--base-y) - var(--hover-lift)),0)
    rotateY(-37deg) rotateZ(-1deg) skewY(-6deg) !important
}
body.has-file-extraction-tray .file-tray-rack .file-tray-name{
  left:7px !important;
  right:auto !important;
  bottom:calc(6px + (var(--tray-order,0) * .9px)) !important;
  width:72% !important;
  max-width:72% !important;
  color:rgba(23,23,23,.78) !important;
  opacity:1 !important;
  font-size:6.8px !important;
  line-height:1.05 !important;
  font-weight:400 !important;
  text-align:left !important;
  transform:none !important;
  transform-origin:left bottom !important;
  white-space:nowrap !important;
  overflow:hidden !important;
  text-overflow:ellipsis !important;
  z-index:9 !important
}

/* An opened file keeps the dimensional pull, but its filename becomes a label
   printed in the middle of the physical sheet. */
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active{
  z-index:999 !important;
  transform:
    translate3d(calc(var(--selected-shift) + var(--hover-spread)),calc(-70px - var(--hover-lift)),22px)
    rotateY(-17deg) rotateZ(-.35deg) skewY(-2deg) !important
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active .file-tray-name{
  left:50% !important;
  top:50% !important;
  right:auto !important;
  bottom:auto !important;
  width:72% !important;
  max-width:72% !important;
  transform:translate(-50%,-50%) !important;
  color:var(--reader-text) !important;
  text-align:center !important;
  white-space:normal !important;
  overflow-wrap:anywhere !important;
  text-overflow:clip !important;
  font-size:7.2px !important;
  line-height:1.18 !important
}

/* Exactly one file behaves as a selected folder item, not as an extracted one:
   it turns white in place and keeps its complete lower edge visible. */
body.has-file-extraction-tray .file-tray-rack.is-single-file .file-tray-item.is-active{
  --base-y:14px !important;
  --hover-lift:0px !important;
  transform:
    translate3d(0,14px,0)
    rotateY(-37deg) rotateZ(-1deg) skewY(-6deg) !important
}
body.has-file-extraction-tray .file-tray-rack.is-single-file .file-tray-item.is-active::after{
  background:rgba(255,255,251,.98) !important;
  opacity:1 !important
}
body.has-file-extraction-tray .file-tray-rack.is-single-file .file-tray-item.is-active .file-tray-name{
  left:50% !important;
  top:50% !important;
  bottom:auto !important;
  transform:translate(-50%,-50%) !important
}

@media(max-width:800px){
  html body .mechanics-shell > .project-index{padding-top:64px !important}
  .project-index-description{font-size:9.5px !important;max-width:none}
  .project-index-divider{margin:20px 0 22px}
  .project-index-kicker,.project-index-subtitle{font-size:14px !important}
  body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active{
    transform:
      translate3d(calc(var(--selected-shift) + var(--hover-spread)),calc(-48px - var(--hover-lift)),18px)
      rotateY(-16deg) rotateZ(-.3deg) skewY(-2deg) !important
  }
  body.has-file-extraction-tray .file-tray-rack.is-single-file .file-tray-item.is-active{
    transform:translate3d(0,10px,0) rotateY(-34deg) rotateZ(-1deg) skewY(-5deg) !important
  }
}
'''
    p.write_text(s, encoding='utf-8')

# ---------------- mechanics.js ----------------
# Add graceful preview support for media types that may appear automatically in folders.
p = Path('mechanics.js')
s = p.read_text(encoding='utf-8')

# Zoom viewer: video/audio support before generic image fallback.
zoom_marker = "    } else if (asset.type === 'heic') {\n      const card = document.createElement('div');"
if zoom_marker in s and "asset.type === 'video'" not in s:
    replacement = "    } else if (asset.type === 'video') {\n      const media = document.createElement('video');\n      media.controls = true;\n      media.preload = 'metadata';\n      media.src = encodeURI(asset.src);\n      zoomContent.appendChild(media);\n    } else if (asset.type === 'audio') {\n      const media = document.createElement('audio');\n      media.controls = true;\n      media.preload = 'metadata';\n      media.src = encodeURI(asset.src);\n      zoomContent.appendChild(media);\n    } else if (asset.type === 'heic') {\n      const card = document.createElement('div');"
    s = s.replace(zoom_marker, replacement, 1)

# Main sheet: render video/audio rather than attempting to load them as images.
render_marker = "    if (asset.type === 'text') {\n      loading(host);"
if render_marker in s and "sheet-media-preview" not in s:
    # Insert media branch immediately before text branch.
    media_branch = "    if (asset.type === 'video' || asset.type === 'audio') {\n      const media = document.createElement(asset.type === 'video' ? 'video' : 'audio');\n      media.className = 'sheet-media-preview';\n      media.controls = true;\n      media.preload = 'metadata';\n      media.src = encodeURI(asset.src);\n      host.replaceChildren(media);\n      fitAdaptiveSheet(asset.type === 'video' ? 1.55 : 1.2);\n      return;\n    }\n\n"
    s = s.replace(render_marker, media_branch + render_marker, 1)

p.write_text(s, encoding='utf-8')
