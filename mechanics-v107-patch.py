from pathlib import Path

# Final v107 follow-up: resolve each file-label rise in JS rather than trying to
# multiply a CSS custom property inside calc(), which is not valid CSS.
p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
old = "          button.style.setProperty('--tray-order', String(index));"
new = "          button.style.setProperty('--tray-order', String(index));\n          button.style.setProperty('--tray-name-rise', `${(index * 1.1).toFixed(1)}px`);"
if old in s and "--tray-name-rise" not in s:
    s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

p = Path('mechanics.css')
s = p.read_text(encoding='utf-8')
s = s.replace(
    "bottom:calc(6px + (var(--tray-order,0) * .9px)) !important;",
    "bottom:calc(6px + var(--tray-name-rise,0px)) !important;"
)
p.write_text(s, encoding='utf-8')
