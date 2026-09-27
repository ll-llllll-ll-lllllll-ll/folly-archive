from pathlib import Path

p = Path('mechanics-data.js')
s = p.read_text(encoding='utf-8')
old = 'mechanics-assets/projects/exploding-whale/storage-release/explosive-release/'
new = 'mechanics-assets/projects/exploding-whale/environmental-input/degradation/'
count = s.count(old)
if count != 5:
    raise SystemExit(f'Expected 5 Exploding Whale legacy paths, found {count}')
s = s.replace(old, new)
p.write_text(s, encoding='utf-8')

p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
if 'mechanics-data.js?v=102' not in s:
    raise SystemExit('mechanics.html: mechanics-data.js?v=102 not found')
s = s.replace('mechanics-data.js?v=102', 'mechanics-data.js?v=104', 1)
p.write_text(s, encoding='utf-8')
