from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "mechanics-data.js"
SYNC = ROOT / "scripts" / "sync-mechanics-assets.py"
INTRO = ROOT / "mechanics-assets" / "projects" / "spiral-decay" / "environmental-input" / "degradation" / "introduction.txt"

intro = """螺旋衰变 / Spiral Decay

一个关于螺旋如何在自然作用中逐步失去自身形态的小型测试。

螺旋在这里不是一个永久、封闭的几何形式，而是一种暂时稳定的结构。风、雨、水流、沉积、腐蚀、植物生长与材料疲劳不断介入，使它从规则而连续的曲线开始偏移、磨损、断裂、塌陷，最后只剩下局部痕迹。

这个测试不把“毁灭”理解为一次性的破坏，而把它看作一种缓慢的自然加工：形态在时间中被削弱、重写，并逐渐交还给环境。
"""
INTRO.parent.mkdir(parents=True, exist_ok=True)
INTRO.write_text(intro, encoding="utf-8")

sync = SYNC.read_text(encoding="utf-8")
entry = '    "spiral-decay-degradation": "mechanics-assets/projects/spiral-decay/environmental-input/degradation",\n'
anchor = '    "exploding-whale-degradation": "mechanics-assets/projects/exploding-whale/environmental-input/degradation",\n'
if entry not in sync:
    if anchor not in sync:
        raise SystemExit("POINT_DIRECTORIES anchor not found")
    sync = sync.replace(anchor, anchor + entry, 1)
    SYNC.write_text(sync, encoding="utf-8")

data = DATA.read_text(encoding="utf-8")
project_id = "id: 'spiral-decay'"
if project_id not in data:
    marker = "\n  ];\n\n  /* AUTO_MECHANICS_FILES_BEGIN */"
    if marker not in data:
        raise SystemExit("projects/AUTO marker not found")
    project = r''',
    {
      id: 'spiral-decay',
      label: L('螺旋衰变', 'Spiral Decay', '螺旋の崩壊'),
      children: [
        {
          id: 'spiral-decay-degradation',
          label: L('降解', 'Degradation', '分解'),
          taxonomy: 'degradation',
          records: []
        }
      ]
    }'''
    data = data.replace(marker, project + marker, 1)
    DATA.write_text(data, encoding="utf-8")

# Rebuild the auto-index so introduction.txt is immediately connected to the new point.
exec((ROOT / "scripts" / "sync-mechanics-assets.py").read_text(encoding="utf-8"), {"__name__": "__main__", "__file__": str(ROOT / "scripts" / "sync-mechanics-assets.py")})
