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
      label: L('Exploding Whale', 'Exploding Whale', 'Exploding Whale'),
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
              'mechanics-assets/projects/exploding-whale/storage-release/explosive-release/design.jpg',
              'image',
              L('储能与释放 / 爆炸释放 · design.jpg', 'Storage and release / explosive release · design.jpg', '蓄積・放出 / 爆発放出 · design.jpg')
            ),
            R(
              'exploding-whale-sketch',
              L('爆炸释放 · 草图', 'Explosive release · sketch', '爆発放出 · スケッチ'),
              'mechanics-assets/projects/exploding-whale/storage-release/explosive-release/sketch.png',
              'image',
              L('储能与释放 / 爆炸释放 · sketch.png', 'Storage and release / explosive release · sketch.png', '蓄積・放出 / 爆発放出 · sketch.png')
            ),
            R(
              'exploding-whale-prototype-01',
              L('爆炸释放 · 原型 1', 'Explosive release · prototype 1', '爆発放出 · プロトタイプ 1'),
              'mechanics-assets/projects/exploding-whale/storage-release/explosive-release/prototype-01.jpg',
              'image',
              L('原型记录 · prototype-01.jpg', 'Prototype record · prototype-01.jpg', 'プロトタイプ記録 · prototype-01.jpg')
            ),
            R(
              'exploding-whale-prototype-02',
              L('爆炸释放 · 原型 2', 'Explosive release · prototype 2', '爆発放出 · プロトタイプ 2'),
              'mechanics-assets/projects/exploding-whale/storage-release/explosive-release/prototype-02.heic',
              'heic',
              L('原型 HEIC 原文件 · prototype-02.heic', 'Original HEIC prototype · prototype-02.heic', 'HEIC原本 · prototype-02.heic')
            ),
            R(
              'exploding-whale-prototype-03',
              L('爆炸释放 · 原型 3', 'Explosive release · prototype 3', '爆発放出 · プロトタイプ 3'),
              'mechanics-assets/projects/exploding-whale/storage-release/explosive-release/prototype-03.jpg',
              'image',
              L('原型记录 · prototype-03.jpg', 'Prototype record · prototype-03.jpg', 'プロトタイプ記録 · prototype-03.jpg')
            )
          ]
        }
      ]
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    }
  ];

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
