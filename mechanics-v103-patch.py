from pathlib import Path

# Lift the physical-file rack so the complete folder feet sit above the viewport,
# and keep each repository filename readable at the bottom of the folder face.
p = Path('mechanics.css')
s = p.read_text(encoding='utf-8')
marker = '/* v103 · lifted file rack / visible filename feet */'
if marker not in s:
    s += r'''


/* v103 · lifted file rack / visible filename feet */
.file-extraction-tray{
  overflow:visible !important
}
.file-tray-rack{
  bottom:20px !important;
  padding-bottom:10px !important;
  overflow:visible !important
}
.file-tray-item{
  overflow:visible !important
}
.file-tray-name{
  display:block !important;
  left:7px !important;
  right:6px !important;
  bottom:6px !important;
  z-index:8 !important;
  color:var(--reader-muted) !important;
  opacity:.78 !important;
  font:300 7px/1.15 "IBM Plex Mono",monospace !important;
  letter-spacing:.005em !important;
  white-space:nowrap !important;
  overflow:hidden !important;
  text-overflow:ellipsis !important;
  pointer-events:none !important
}
.file-tray-item.is-active .file-tray-name{
  color:var(--reader-text) !important;
  opacity:1 !important
}

@media(max-width:1100px){
  .file-tray-rack{bottom:17px !important}
}
@media(max-width:800px){
  .file-tray-rack{
    bottom:14px !important;
    padding-bottom:7px !important;
    overflow-x:auto !important;
    overflow-y:visible !important
  }
  .file-tray-name{
    bottom:5px !important;
    font-size:6.5px !important
  }
}
'''
    p.write_text(s, encoding='utf-8')

p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
s = s.replace('mechanics.css?v=102', 'mechanics.css?v=103')
p.write_text(s, encoding='utf-8')
