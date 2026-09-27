from pathlib import Path

# Update project display titles while keeping internal IDs/folder paths stable.
data = Path('mechanics-data.js')
s = data.read_text(encoding='utf-8')
replacements = {
    "label: L('Exploding Whale', 'Exploding Whale', 'Exploding Whale')": "label: L('爆炸鲸', 'Exploding Whale', '爆発するクジラ')",
    "label: L('Centrifuge Flute', 'Centrifuge Flute', 'Centrifuge Flute')": "label: L('离心笛', 'Centrifuge Flute', '遠心笛')",
    "label: L('Dolomite Stonehenge', 'Dolomite Stonehenge', 'Dolomite Stonehenge')": "label: L('白云岩巨石阵', 'Dolomite Stonehenge', 'ドロマイト・ストーンヘンジ')",
    "label: L('Ruin Egg', 'Ruin Egg', 'Ruin Egg')": "label: L('遗存沙漏', 'Remnant Hourglass', '残存の砂時計')",
    "label: L('“Her Memories”', '“Her Memories”', '“Her Memories”')": "label: L('「她的记忆」', '“Her Memories”', '「彼女の記憶」')",
}
for old, new in replacements.items():
    if old not in s:
        raise SystemExit(f'missing title marker: {old}')
    s = s.replace(old, new, 1)
data.write_text(s, encoding='utf-8')

html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
h = h.replace('mechanics-data.js?v=108', 'mechanics-data.js?v=110')
h = h.replace('mechanics-data.js?v=109', 'mechanics-data.js?v=110')
h = h.replace('mechanics-data.js?v=110', 'mechanics-data.js?v=110', 1)
html.write_text(h, encoding='utf-8')
