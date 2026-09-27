(() => {
  const L = (zh, en, ja) => ({ zh, en, ja });
  const A = (src, type = 'image', filename = src.split('/').pop(), extra = {}) => ({
    src, type, filename, ...extra
  });
  const R = (id, title, src, type, note, extra = {}) => ({
    id, title, asset: A(src, type), note, ...extra
  });

  const taxonomy = [
    {
      id: 'power',
      label: L('动力源', 'Power', '動力源'),
      children: [
        {
          id: 'environment',
          label: L('环境输入', 'Environmental input', '環境入力'),
          children: [
            { id: 'wind', label: L('风动', 'Wind', '風力') },
            { id: 'kite', label: L('风筝', 'Kite', '凧') },
            { id: 'water', label: L('活水', 'Flowing water', '流水') },
            { id: 'waterwheel', label: L('水车', 'Water wheel', '水車') },
            { id: 'solar', label: L('太阳能', 'Solar', '太陽光') },
            { id: 'bio', label: L('生物', 'Biological', '生物') },
            { id: 'degradation', label: L('降解', 'Degradation', '分解') }
          ]
        },
        {
          id: 'thermal',
          label: L('热力与燃烧', 'Heat and combustion', '熱・燃焼'),
          children: [
            { id: 'steam', label: L('蒸汽机', 'Steam engine', '蒸気機関') },
            { id: 'combustion', label: L('内燃机', 'Combustion engine', '内燃機関') },
            { id: 'explosion', label: L('爆炸', 'Explosion', '爆発') }
          ]
        },
        {
          id: 'electric-high',
          label: L('电与高能', 'Electric and high energy', '電気・高エネルギー'),
          children: [
            { id: 'electric', label: L('电动', 'Electric', '電動') },
            { id: 'nuclear', label: L('核能', 'Nuclear', '核エネルギー') },
            { id: 'electromagnet', label: L('电磁铁', 'Electromagnet', '電磁石') },
            { id: 'theremin', label: L('特雷门琴', 'Theremin', 'テルミン') }
          ]
        }
      ]
    },
    {
      id: 'transmission',
      label: L('传动与耦合', 'Transmission and coupling', '伝達・結合'),
      children: [
        {
          id: 'gear',
          label: L('齿轮与啮合', 'Gears and meshing', '歯車・噛合'),
          children: [
            { id: 'gugor-gear', label: L('谷戈尔齿轮组', 'Gugor gear set', 'グゴル歯車群') }
          ]
        },
        {
          id: 'tension-stress',
          label: L('张拉与应力', 'Tension and stress', '張力・応力'),
          children: [
            { id: 'tensegrity', label: L('张拉结构', 'Tensegrity structure', 'テンセグリティ構造') },
            { id: 'stress', label: L('应力', 'Stress', '応力') }
          ]
        }
      ]
    },
    {
      id: 'storage-release',
      label: L('储能与释放', 'Storage and release', '蓄積・放出'),
      children: [
        { id: 'flywheel-storage', label: L('飞轮储能', 'Flywheel storage', 'フライホイール蓄積') },
        { id: 'elastic-stress', label: L('弹性应力', 'Elastic stress', '弾性応力') },
        { id: 'pressure', label: L('压力', 'Pressure', '圧力') },
        { id: 'explosive-release', label: L('爆炸释放', 'Explosive release', '爆発放出') }
      ]
    },
    {
      id: 'rotation',
      label: L('旋转与惯性', 'Rotation and inertia', '回転・慣性'),
      children: [
        { id: 'flywheel', label: L('飞轮', 'Flywheel', 'フライホイール') },
        { id: 'gyroscope', label: L('陀螺仪', 'Gyroscope', 'ジャイロスコープ') },
        { id: 'centrifuge', label: L('离心机', 'Centrifuge', '遠心機') },
        { id: 'grindstone', label: L('磨盘', 'Grinding stone', '石臼') }
      ]
    },
    {
      id: 'material-experiment',
      label: L('材料与实验', 'Materials and experiments', '材料・実験'),
      children: [
        { id: 'ventricle-structure', label: L('心室结构', 'Ventricle structure', '心室構造') },
        { id: 'stone-masonry', label: L('石材垒砌', 'Stone masonry', '石積み') },
        {
          id: 'stone-weathering',
          label: L('石材与风化', 'Stone and weathering', '石材・風化'),
          children: [
            { id: 'hourglass', label: L('沙漏', 'Hourglass', '砂時計') }
          ]
        },
        { id: 'asphalt', label: L('沥青实验', 'Asphalt study', 'アスファルト実験') },
        { id: 'bio-material', label: L('生物材料', 'Biomaterial', '生体材料') }
      ]
    },
    {
      id: 'zero-gravity',
      label: L('无重力', 'Zero gravity', '無重力'),
      children: [
        { id: 'space-debris', label: L('太空垃圾', 'Space debris', 'スペースデブリ') }
      ]
    }
  ];

  const works = [
    {
      id: 'decayed-tower-scorched-earth',
      label: L('朽塔焦土', 'Decayed Tower Scorched Earth', '朽塔焦土'),
      children: [
        {
          id: 'tower-tensegrity',
          label: L('张拉结构', 'Tensegrity structure', 'テンセグリティ構造'),
          taxonomy: 'tensegrity',
          records: [
            R(
              'tower-tensegrity-blueprint',
              L('张拉结构', 'Tensegrity structure', 'テンセグリティ構造'),
              'mechanics-assets/works/decayed-tower-scorched-earth/tensegrity-structure/blueprint.jpg',
              'image',
              L('结构图纸记录 · blueprint.jpg', 'Structural drawing · blueprint.jpg', '構造図面記録 · blueprint.jpg')
            )
          ]
        },
        {
          id: 'tower-grindstone',
          label: L('磨盘', 'Grinding stone', '石臼'),
          taxonomy: 'grindstone',
          records: [
            R(
              'tower-grindstone-placeholder',
              L('磨盘', 'Grinding stone', '石臼'),
              'mechanics-assets/works/decayed-tower-scorched-earth/grindstone/placeholder.svg',
              'image',
              L('待替换占位图。', 'Placeholder image — replace later.', '差し替え用プレースホルダー。'),
              { placeholder: true }
            )
          ]
        },
        {
          id: 'tower-theremin',
          label: L('特雷门琴', 'Theremin', 'テルミン'),
          taxonomy: 'theremin',
          records: [
            R(
              'tower-theremin-placeholder',
              L('特雷门琴', 'Theremin', 'テルミン'),
              'mechanics-assets/works/decayed-tower-scorched-earth/theremin/placeholder.svg',
              'image',
              L('待替换占位图。', 'Placeholder image — replace later.', '差し替え用プレースホルダー。'),
              { placeholder: true }
            )
          ]
        }
      ]
    },
    {
      id: 'sunken-ruin-heart-chamber',
      label: L('沉墟心室', 'Sunken Ruin Heart Chamber', '沈墟心室'),
      children: [
        {
          id: 'heart-ventricle-structure',
          label: L('心室结构', 'Ventricle structure', '心室構造'),
          taxonomy: 'ventricle-structure',
          records: Array.from({ length: 8 }, (_, i) => {
            const n = i + 1;
            const nn = String(n).padStart(2, '0');
            return R(
              `heart-ventricle-${nn}`,
              L(`心室结构 ${n}`, `Ventricle structure ${n}`, `心室構造 ${n}`),
              `mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island-${nn}.jpg`,
              'image',
              L(`心室结构记录 · island-${nn}.jpg`, `Ventricle-structure record · island-${nn}.jpg`, `心室構造記録 · island-${nn}.jpg`)
            );
          })
        },
        {
          id: 'heart-pressure',
          label: L('压力', 'Pressure', '圧力'),
          taxonomy: 'pressure',
          records: [
            R(
              'heart-pressure-blueprint',
              L('压力 · 图纸', 'Pressure · blueprint', '圧力 · 図面'),
              'mechanics-assets/works/sunken-ruin-heart-chamber/pressure/blueprint.jpg',
              'image',
              L('压力结构图纸 · blueprint.jpg', 'Pressure-system blueprint · blueprint.jpg', '圧力構造図面 · blueprint.jpg')
            ),
            R(
              'heart-pressure-simulation',
              L('压力 · 模拟', 'Pressure · simulation', '圧力 · シミュレーション'),
              'mechanics-assets/works/sunken-ruin-heart-chamber/pressure/simulation.gif',
              'image',
              L('压力运动模拟 · simulation.gif', 'Pressure-motion simulation · simulation.gif', '圧力運動シミュレーション · simulation.gif')
            )
          ]
        },
        {
          id: 'heart-electromagnet',
          label: L('电磁铁', 'Electromagnet', '電磁石'),
          taxonomy: 'electromagnet',
          records: Array.from({ length: 7 }, (_, i) => {
            const n = i + 2;
            const nn = String(n).padStart(2, '0');
            return R(
              `heart-electromagnet-${nn}`,
              L(`电磁铁 ${n}`, `Electromagnet ${n}`, `電磁石 ${n}`),
              `mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust-${nn}.jpg`,
              'image',
              L(`电磁铁过程记录 · rust-${nn}.jpg`, `Electromagnet process record · rust-${nn}.jpg`, `電磁石制作記録 · rust-${nn}.jpg`)
            );
          })
        }
      ]
    }
  ];

  const projects = [
    {
      id: 'exploding-whale',
      label: L('“鲸爆”', 'Exploding Whale', '爆発するクジラ'),
      children: [
        {
          id: 'exploding-whale-degradation',
          label: L('降解', 'Degradation', '分解'),
          taxonomy: 'degradation',
          records: [
            R(
              'exploding-whale-proposal',
              L('降解 · 假体提案', 'Degradation · prosthetic proposal', '分解 · プロステティック提案'),
              'mechanics-assets/projects/exploding-whale/environmental-input/degradation/prosthetic-proposal.pdf',
              'pdf',
              L('环境输入 / 降解 · prosthetic-proposal.pdf', 'Environmental input / degradation · prosthetic-proposal.pdf', '環境入力 / 分解 · prosthetic-proposal.pdf')
            )
          ]
        },
        {
          id: 'exploding-whale-explosive-release',
          label: L('爆炸释放', 'Explosive release', '爆発放出'),
          taxonomy: 'explosive-release',
          records: [
            R(
              'exploding-whale-design',
              L('爆炸释放 · 设计', 'Explosive release · design', '爆発放出 · デザイン'),
              'mechanics-assets/projects/exploding-whale/environmental-input/degradation/design.jpg',
              'image',
              L('储能与释放 / 爆炸释放 · design.jpg', 'Storage and release / explosive release · design.jpg', '蓄積・放出 / 爆発放出 · design.jpg')
            ),
            R(
              'exploding-whale-sketch',
              L('爆炸释放 · 草图', 'Explosive release · sketch', '爆発放出 · スケッチ'),
              'mechanics-assets/projects/exploding-whale/environmental-input/degradation/sketch.png',
              'image',
              L('储能与释放 / 爆炸释放 · sketch.png', 'Storage and release / explosive release · sketch.png', '蓄積・放出 / 爆発放出 · sketch.png')
            ),
            R(
              'exploding-whale-prototype-01',
              L('爆炸释放 · 原型 1', 'Explosive release · prototype 1', '爆発放出 · プロトタイプ 1'),
              'mechanics-assets/projects/exploding-whale/environmental-input/degradation/prototype-01.jpg',
              'image',
              L('原型记录 · prototype-01.jpg', 'Prototype record · prototype-01.jpg', 'プロトタイプ記録 · prototype-01.jpg')
            ),
            R(
              'exploding-whale-prototype-02',
              L('爆炸释放 · 原型 2', 'Explosive release · prototype 2', '爆発放出 · プロトタイプ 2'),
              'mechanics-assets/projects/exploding-whale/environmental-input/degradation/prototype-02.heic',
              'heic',
              L('原型 HEIC 原文件 · prototype-02.heic', 'Original HEIC prototype · prototype-02.heic', 'HEIC原本 · prototype-02.heic')
            ),
            R(
              'exploding-whale-prototype-03',
              L('爆炸释放 · 原型 3', 'Explosive release · prototype 3', '爆発放出 · プロトタイプ 3'),
              'mechanics-assets/projects/exploding-whale/environmental-input/degradation/prototype-03.jpg',
              'image',
              L('原型记录 · prototype-03.jpg', 'Prototype record · prototype-03.jpg', 'プロトタイプ記録 · prototype-03.jpg')
            )
          ]
        }
      ]
    },
    {
      id: 'centrifuge-flute',
      label: L('离心笛', 'Centrifuge Flute', '遠心笛'),
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
    },
    {
      id: 'dolomite-stonehenge',
      label: L('白云岩巨石阵', 'Dolomite Stonehenge', 'ドロマイト・ストーンヘンジ'),
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
    },
    {
      id: 'ruin-egg',
      label: L('遗存沙漏', 'Remnant Hourglass', '残存の砂時計'),
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
    },
    {
      id: 'her-memories',
      label: L('「她的记忆」', '“Her Memories”', '「彼女の記憶」'),
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
    }
  ];

  /* AUTO_MECHANICS_FILES_BEGIN */
  // Generated from the real contents of mechanics-assets/. Do not hand-edit this block.
  const AUTO_MECHANICS_FILES = {
  "tower-tensegrity": {
    "directory": "mechanics-assets/works/decayed-tower-scorched-earth/tensegrity-structure/",
    "files": []
  },
  "tower-grindstone": {
    "directory": "mechanics-assets/works/decayed-tower-scorched-earth/grindstone/",
    "files": []
  },
  "tower-theremin": {
    "directory": "mechanics-assets/works/decayed-tower-scorched-earth/theremin/",
    "files": []
  },
  "heart-ventricle-structure": {
    "directory": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/",
    "files": [
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/environment.jpg",
        "filename": "environment.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island1.jpg",
        "filename": "island1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island2.jpg",
        "filename": "island2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island3.jpg",
        "filename": "island3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island4.jpg",
        "filename": "island4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island5.jpg",
        "filename": "island5.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island6.jpg",
        "filename": "island6.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island7.jpg",
        "filename": "island7.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/island8.jpg",
        "filename": "island8.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/stage1.jpg",
        "filename": "stage1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/stage2.jpg",
        "filename": "stage2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/stage3.jpg",
        "filename": "stage3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/ventricle-structure/stage4.jpg",
        "filename": "stage4.jpg",
        "type": "image"
      }
    ]
  },
  "heart-pressure": {
    "directory": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/",
    "files": [
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/blueprint.jpg",
        "filename": "blueprint.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/fragment1.jpg",
        "filename": "fragment1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/fragment2.jpg",
        "filename": "fragment2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/fragment3.jpg",
        "filename": "fragment3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/fragment4.jpg",
        "filename": "fragment4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/fragment5.jpg",
        "filename": "fragment5.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/fragment6.jpg",
        "filename": "fragment6.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/simulation.GIF",
        "filename": "simulation.GIF",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/structure0.jpg",
        "filename": "structure0.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/structure1.jpg",
        "filename": "structure1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/structure2.jpg",
        "filename": "structure2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/structure3.jpg",
        "filename": "structure3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/structure4.jpg",
        "filename": "structure4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/pressure/structure5.jpg",
        "filename": "structure5.jpg",
        "type": "image"
      }
    ]
  },
  "heart-electromagnet": {
    "directory": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/",
    "files": [
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/bottle1.jpg",
        "filename": "bottle1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/bottle2.jpg",
        "filename": "bottle2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/bottle3.jpg",
        "filename": "bottle3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/bottle4.jpg",
        "filename": "bottle4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/bottle5.jpg",
        "filename": "bottle5.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/bottle6.jpg",
        "filename": "bottle6.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart1.jpg",
        "filename": "heart1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart2.jpg",
        "filename": "heart2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart3.jpg",
        "filename": "heart3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart4.jpg",
        "filename": "heart4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart and pump.jpg",
        "filename": "heart and pump.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart closeup1.jpg",
        "filename": "heart closeup1.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart closeup2.jpg",
        "filename": "heart closeup2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart closeup3.jpg",
        "filename": "heart closeup3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart closeup4.jpg",
        "filename": "heart closeup4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/heart closeup5.jpg",
        "filename": "heart closeup5.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust2.jpg",
        "filename": "rust2.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust3.jpg",
        "filename": "rust3.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust4.jpg",
        "filename": "rust4.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust5.jpg",
        "filename": "rust5.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust6.jpg",
        "filename": "rust6.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust7.jpg",
        "filename": "rust7.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/rust8.jpg",
        "filename": "rust8.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/works/sunken-ruin-heart-chamber/electromagnet/score.JPG",
        "filename": "score.JPG",
        "type": "image"
      }
    ]
  },
  "exploding-whale-degradation": {
    "directory": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/",
    "files": [
      {
        "src": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/design.jpg",
        "filename": "design.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/prosthetic-proposal.pdf.pdf",
        "filename": "prosthetic-proposal.pdf.pdf",
        "type": "pdf"
      },
      {
        "src": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/prototype-01.jpg",
        "filename": "prototype-01.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/prototype-02.jpg",
        "filename": "prototype-02.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/prototype-03.jpg",
        "filename": "prototype-03.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/exploding-whale/environmental-input/degradation/sketch.png",
        "filename": "sketch.png",
        "type": "image"
      }
    ]
  },
  "centrifuge-flute-centrifuge": {
    "directory": "mechanics-assets/projects/centrifuge-flute/rotation/centrifuge/",
    "files": [
      {
        "src": "mechanics-assets/projects/centrifuge-flute/rotation/centrifuge/centrifuge flute.jpg",
        "filename": "centrifuge flute.jpg",
        "type": "image"
      }
    ]
  },
  "dolomite-stonehenge-stone-masonry": {
    "directory": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/",
    "files": [
      {
        "src": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/model-01.jpg",
        "filename": "model-01.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/model-02.jpg",
        "filename": "model-02.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/model-03.jpg",
        "filename": "model-03.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/model-04.jpg",
        "filename": "model-04.jpg",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/notes.txt",
        "filename": "notes.txt",
        "type": "text"
      },
      {
        "src": "mechanics-assets/projects/dolomite-stonehenge/material-experiment/stone-masonry/sketch.png",
        "filename": "sketch.png",
        "type": "image"
      }
    ]
  },
  "ruin-egg-hourglass": {
    "directory": "mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/",
    "files": [
      {
        "src": "mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/score.png",
        "filename": "score.png",
        "type": "image"
      },
      {
        "src": "mechanics-assets/projects/ruin-egg/material-experiment/stone-weathering/hourglass/sketch.png",
        "filename": "sketch.png",
        "type": "image"
      }
    ]
  },
  "her-memories-space-debris-point": {
    "directory": "mechanics-assets/projects/her-memories/zero-gravity/space-debris/",
    "files": [
      {
        "src": "mechanics-assets/projects/her-memories/zero-gravity/space-debris/zero-gravity-ruins.png",
        "filename": "zero-gravity-ruins.png",
        "type": "image"
      }
    ]
  }
};

  const autoMechanicsPointMap = new Map();
  const indexMechanicsPoints = nodes => (nodes || []).forEach(node => {
    autoMechanicsPointMap.set(node.id, node);
    indexMechanicsPoints(node.children);
  });
  indexMechanicsPoints(works);
  indexMechanicsPoints(projects);

  // Exploding Whale is intentionally kept as one technical point: 降解.
  const explodingWhaleProject = projects.find(project => project.id === 'exploding-whale');
  if (explodingWhaleProject?.children) {
    explodingWhaleProject.children = explodingWhaleProject.children.filter(child => child.id !== 'exploding-whale-explosive-release');
  }

  Object.entries(AUTO_MECHANICS_FILES).forEach(([pointId, bucket]) => {
    const node = autoMechanicsPointMap.get(pointId);
    if (!node) return;
    node.directory = bucket.directory;
    const label = node.label || L(pointId, pointId, pointId);
    node.records = bucket.files.map((file, index) => R(
      `${pointId}-auto-${index + 1}`,
      L(`${label.zh || pointId} · ${file.filename}`, `${label.en || pointId} · ${file.filename}`, `${label.ja || pointId} · ${file.filename}`),
      file.src,
      file.type,
      L(file.filename, file.filename, file.filename),
      { autoIndexed: true, directory: bucket.directory }
    ));
  });
  /* AUTO_MECHANICS_FILES_END */

  window.RUINWRIGHT_ENGINEERING_ARCHIVE = {
    taxonomy,
    selectionGroups: [
      {
        id: 'works',
        label: L('作品', 'Works', '作品'),
        entries: works
      },
      {
        id: 'projects',
        label: L('草图项目', 'Drawing projects', 'ドローイング・プロジェクト'),
        entries: projects,
        treeLabel: true
      }
    ]
  };
})();
