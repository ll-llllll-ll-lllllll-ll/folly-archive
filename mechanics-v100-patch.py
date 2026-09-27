from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Expected block not found in {path}: {old[:100]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')

# -----------------------------------------------------------------------------
# mechanics-data.js
# Give every sketch project an explicit technical-point child so the left index
# is structurally consistent: project -> technical point -> archive records.
# -----------------------------------------------------------------------------
p = Path('mechanics-data.js')
s = p.read_text(encoding='utf-8')

old = """    {
      id: 'centrifuge-flute',
      label: L('Centrifuge Flute', 'Centrifuge Flute', 'Centrifuge Flute'),
      taxonomy: 'centrifuge',
      records: [
        R(
          'centrifuge-flute-drawing',
          L('离心机', 'Centrifuge', '遠心機'),
          'mechanics-assets/projects/centrifuge-flute/rotation/centrifuge/centrifuge-flute.jpg',
          'image',
          L('旋转与惯性 / 离心机 · centrifuge-flute.jpg', 'Rotation and inertia / centrifuge · centrifuge-flute.jpg', '回転・慣性 / 遠心機 · centrifuge-flute.jpg')
        )
      ]
    },"""
new = """    {
      id: 'centrifuge-flute',
      label: L('Centrifuge Flute', 'Centrifuge Flute', 'Centrifuge Flute'),
      children: [
        {
          id: 'centrifuge-flute-centrifuge',
          label: L('离心机', 'Centrifuge', '遠心機'),
          taxonomy: 'centrifuge',
          records: [
            R(
              'centrifuge-flute-drawing',
              L('离心机', 'Centrifuge', '遠心機'),
              'mechanics-assets/projects/centrifuge-flute/rotation/centrifuge/centrifuge-flute.jpg',
              'image',
              L('旋转与惯性 / 离心机 · centrifuge-flute.jpg', 'Rotation and inertia / centrifuge · centrifuge-flute.jpg', '回転・慣性 / 遠心機 · centrifuge-flute.jpg')
            )
          ]
        }
      ]
    },"""
if old not in s: raise SystemExit('centrifuge block not found')
s = s.replace(old, new, 1)

old = """    {
      id: 'dolomite-stonehenge',
      label: L('Dolomite Stonehenge', 'Dolomite Stonehenge', 'Dolomite Stonehenge'),
      taxonomy: 'stone-masonry',
      records: [
        R(
          'dolomite-stonehenge-sketch',
          L('石材垒砌 · 草图', 'Stone masonry · sketch', '石積み · スケッチ'),
          'mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/sketch.png',
          'image',
          L('材料与实验 / 石材垒砌 · sketch.png', 'Materials and experiments / stone masonry · sketch.png', '材料・実験 / 石積み · sketch.png')
        ),
        R(
          'dolomite-stonehenge-notes',
          L('石材垒砌 · 笔记', 'Stone masonry · notes', '石積み · ノート'),
          'mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/notes.txt',
          'text',
          L('石材垒砌材料笔记 · notes.txt', 'Stone-masonry material notes · notes.txt', '石積み素材ノート · notes.txt')
        ),
        ...Array.from({ length: 4 }, (_, i) => {
          const nn = String(i + 1).padStart(2, '0');
          return R(
            `dolomite-stonehenge-model-${nn}`,
            L(`石材垒砌 · 模型 ${i + 1}`, `Stone masonry · model ${i + 1}`, `石積み · 模型 ${i + 1}`),
            `mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/model-${nn}.heic`,
            'heic',
            L(`模型 HEIC 原文件 · model-${nn}.heic`, `Original HEIC model file · model-${nn}.heic`, `模型HEIC原本 · model-${nn}.heic`)
          );
        })
      ]
    },"""
new = """    {
      id: 'dolomite-stonehenge',
      label: L('Dolomite Stonehenge', 'Dolomite Stonehenge', 'Dolomite Stonehenge'),
      children: [
        {
          id: 'dolomite-stonehenge-stone-masonry',
          label: L('石材垒砌', 'Stone masonry', '石積み'),
          taxonomy: 'stone-masonry',
          records: [
            R(
              'dolomite-stonehenge-sketch',
              L('石材垒砌 · 草图', 'Stone masonry · sketch', '石積み · スケッチ'),
              'mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/sketch.png',
              'image',
              L('材料与实验 / 石材垒砌 · sketch.png', 'Materials and experiments / stone masonry · sketch.png', '材料・実験 / 石積み · sketch.png')
            ),
            R(
              'dolomite-stonehenge-notes',
              L('石材垒砌 · 笔记', 'Stone masonry · notes', '石積み · ノート'),
              'mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/notes.txt',
              'text',
              L('石材垒砌材料笔记 · notes.txt', 'Stone-masonry material notes · notes.txt', '石積み素材ノート · notes.txt')
            ),
            ...Array.from({ length: 4 }, (_, i) => {
              const nn = String(i + 1).padStart(2, '0');
              return R(
                `dolomite-stonehenge-model-${nn}`,
                L(`石材垒砌 · 模型 ${i + 1}`, `Stone masonry · model ${i + 1}`, `石積み · 模型 ${i + 1}`),
                `mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/model-${nn}.heic`,
                'heic',
                L(`模型 HEIC 原文件 · model-${nn}.heic`, `Original HEIC model file · model-${nn}.heic`, `模型HEIC原本 · model-${nn}.heic`)
              );
            })
          ]
        }
      ]
    },"""
if old not in s: raise SystemExit('dolomite block not found')
s = s.replace(old, new, 1)

old = """    {
      id: 'ruin-egg',
      label: L('Ruin Egg', 'Ruin Egg', 'Ruin Egg'),
      taxonomy: 'hourglass',
      records: [
        R(
          'ruin-egg-sketch',
          L('沙漏 · 草图', 'Hourglass · sketch', '砂時計 · スケッチ'),
          'mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/sketch.png',
          'image',
          L('石材与风化 / 沙漏 · sketch.png', 'Stone and weathering / hourglass · sketch.png', '石材・風化 / 砂時計 · sketch.png')
        ),
        R(
          'ruin-egg-score',
          L('沙漏 · 乐谱', 'Hourglass · score', '砂時計 · スコア'),
          'mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/score.png',
          'image',
          L('石材与风化 / 沙漏 · score.png', 'Stone and weathering / hourglass · score.png', '石材・風化 / 砂時計 · score.png')
        )
      ]
    },"""
new = """    {
      id: 'ruin-egg',
      label: L('Ruin Egg', 'Ruin Egg', 'Ruin Egg'),
      children: [
        {
          id: 'ruin-egg-hourglass',
          label: L('沙漏', 'Hourglass', '砂時計'),
          taxonomy: 'hourglass',
          records: [
            R(
              'ruin-egg-sketch',
              L('沙漏 · 草图', 'Hourglass · sketch', '砂時計 · スケッチ'),
              'mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/sketch.png',
              'image',
              L('石材与风化 / 沙漏 · sketch.png', 'Stone and weathering / hourglass · sketch.png', '石材・風化 / 砂時計 · sketch.png')
            ),
            R(
              'ruin-egg-score',
              L('沙漏 · 乐谱', 'Hourglass · score', '砂時計 · スコア'),
              'mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/score.png',
              'image',
              L('石材与风化 / 沙漏 · score.png', 'Stone and weathering / hourglass · score.png', '石材・風化 / 砂時計 · score.png')
            )
          ]
        }
      ]
    },"""
if old not in s: raise SystemExit('ruin egg block not found')
s = s.replace(old, new, 1)

old = """    {
      id: 'her-memories',
      label: L('“Her Memories”', '“Her Memories”', '“Her Memories”'),
      taxonomy: 'space-debris',
      records: [
        R(
          'her-memories-space-debris',
          L('太空垃圾', 'Space debris', 'スペースデブリ'),
          'mechanics-assets/projects/her-memories/zero-gravity/space-debris/zero-gravity-ruins.png',
          'image',
          L('无重力 / 太空垃圾 · zero-gravity-ruins.png', 'Zero gravity / space debris · zero-gravity-ruins.png', '無重力 / スペースデブリ · zero-gravity-ruins.png')
        )
      ]
    }"""
new = """    {
      id: 'her-memories',
      label: L('“Her Memories”', '“Her Memories”', '“Her Memories”'),
      children: [
        {
          id: 'her-memories-space-debris-point',
          label: L('太空垃圾', 'Space debris', 'スペースデブリ'),
          taxonomy: 'space-debris',
          records: [
            R(
              'her-memories-space-debris',
              L('太空垃圾', 'Space debris', 'スペースデブリ'),
              'mechanics-assets/projects/her-memories/zero-gravity/space-debris/zero-gravity-ruins.png',
              'image',
              L('无重力 / 太空垃圾 · zero-gravity-ruins.png', 'Zero gravity / space debris · zero-gravity-ruins.png', '無重力 / スペースデブリ · zero-gravity-ruins.png')
            )
          ]
        }
      ]
    }"""
if old not in s: raise SystemExit('her memories block not found')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# -----------------------------------------------------------------------------
# mechanics.css
# Root cards keep [+]/[-]. Technical-point leaves use hollow/solid diamonds.
# Tighten the archive-drawer tree so it reads as one connected directory.
# -----------------------------------------------------------------------------
p = Path('mechanics.css')
s = p.read_text(encoding='utf-8')
marker = '/* v100 · dense technical-point directory / diamond leaf state */'
if marker not in s:
    s += r'''


/* v100 · dense technical-point directory / diamond leaf state */
/* Root project state remains [+]/[-]; clickable technical points are ◇/◆. */
.project-index .selection-node.is-project-card > .selection-row{
  min-height:22px !important;
  gap:5px !important
}
.project-index .selection-node.is-project-card > .selection-row > .tree-dash{
  width:27px !important;
  flex-basis:27px !important
}
.project-index .selection-node.is-project-card > .selection-children{
  margin-top:2px !important;
  padding:0 0 2px 22px !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
  min-height:21px !important;
  padding-left:38px !important;
  gap:3px !important;
  line-height:1.24 !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{
  top:5px !important;
  font-size:10px !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash{
  width:18px !important;
  flex:0 0 18px !important
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row > .tree-dash::before{
  content:"◇" !important;
  color:var(--mechanics-inactive-ink) !important;
  font:300 10px/1 "IBM Plex Sans JP",sans-serif !important;
  transform:translateY(-.25px)
}
.project-index .selection-node.is-project-card > .selection-children > .selection-node.is-selected > .selection-row > .tree-dash::before{
  content:"◆" !important;
  color:var(--reader-text) !important
}
.project-index .selection-node.is-project-card > .selection-children .selection-select{
  padding:0 !important;
  line-height:1.24 !important
}
.project-index .selection-node.is-project-card > .selection-children .selection-select[data-record-count]::after{
  margin-left:2px
}

@media(max-width:800px){
  .project-index .selection-node.is-project-card > .selection-row{
    min-height:24px !important
  }
  .project-index .selection-node.is-project-card > .selection-children{
    padding-left:20px !important
  }
  .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
    min-height:23px !important;
    padding-left:36px !important;
    gap:3px !important;
    font-size:11.5px !important
  }
  .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row::before{
    top:6px !important
  }
}
'''
    p.write_text(s, encoding='utf-8')

# -----------------------------------------------------------------------------
# mechanics.html cache bust
# -----------------------------------------------------------------------------
p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')
s = s.replace('mechanics.css?v=99', 'mechanics.css?v=100')
s = s.replace('mechanics-data.js?v=98', 'mechanics-data.js?v=100')
s = s.replace('mechanics.js?v=99', 'mechanics.js?v=100')
p.write_text(s, encoding='utf-8')
