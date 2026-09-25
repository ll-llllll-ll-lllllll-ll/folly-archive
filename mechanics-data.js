(() => {
  const L = (zh, en, ja) => ({zh, en, ja});
  const asset = (src, type, filename = src.split('/').pop()) => ({src, type, filename});
  const record = (code, title, tags, src, type, note, meta = '') => ({
    code, title, tags, asset: asset(src, type), note, meta
  });

  const drawingTaxonomy = [
    {
      id:'power',
      label:L('动力源','Power','動力源'),
      children:[
        {
          id:'environment',
          label:L('环境输入','Environmental input','環境入力'),
          children:[
            {id:'wind',label:L('风动','Wind','風力'),tag:'wind'},
            {id:'kite',label:L('风筝','Kite','凧'),tag:'kite'},
            {id:'water',label:L('活水','Flowing water','流水'),tag:'water'},
            {id:'waterwheel',label:L('水车','Water wheel','水車'),tag:'waterwheel'},
            {id:'solar',label:L('太阳能','Solar','太陽光'),tag:'solar'},
            {id:'bio',label:L('生物','Biological','生物'),tag:'bio'}
          ]
        },
        {
          id:'thermal',
          label:L('热力与燃烧','Heat and combustion','熱・燃焼'),
          children:[
            {id:'steam',label:L('蒸汽机','Steam','蒸気機関'),tag:'steam'},
            {id:'combustion',label:L('内燃机','Combustion engine','内燃機関'),tag:'combustion'},
            {id:'explosion',label:L('爆炸','Explosion','爆発'),tag:'explosion'}
          ]
        },
        {
          id:'electric-high',
          label:L('电与高能','Electric and high energy','電気・高エネルギー'),
          children:[
            {id:'electric',label:L('电动','Electric','電動'),tag:'electric'},
            {id:'nuclear',label:L('核能','Nuclear','核エネルギー'),tag:'nuclear'}
          ]
        }
      ]
    },
    {
      id:'transmission',
      label:L('传动与耦合','Transmission and coupling','伝達・結合'),
      children:[
        {
          id:'gear',
          label:L('齿轮与啮合','Gears and meshing','歯車・噛合'),
          children:[{id:'gugor-gear',label:L('谷戈尔齿轮组','Gugor gear set','グゴル歯車群'),tag:'gugor-gear'}]
        },
        {
          id:'stress-coupling',
          label:L('张拉与应力','Tension and stress','張力・応力'),
          children:[{id:'stress',label:L('应力','Stress','応力'),tag:'stress'}]
        }
      ]
    },
    {
      id:'storage-release',
      label:L('储能与释放','Storage and release','蓄積・放出'),
      children:[
        {id:'flywheel-storage',label:L('飞轮储能','Flywheel storage','フライホイール蓄積'),tag:'flywheel'},
        {id:'elastic-stress',label:L('弹性应力','Elastic stress','弾性応力'),tag:'stress'},
        {id:'pressure',label:L('压力','Pressure','圧力'),tag:'pressure'},
        {id:'explosive-release',label:L('爆发释放','Burst release','瞬間放出'),tag:'explosion'}
      ]
    },
    {
      id:'rotation',
      label:L('旋转与惯性','Rotation and inertia','回転・慣性'),
      children:[
        {id:'flywheel',label:L('飞轮','Flywheel','フライホイール'),tag:'flywheel'},
        {id:'gyroscope',label:L('陀螺仪','Gyroscope','ジャイロスコープ'),tag:'gyroscope'},
        {id:'centrifuge',label:L('离心机','Centrifuge','遠心機'),tag:'centrifuge'}
      ]
    },
    {
      id:'material-process',
      label:L('材料与过程实验','Material and process studies','材料・過程実験'),
      children:[
        {id:'stone',label:L('石材与风化','Stone and weathering','石材・風化'),tag:'stone'},
        {id:'asphalt',label:L('沥青实验','Asphalt study','アスファルト実験'),tag:'asphalt'},
        {id:'bio-material',label:L('生物材料','Biomaterial','生体材料'),tag:'bio'}
      ]
    },
    {
      id:'drawing-projects',
      label:L('草图项目','Drawing projects','ドローイング・プロジェクト'),
      children:[
        {id:'project-centrifuge-flute',label:L('Centrifuge Flute','Centrifuge Flute','Centrifuge Flute'),tag:'project-centrifuge-flute'},
        {id:'project-dolomite-stonehenge',label:L('Dolomite Stonehenge','Dolomite Stonehenge','Dolomite Stonehenge'),tag:'project-dolomite-stonehenge'},
        {id:'project-exploding-whale',label:L('Exploding Whale','Exploding Whale','Exploding Whale'),tag:'project-exploding-whale'},
        {id:'project-ruin-egg',label:L('Ruin Egg','Ruin Egg','Ruin Egg'),tag:'project-ruin-egg'},
        {id:'project-her-memories',label:L('“Her Memories”','“Her Memories”','“Her Memories”'),tag:'project-her-memories'}
      ]
    }
  ];

  const drawingRecords = [
    record(
      'MD-CF-001',
      L('Centrifuge Flute · 图稿','Centrifuge Flute · drawing','Centrifuge Flute · 図稿'),
      ['centrifuge','project-centrifuge-flute'],
      'mechanics-drawings/centrifuge flute/centrifuge flute.JPG',
      'image',
      L('草图档案。原文件：centrifuge flute.JPG','Drawing archive. Source: centrifuge flute.JPG','ドローイング記録。原ファイル: centrifuge flute.JPG'),
      'centrifuge flute.JPG'
    ),
    record(
      'MD-DS-001',
      L('Dolomite Stonehenge · 草图','Dolomite Stonehenge · sketch','Dolomite Stonehenge · スケッチ'),
      ['stone','project-dolomite-stonehenge'],
      'mechanics-drawings/dolomite stonehenge/sketch.png',
      'image',
      L('草图档案。','Sketch archive.','スケッチ記録。'),
      'sketch.png'
    ),
    ...[1551,1552,1553,1554].map((n, index) => record(
      `MD-DS-${String(index + 2).padStart(3,'0')}`,
      L(`Dolomite Stonehenge · 模型 ${String(index + 1).padStart(2,'0')}`,`Dolomite Stonehenge · model ${String(index + 1).padStart(2,'0')}`,`Dolomite Stonehenge · 模型 ${String(index + 1).padStart(2,'0')}`),
      ['stone','project-dolomite-stonehenge'],
      `mechanics-drawings/dolomite stonehenge/model/IMG_${n}.HEIC`,
      'heic',
      L('模型过程原始 HEIC 文件。浏览器若无法预览，可使用右下角“打开原文件”。','Original HEIC model-study file. Use “Open source” if the browser cannot preview it.','模型制作過程のHEIC原本。表示できない場合は「原ファイルを開く」を使用してください。'),
      `IMG_${n}.HEIC`
    )),
    record(
      'MD-DS-006',
      L('Dolomite Stonehenge · 材料笔记','Dolomite Stonehenge · material notes','Dolomite Stonehenge · 材料ノート'),
      ['stone','project-dolomite-stonehenge'],
      'mechanics-drawings/dolomite stonehenge/notes.txt',
      'text',
      L('关于材料、时间与建筑老化的文字笔记。','Text notes on materiality, time, weathering and architecture.','素材、時間、風化、建築についてのテキストノート。'),
      'notes.txt'
    ),
    record(
      'MD-EW-001',
      L('Exploding Whale · 设计图','Exploding Whale · design','Exploding Whale · デザイン'),
      ['explosion','pressure','project-exploding-whale'],
      'mechanics-drawings/exploding whale/design.JPG',
      'image',
      L('设计图档案。','Design drawing archive.','デザイン図面記録。'),
      'design.JPG'
    ),
    record(
      'MD-EW-002',
      L('Exploding Whale · 假体提案','Exploding Whale · prosthetic proposal','Exploding Whale · プロステティック提案'),
      ['explosion','pressure','project-exploding-whale'],
      'mechanics-drawings/exploding whale/exploding whale prosthetic proposal.pdf',
      'pdf',
      L('PDF 提案文件。','PDF proposal document.','PDF提案資料。'),
      'exploding whale prosthetic proposal.pdf'
    ),
    ...[
      ['IMG_1661.jpg','image'],
      ['IMG_1668.heic','heic'],
      ['IMG_1669.jpg','image']
    ].map((item, index) => record(
      `MD-EW-${String(index + 3).padStart(3,'0')}`,
      L(`Exploding Whale · 原型 ${String(index + 1).padStart(2,'0')}`,`Exploding Whale · prototype ${String(index + 1).padStart(2,'0')}`,`Exploding Whale · プロトタイプ ${String(index + 1).padStart(2,'0')}`),
      ['explosion','pressure','project-exploding-whale'],
      `mechanics-drawings/exploding whale/prototype/${item[0]}`,
      item[1],
      L('原型过程档案。','Prototype-process archive.','プロトタイプ制作過程の記録。'),
      item[0]
    )),
    record(
      'MD-EW-006',
      L('Exploding Whale · 草图','Exploding Whale · sketch','Exploding Whale · スケッチ'),
      ['explosion','pressure','project-exploding-whale'],
      'mechanics-drawings/exploding whale/sketch.png',
      'image',
      L('草图档案。','Sketch archive.','スケッチ記録。'),
      'sketch.png'
    ),
    record(
      'MD-RE-001',
      L('Ruin Egg · 乐谱','Ruin Egg · score','Ruin Egg · スコア'),
      ['project-ruin-egg'],
      'mechanics-drawings/ruin-egg/score.png',
      'image',
      L('图式 / 乐谱档案。','Diagram / score archive.','図式 / スコア記録。'),
      'score.png'
    ),
    record(
      'MD-RE-002',
      L('Ruin Egg · 草图','Ruin Egg · sketch','Ruin Egg · スケッチ'),
      ['project-ruin-egg'],
      'mechanics-drawings/ruin-egg/sketch.png',
      'image',
      L('草图档案。','Sketch archive.','スケッチ記録。'),
      'sketch.png'
    ),
    record(
      'MD-HM-001',
      L('“Her Memories” · Zero-gravity Ruins','“Her Memories” · Zero-gravity Ruins','“Her Memories” · Zero-gravity Ruins'),
      ['project-her-memories'],
      'mechanics-drawings/“her memories”/zero-gravity-ruins.png',
      'image',
      L('概念图档案。','Concept drawing archive.','コンセプト図記録。'),
      'zero-gravity-ruins.png'
    )
  ];

  const workTaxonomy = [
    {
      id:'work-radio',
      label:L('电台路焦土','Aether scorched-earth','Aether scorched-earth'),
      children:[
        {id:'work-radio-mechanics',label:L('04 · 机械与图纸','04 · mechanics / drawings','04 · 機械・図面'),tag:'work-radio-mechanics'}
      ]
    },
    {
      id:'work-wenzhu',
      label:L('瘟猪坝沉墟','Effluent sedimentation','Effluent sedimentation'),
      children:[
        {id:'work-wenzhu-mechanics',label:L('04 · 机械与图纸','04 · mechanics / drawings','04 · 機械・図面'),tag:'work-wenzhu-mechanics'},
        {id:'work-wenzhu-material',label:L('06 · 材料','06 · material','06 · 素材'),tag:'work-wenzhu-material'},
        {id:'work-wenzhu-build',label:L('07 · 建造过程','07 · build process','07 · 制作過程'),tag:'work-wenzhu-build'}
      ]
    }
  ];

  const workRecords = [
    record(
      'WA-RR-M-001',
      L('电台路焦土 · 机械图纸','Aether scorched-earth · blueprint','Aether scorched-earth · blueprint'),
      ['work-radio-mechanics'],
      'work-archive/radio-road/04-mechanics/blueprint.jpg',
      'image',
      L('04-mechanics / blueprint.jpg','04-mechanics / blueprint.jpg','04-mechanics / blueprint.jpg'),
      'radio-road / 04-mechanics / blueprint.jpg'
    ),
    record(
      'WA-WZ-M-001',
      L('瘟猪坝沉墟 · 机械图纸','Effluent sedimentation · blueprint','Effluent sedimentation · blueprint'),
      ['work-wenzhu-mechanics'],
      'work-archive/wenzhu-dam/04-mechanics/blueprint.jpg',
      'image',
      L('04-mechanics / blueprint.jpg','04-mechanics / blueprint.jpg','04-mechanics / blueprint.jpg'),
      'wenzhu-dam / 04-mechanics / blueprint.jpg'
    ),
    ...[2,3,4,5,6,7,8].map((n, index) => record(
      `WA-WZ-M-${String(index + 2).padStart(3,'0')}`,
      L(`瘟猪坝沉墟 · rust ${String(n).padStart(2,'0')}`,`Effluent sedimentation · rust ${String(n).padStart(2,'0')}`,`Effluent sedimentation · rust ${String(n).padStart(2,'0')}`),
      ['work-wenzhu-mechanics'],
      `work-archive/wenzhu-dam/04-mechanics/rust${n}.jpg`,
      'image',
      L(`机械过程记录 · rust${n}.jpg`,`Mechanism-process record · rust${n}.jpg`,`機械プロセス記録 · rust${n}.jpg`),
      `wenzhu-dam / 04-mechanics / rust${n}.jpg`
    )),
    record(
      'WA-WZ-M-009',
      L('瘟猪坝沉墟 · score','Effluent sedimentation · score','Effluent sedimentation · score'),
      ['work-wenzhu-mechanics'],
      'work-archive/wenzhu-dam/04-mechanics/score.JPG',
      'image',
      L('机械 / 图式记录 · score.JPG','Mechanism / notation record · score.JPG','機械 / 図式記録 · score.JPG'),
      'wenzhu-dam / 04-mechanics / score.JPG'
    ),
    record(
      'WA-WZ-M-010',
      L('瘟猪坝沉墟 · simulation','Effluent sedimentation · simulation','Effluent sedimentation · simulation'),
      ['work-wenzhu-mechanics'],
      'work-archive/wenzhu-dam/04-mechanics/simulation.GIF',
      'image',
      L('机械运动模拟 · simulation.GIF','Mechanical-motion simulation · simulation.GIF','機械運動シミュレーション · simulation.GIF'),
      'wenzhu-dam / 04-mechanics / simulation.GIF'
    ),
    record(
      'WA-WZ-MAT-001',
      L('瘟猪坝沉墟 · material fragment 01','Effluent sedimentation · material fragment 01','Effluent sedimentation · material fragment 01'),
      ['work-wenzhu-material'],
      'work-archive/wenzhu-dam/06-material/fragment1.jpg',
      'image',
      L('材料碎片记录 · fragment1.jpg','Material-fragment record · fragment1.jpg','素材断片記録 · fragment1.jpg'),
      'wenzhu-dam / 06-material / fragment1.jpg'
    ),
    record(
      'WA-WZ-MAT-002',
      L('瘟猪坝沉墟 · material fragment 02','Effluent sedimentation · material fragment 02','Effluent sedimentation · material fragment 02'),
      ['work-wenzhu-material'],
      'work-archive/wenzhu-dam/06-material/ftagment2.jpg',
      'image',
      L('材料碎片记录 · ftagment2.jpg（保留仓库原文件名）','Material-fragment record · ftagment2.jpg (repository filename preserved)','素材断片記録 · ftagment2.jpg（リポジトリ上の原ファイル名を保持）'),
      'wenzhu-dam / 06-material / ftagment2.jpg'
    ),
    ...[1,2,3,4,5,6,7,8].map((n, index) => record(
      `WA-WZ-B-${String(index + 1).padStart(3,'0')}`,
      L(`瘟猪坝沉墟 · 建造过程 ${String(n).padStart(2,'0')}`,`Effluent sedimentation · build ${String(n).padStart(2,'0')}`,`Effluent sedimentation · 制作 ${String(n).padStart(2,'0')}`),
      ['work-wenzhu-build'],
      `work-archive/wenzhu-dam/07-build/island${n}.jpg`,
      'image',
      L(`建造过程记录 · island${n}.jpg`,`Build-process record · island${n}.jpg`,`制作過程記録 · island${n}.jpg`),
      `wenzhu-dam / 07-build / island${n}.jpg`
    ))
  ];

  window.RUINWRIGHT_MECHANICS = {
    sections:{
      drawing:{
        id:'drawing',
        label:L('机械草图','Mechanics drawing','機械ドローイング'),
        allLabel:L('全部草图档案','All drawing records','全ドローイング記録'),
        taxonomyLabel:L('机械分类 / 项目','Mechanism taxonomy / projects','機械分類 / プロジェクト'),
        taxonomy:drawingTaxonomy,
        records:drawingRecords
      },
      work:{
        id:'work',
        label:L('作品档案','Work archive','作品アーカイブ'),
        allLabel:L('全部作品档案','All work records','全作品記録'),
        taxonomyLabel:L('作品 / 档案段','Works / archive sections','作品 / 記録区分'),
        taxonomy:workTaxonomy,
        records:workRecords
      }
    },

    tagLabels:{
      wind:L('风动','Wind','風力'),
      kite:L('风筝','Kite','凧'),
      water:L('活水','Water','流水'),
      waterwheel:L('水车','Water wheel','水車'),
      solar:L('太阳能','Solar','太陽光'),
      bio:L('生物','Biological','生物'),
      steam:L('蒸汽机','Steam','蒸気'),
      combustion:L('内燃机','Combustion','内燃'),
      explosion:L('爆炸','Explosion','爆発'),
      electric:L('电动','Electric','電動'),
      nuclear:L('核能','Nuclear','核'),
      'gugor-gear':L('谷戈尔齿轮组','Gugor gear set','グゴル歯車群'),
      stress:L('应力','Stress','応力'),
      pressure:L('压力','Pressure','圧力'),
      flywheel:L('飞轮','Flywheel','フライホイール'),
      gyroscope:L('陀螺仪','Gyroscope','ジャイロ'),
      centrifuge:L('离心机','Centrifuge','遠心機'),
      asphalt:L('沥青实验','Asphalt','アスファルト'),
      stone:L('石材与风化','Stone / weathering','石材・風化'),
      'project-centrifuge-flute':L('Centrifuge Flute','Centrifuge Flute','Centrifuge Flute'),
      'project-dolomite-stonehenge':L('Dolomite Stonehenge','Dolomite Stonehenge','Dolomite Stonehenge'),
      'project-exploding-whale':L('Exploding Whale','Exploding Whale','Exploding Whale'),
      'project-ruin-egg':L('Ruin Egg','Ruin Egg','Ruin Egg'),
      'project-her-memories':L('“Her Memories”','“Her Memories”','“Her Memories”'),
      'work-radio-mechanics':L('电台路焦土 / 机械与图纸','Aether scorched-earth / mechanics','Aether scorched-earth / 機械・図面'),
      'work-wenzhu-mechanics':L('瘟猪坝沉墟 / 机械与图纸','Effluent sedimentation / mechanics','Effluent sedimentation / 機械・図面'),
      'work-wenzhu-material':L('瘟猪坝沉墟 / 材料','Effluent sedimentation / material','Effluent sedimentation / 素材'),
      'work-wenzhu-build':L('瘟猪坝沉墟 / 建造过程','Effluent sedimentation / build','Effluent sedimentation / 制作過程')
    }
  };
})();
