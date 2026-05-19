// script.js

const width = 4000;
const height = 3000;
let isClosingViewer = false;
let currentVideo = null;
document.addEventListener('DOMContentLoaded', () => {
const chapterToggle =
  document.querySelector("#chapter-toggle");

const videoChapters =
  document.querySelector(".video-chapters");

if (chapterToggle && videoChapters) {

  chapterToggle.addEventListener("click", () => {

    videoChapters.classList.toggle("open");

  });

}
  const scoreHUD = document.getElementById('score-hud');
  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
  }
});
/* =========================
   world shape params
========================= */

const geoScale = 4.2;
const worldScale = 1.0;
const offsetX = -1.23;
const offsetY = 0.74;

/* =========================
   map init
========================= */

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 3,
  zoomControl: false,
  attributionControl: false,
  inertia: true
});

const bounds = [
  [0, 0],
  [height, width]
];

const overlay = L.imageOverlay(
  'assets/ruin-map.svg',
  bounds
).addTo(map);

overlay.on('load', () => {

  const el = overlay.getElement();
  if (!el) return;

  el.style.filter =
    'blur(0.39px) contrast(1.8) brightness(1.02) sepia(0.25)';
});

map.fitBounds(bounds);
map.setMaxBounds(null);

/* =========================
   state
========================= */

let activeSiteIndex = null;
const markers = [];

/* =========================
   attachment registry
========================= */

const attachmentRegistry = {

  'radio-score': {
    title: ' 圖形記譜 | 焦土以太',
    type: 'graphic score',
    mode: 'image',
    src: 'attachments/aether-scorched-earth/score-2.webp',
    desc: '以太共振結構圖形記譜。'
  },

  'radio-instrument': {
    title: '廢墟樂器 | 以太狹間',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/instrument-2.mp4',
    desc: '以太共振結構圖形記譜。'
  },

  'radio-film': {
    title: '廢墟園林·其二 | 焦土以太鐵塔',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/folly-2.mp4',
    desc: '電臺路焦土·以太鐵塔。'
  },

  'plague-scan': {
    title: '圖形記譜 | 心臟殘響',
    type: 'graphic score',
    mode: 'image',
    src: 'attachments/effluent-sedimentation/score-1.webp',
    desc: '死水沉積圖形記譜。'
  },

  'plague-audio': {
    title: '廢墟樂器 | 廢墟盆栽心臟',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/instrument-1.mp4',
    desc: '廢墟心臟敲擊聲學實驗。'
  },

  'plague-film': {
    title: '廢墟園林·其一 | 沉墟死水心臟',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/folly-1.mp4',
    desc: '瘟豬壩沉墟·死水心臟。'
  }

};

/* =========================
   attachment viewer
========================= */

const attachmentViewer =
  document.getElementById('attachment-viewer');
let currentZoom = 1;
let currentX = 0;
let currentY = 0;

function openAttachmentViewer(id) {

  const item = attachmentRegistry[id];
  if (!item) return;

  const stage = document.getElementById('attachment-stage');

  // ✅ 每次重新获取（关键修复点）
  const wrapper = document.getElementById('media-wrapper');
document.getElementById(
  'attachment-title'
).innerText = item.title || '';
  
  document.getElementById('attachment-filename').innerText = '';
  document.getElementById('attachment-desc').innerText = item.desc;

  document.querySelector('.attachment-hud')?.classList.add('show');
const hud = document.querySelector('.attachment-hud');

if (hud && !hud.querySelector('#reset')) {
  const resetBtn = document.createElement('div');
  resetBtn.id = 'reset';
  resetBtn.className = 'hud-btn';
  resetBtn.innerText = 'reset';

  hud.appendChild(resetBtn);
}
  // reset
  currentZoom = 1;
  currentX = 0;
  currentY = 0;

  wrapper.innerHTML = '';

  if (item.mode === 'image') {
    wrapper.innerHTML = `
      <img class="attachment-image" src="${item.src}" />
    `;
  }

  if (item.mode === 'video') {
  wrapper.innerHTML = `
    <video class="attachment-video" autoplay playsinline>
      <source src="${item.src}" />
    </video>
  `;

  setTimeout(() => {
    currentVideo = wrapper.querySelector('video');
    bindVideoUI();
  }, 50);
}
setViewerMode(item.mode, id);
  attachmentViewer.classList.add('open');
}

function bindVideoUI() {
  
  const video = currentVideo;
  if (!video) return;

  const playBtn = document.getElementById('video-play');
  const pauseBtn = document.getElementById('video-pause');
  const bar = document.getElementById('video-progress-bar');

  // play / pause
  playBtn.onclick = () => video.play();
  pauseBtn.onclick = () => video.pause();

  // progress update
 video.ontimeupdate = () => {

  const p =
    (video.currentTime / video.duration) * 100;

  bar.style.height = p + '%';

};

  // progress click jump
  document.querySelector('.video-progress').onclick = (e) => {

  const rect =
    e.currentTarget.getBoundingClientRect();

  // ⭐ 从下往上
  const ratio =
    1 - ((e.clientY - rect.top) / rect.height);

  video.currentTime =
    ratio * video.duration;

};
const playhead = document.getElementById('score-playhead');
const playhead2 =
  document.getElementById('score-playhead-2');
const scoreBody = document.querySelector('.score-body');

video.ontimeupdate = () => {

  const progress =
    video.currentTime / video.duration;

  // =========================
  // progress bar
  // =========================

  document.getElementById(
  'video-progress-bar'
).style.height = (progress * 100) + '%';

  // =========================
  // score sync
  // =========================

  if (!playhead || !scoreBody) return;

  const viewer =
    document.querySelector('.attachment-viewer');

  // ========================================
  // SCORE-1
  // 横向扫描
  // ========================================

  if (viewer.classList.contains('score-linear')) {

  const w = scoreBody.offsetWidth;

  // ====================================
  // 横向扫描线
  // ====================================

  const startX = w * 0.12;
  const endX = w * 1.0;

  const x =
    startX + (endX - startX) * progress;
    const scanProgress =
  (x - startX) / (endX - startX);

  playhead.style.transform =
    `translateX(${x}px)`;


  const pulse =
document.getElementById('score-pulse');

if (pulse) {
// 1:55 后彻底消失
if (video.currentTime >= 113) {
  pulse.style.opacity = 0;
  return;
}
  // ====================================
  // pulse 跟随扫描线横向移动
  // ====================================

  const pulseX = x - 3;

  // ====================================
  // 在扫描线内部上升
  // 从线底部 → 顶部
  // ====================================

  const lineTop = scoreBody.offsetHeight * 0.72;
  const lineHeight = scoreBody.offsetHeight * 0.22;

  // progress 0~1
  // 底部 → 顶部

  const pulseY =
    lineTop +
    lineHeight -
    (lineHeight * scanProgress);

  pulse.style.transform =
    `translate(${pulseX}px, ${pulseY}px)`;


  // ====================================
  // 闪烁速度变化
  // 2秒一次 → 1秒3次
  // ====================================

  const minFreq = 0.8; // 2秒一次
  const maxFreq = 3.0; // 1秒3次

  const freq =
    minFreq +
    (maxFreq - minFreq) * scanProgress;

  const blink =
    Math.sin(
      performance.now()
      * 0.001
      * freq
      * Math.PI
    );

  pulse.style.opacity =
    blink > 0
      ? 1
      : 0.12;
}
}

  // ========================================
  // SCORE-2
  // 仪表盘旋转
  // ========================================

 // ========================================
// SCORE-RADIAL
// 双仪表系统
// ========================================

else if (viewer.classList.contains('score-radial')) {

  // ====================================
  // NEEDLE 1
  // ====================================

  const start1 = -65;
  const end1 = 30;

  const target1 =
    start1 + (end1 - start1) * progress;

  if (!playhead.currentAngle) {
    playhead.currentAngle = start1;
  }

  // 惯性
  playhead.currentAngle +=
    (target1 - playhead.currentAngle) * 1;

  playhead.style.transform =
    `rotate(${playhead.currentAngle}deg)`;


  // ====================================
  // NEEDLE 2
  // 独立系统
  // ====================================

  if (playhead2) {

    // ⭐ 第二根自己的进度
    // 可以比主视频快/慢

    const progress2 =
      Math.min(1, progress * 1.2);

    // 第二根自己的范围
    const start2 = -55;
    const end2 = 74;

    // 第二根自己的目标角度
    const target2 =
      start2 + (end2 - start2) * progress2;

    if (!playhead2.currentAngle) {
      playhead2.currentAngle = start2;
    }

    // 第二根自己的惯性
    playhead2.currentAngle +=
      (target2 - playhead2.currentAngle) * 1;

    playhead2.style.transform =
      `rotate(${playhead2.currentAngle}deg)`;
  }
}
};
 
}

function closeAttachmentViewer() {

  isClosingViewer = true;
  currentVideo = null;

  const viewer = document.getElementById('attachment-viewer');
  const stage = document.getElementById('attachment-stage');

  document.querySelector('.attachment-hud')
    ?.classList.remove('show');

  const videos = stage.querySelectorAll('video');

  videos.forEach(v => {

  v.pause();

  // ⭐ 清除事件
  v.ontimeupdate = null;

  v.src = '';
  v.load();
});
// =========================
// reset score system
// =========================

const playhead =
  document.getElementById('score-playhead');

const playhead2 =
  document.getElementById('score-playhead-2');

const pulse =
  document.getElementById('score-pulse');

if (playhead) {

  playhead.style.transform =
    '';

  playhead.currentAngle = null;
}

if (playhead2) {

  playhead2.style.transform =
    '';

  playhead2.currentAngle = null;

  // ⭐ 关键：彻底隐藏
  playhead2.style.opacity = 0;
}

if (pulse) {

  pulse.style.transform = '';
  pulse.style.opacity = 0;
}
  viewer.classList.remove('open');

  // 下一帧解除锁
  setTimeout(() => {
    isClosingViewer = false;
  }, 0);
}


/* =========================
   outside click close
========================= */

attachmentViewer.addEventListener('click', (e) => {

  const inner = document.querySelector('.attachment-viewer-inner');
  if (!inner) return;

  if (!inner.contains(e.target)) {
    closeAttachmentViewer();
  }

});

/* =========================
   close button
========================= */

document.addEventListener('click', (e) => {

  if (e.target.closest('.attachment-close')) {
    closeAttachmentViewer();
  }

});

/* =========================
   drawer system
========================= */

const drawer =
  document.getElementById('archive-drawer');

const mask =
  document.getElementById('drawer-mask');

/* =========================
   tree toggle
========================= */
function toggleArchiveTree(el) {

  const collapse =
    el.parentElement.querySelector('.tree-collapse');

  const toggle =
    el.querySelector('.tree-toggle');

  if (!collapse || !toggle) return;

  const isOpen =
    getComputedStyle(collapse).display !== 'none';

  collapse.style.display =
    isOpen ? 'none' : 'block';

  toggle.innerText =
    isOpen ? '[+]' : '[-]';
}
function toggleFolder(id) {

  const folder =
    document.getElementById(id);

  const icon =
    document.getElementById(id + '-icon');

  if (!folder || !icon) return;

  const isOpen =
    folder.style.display === 'block';

  folder.style.display =
    isOpen ? 'none' : 'block';

  icon.innerText =
    isOpen ? '[+]' : '[-]';
}

/* =========================
   open drawer
========================= */

function openDrawer(site) {
const drawer = document.getElementById('archive-drawer');

drawer.style.left = `${window.innerWidth * 0.58}px`;
drawer.style.top = `${window.innerHeight * 0.22}px`;
  const el =
    document.getElementById('drawer-content');

  const isRadio =
    site.name === "電臺路焦土";

  const treeHTML = isRadio



 ? `

<div class="archive-tree">

  <div
  class="fault-node fault-root tree-folder"
  onclick="toggleArchiveTree(this)">

  <span class="tree-toggle">[+]</span>
  廢墟劇場檔案

</div>

<div class="tree-collapse">

 <div class="fault-line line-1">
    ╲
  </div>

  <div class="fault-line line-2">
    ╲
  </div>

<div class="fault-node fault-branch-a is-text">
  焦土以太鐵塔
</div>

<div class="fault-line-b">
  ╲
</div>

<div
  class="tree-file crack-a"
  onclick="openAttachmentViewer('radio-score')">

[圖形記譜]-2.webp

</div>

  <div class="fault-line-c">
    ╲
  </div>

  <div
    class="tree-file crack-b"
    onclick="openAttachmentViewer('radio-instrument')">

[樂器演示]-2.mp4

  </div>

  <div class="fault-line-d">
    ╱
  </div>

  <div
    class="tree-file crack-c"
    onclick="openAttachmentViewer('radio-film')">

[廢墟終曲]-2.mp4

  </div>
</div>
</div>
`
: `

<div class="archive-tree">

  <div
    class="fault-node fault-root tree-folder"
    onclick="toggleArchiveTree(this)">

    <span class="tree-toggle">[+]</span>
    廢墟劇場檔案

  </div>

  <div class="tree-collapse">

  <div class="fault-line line-1">
    ╲
  </div>

  <div class="fault-line line-2">
    ╲
  </div>

  <div class="fault-line">
    <div class="fault-node fault-branch-a is-text">
      沉墟死水心臟
    </div>
  </div>

  <div class="fault-line line-3">
    ╱
  </div>

  <div
    class="tree-file crack-a"
    onclick="openAttachmentViewer('plague-scan')">

[圖形記譜]-1.webp

  </div>

  <div class="fault-line line-4">
    ╲
  </div>

  <div
    class="tree-file crack-b"
    onclick="openAttachmentViewer('plague-audio')">

[樂器演示]-1.mp4

  </div>

  <div class="fault-line line-5">
    ╱
  </div>

  <div
    class="tree-file crack-c"
    onclick="openAttachmentViewer('plague-film')">

[廢墟終曲]-1.mp4

 </div> <!-- tree-collapse -->

</div> <!-- archive-tree -->

`;

  el.innerHTML = `

    <div class="drawer-body">

      <div class="drawer-site-title">
        ${site.name}
      </div>

      <br/>

      <div class="drawer-desc">
        ${site.desc}
      </div>

      <br/><br/>

     

      ${treeHTML}

    </div>

  `;

  drawer.classList.add('open');
  mask.classList.add('show');
}

function closeDrawer() {

  drawer.classList.remove('open');
  mask.classList.remove('show');

}

/* =========================
   image navigation system
========================= */

document.addEventListener('mousedown', (e) => {
  const step = 40;

  if (e.target.id === 'zoom-in') {
    startHold(() => currentZoom += 0.02);
  }

  else if (e.target.id === 'zoom-out') {
    startHold(() => {
      currentZoom -= 0.02;
      if (currentZoom < 0.2) currentZoom = 0.2;
    });
  }

  else if (e.target.id === 'move-up') {
    startHold(() => currentY += step * 0.2);
  }

  else if (e.target.id === 'move-down') {
    startHold(() => currentY -= step * 0.2);
  }

  else if (e.target.id === 'move-left') {
    startHold(() => currentX += step * 0.2);
  }

  else if (e.target.id === 'move-right') {
    startHold(() => currentX -= step * 0.2);
  }
});
document.addEventListener('click', (e) => {
  if (e.target.id === 'reset') {
    resetViewer();
  }
});
document.addEventListener('mouseup', stopHold);
document.addEventListener('mouseleave', stopHold);
document.addEventListener('touchend', stopHold);
document.addEventListener('touchcancel', stopHold);
function resetViewer() {
  const wrapper = document.getElementById('media-wrapper');
  if (!wrapper) return;

  const startX = currentX;
  const startY = currentY;
  const startZ = currentZoom;

  const duration = 600;
  const startTime = performance.now();

  function ease(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const k = ease(t);

    currentX = startX * (1 - k);
    currentY = startY * (1 - k);
    currentZoom = startZ + (1 - startZ) * k;

    applyTransform();

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
document.addEventListener('touchstart', (e) => {
  const step = 40;

  const target = e.target;

  if (target.id === 'zoom-in') {
    startHold(() => currentZoom += 0.02);
  }

  else if (target.id === 'zoom-out') {
    startHold(() => {
      currentZoom -= 0.02;
      if (currentZoom < 0.2) currentZoom = 0.2;
    });
  }

  else if (target.id === 'move-up') {
    startHold(() => currentY += step * 0.2);
  }

  else if (target.id === 'move-down') {
    startHold(() => currentY -= step * 0.2);
  }

  else if (target.id === 'move-left') {
    startHold(() => currentX += step * 0.2);
  }

  else if (target.id === 'move-right') {
    startHold(() => currentX -= step * 0.2);
  }
});

function setViewerMode(type, id) {
const chapterToggle =
  document.getElementById('chapter-toggle');

if (chapterToggle) {
  chapterToggle.style.display = 'none';
}
  const viewer =
    document.querySelector('.attachment-viewer');

  const scoreImage =
    document.getElementById('score-image');

  const scoreHUD =
    document.getElementById('score-hud');

  const imageHUD =
    document.querySelector('.attachment-hud');

  const videoUI =
    document.getElementById('video-ui');

  // =========================
  // RESET ALL STATES
  // =========================

  viewer.classList.remove(
    'mode-image',
    'mode-video',
    'video-has-chapters',
    'folly-1',
    'folly-2',
    'score-linear',
    'score-radial'
  );

  // 全部先隐藏
  if (imageHUD) {
    imageHUD.style.display = 'none';
  }

  if (videoUI) {
    videoUI.style.display = 'none';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'none';
    scoreHUD.classList.remove('open');
  }

  // =========================
  // IMAGE MODE
  // =========================

  if (type === 'image') {

    viewer.classList.add('mode-image');

    // 只有 image 开 image HUD
    if (imageHUD) {
      imageHUD.style.display = 'flex';
    }

    return;
  }

  // =========================
  // VIDEO MODE
  // =========================

  viewer.classList.add('mode-video');

  // 默认所有 video 都显示 video ui
  if (videoUI) {
    videoUI.style.display = 'flex';
  }

  // =========================
  // FOLLY-1
  // =========================

  if (id === 'plague-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-1',
    'score-linear'
  );

  // ⭐ 显示 chapter toggle
  if (chapterToggle) {
    chapterToggle.style.display = 'flex';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'flex';
    scoreHUD.classList.add('open');
  }

  scoreImage.src =
    'attachments/effluent-sedimentation/score-1.webp';

  renderChapters('folly-1');

  const playhead2 =
    document.getElementById('score-playhead-2');

  const pulse =
    document.getElementById('score-pulse');

  if (playhead2) {
    playhead2.style.opacity = 0;
  }

  if (pulse) {
    pulse.style.opacity = 1;
  }
}
  // =========================
  // FOLLY-2
  // =========================

  else if (id === 'radio-film') {

  viewer.classList.add(
    'video-has-chapters',
    'folly-2',
    'score-radial'
  );

  // ⭐ 显示 chapter toggle
  if (chapterToggle) {
    chapterToggle.style.display = 'flex';
  }

  if (scoreHUD) {
    scoreHUD.style.display = 'flex';
    scoreHUD.classList.add('open');
  }

  scoreImage.src =
    'attachments/aether-scorched-earth/score-2.webp';

  renderChapters('folly-2');

  const playhead2 =
    document.getElementById('score-playhead-2');

  const pulse =
    document.getElementById('score-pulse');

  if (playhead2) {
    playhead2.style.opacity = 1;
  }

  if (pulse) {
    pulse.style.opacity = 0;
  }
}
}
const chapterData = {
  'folly-1': [
    { time: 0, label: '引序：滯岸之殼' },
    { time: 20, label: '階段一：餘存維持' },
    { time: 42, label: '階段二：枯蝕應力' },
    { time: 56, label: '階段三：磨損掙扎' },
    { time: 84, label: '階段四：徒勞空撐' },
    { time: 124, label: '尾聲：崩塌餘響' }
  ],
  'folly-2': [
    { time: 0, label: '引序：并和狹間' },
    { time: 28, label: '階段一：非諧構合' },
    { time: 67, label: '階段二：磨盤震顫' },
    { time: 105, label: '階段三：風蝕噪層' },
    { time: 142, label: '階段四：嗡鳴共振' },
    { time: 198, label: '階段五：以太餘鳴' },
    { time: 231, label: '尾聲：無實之基' }
  ]
};

function renderChapters(key) {
  const container = document.querySelector('#video-ui .video-chapters');
  if (!container) return;

  container.innerHTML = '';

  chapterData[key].forEach(ch => {
    const div = document.createElement('div');
    div.textContent = ch.label;

    div.onclick = () => {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = ch.time;
        video.play();
      }
    };

    container.appendChild(div);
  });
}
/* =========================
   geo ↔ svg
========================= */

function geoToSVG(lat, lng) {

  let x =
    ((lng + 180) / 360 - 0.5)
    * geoScale + 0.5;

  let y =
    ((90 - lat) / 180 - 0.5)
    * geoScale + 0.5;

  x =
    (x - 0.5) * worldScale + 0.5;

  y =
    (y - 0.5) * worldScale + 0.5;

  x += offsetX;
  y += offsetY;

  x = Math.max(0, Math.min(1, x));
  y = Math.max(0, Math.min(1, y));

  return [y * height, x * width];
}

function svgToGeo(y, x) {

  x = x / width;
  y = y / height;

  x -= offsetX;
  y -= offsetY;

  x =
    (x - 0.5) / worldScale + 0.5;

  y =
    (y - 0.5) / worldScale + 0.5;

  x =
    (x - 0.5) / geoScale + 0.5;

  y =
    (y - 0.5) / geoScale + 0.5;

  return {
    lat: 90 - y * 180,
    lng: x * 360 - 180
  };
}

/* =========================
   coordinate format
========================= */

function toDMS(v) {

  const a = Math.abs(v);

  const d = Math.floor(a);

  const mF =
    (a - d) * 60;

  const m =
    Math.floor(mF);

  const s =
    Math.floor((mF - m) * 60);

  return { d, m, s };
}

function formatDMS(v, type) {

  const d = toDMS(v);

  const axis =
    type === 'lat'
      ? ''
      : '';

  const dir =
    type === 'lat'
      ? (v >= 0 ? '◓' : '◒')
      : (v >= 0 ? '◑' : '◐');

  return `  ${axis}${d.d}°${d.m}′${d.s}″${dir} `;
}

function formatLat(lat) {
  return formatDMS(lat, 'lat');
}

function formatLng(lng) {
  return formatDMS(lng, 'lng');
}

/* =========================
   sites
========================= */

const sites = [

  {
    name: "電臺路焦土",
    desc: "玻璃金屬製品廠遺址",
    lat: 31.225833,
    lng: 121.618333,
    archiveDate: "2026.01"
  },

  {
    name: "瘟豬壩沉墟",
    desc: "溶洞與舊地基遺址",
    lat: 30.454417,
    lng: 104.047667,
    archiveDate: "2025.05"
  }

];

function openDrawerByIndex(i) {
  openDrawer(sites[i]);
}
/* =========================
   marker icon
========================= */

function createIcon() {

  return L.divIcon({

    className: 'ruin-marker',

    html: `
      <div class="dot"></div>
    `,

    iconSize: [10, 10],

    iconAnchor: [5, 5]

  });

}

/* =========================
   markers
========================= */

sites.forEach((site, index) => {

  const pos =
    geoToSVG(site.lat, site.lng);

  const marker =
    L.marker(pos, {
      icon: createIcon()
    }).addTo(map);

  marker.bindPopup(`

    <div class="archive-popup">

      <div class="archive-content">

        <div class="archive-name">
          ${site.name}
        </div>

        <div class="archive-coords">

          ${formatLat(site.lat)}
          &nbsp;&nbsp;

          ${formatLng(site.lng)}

        </div>

        <div class="archive-date">
          ${site.archiveDate}
        </div>

        <div
  class="archive-drawer-link"
  onclick="window.openDrawerByIndex(${index})">

  <span class="label">
    荒構錄
  </span>

</div>

      </div>

    </div>

  `, {

    closeButton: false,

    autoClose: false,

    className: 'map-archive-popup',

    offset: [26, -26]

  });

  markers.push({
    site,
    marker,
    index
  });

});

/* =========================
   fly system
========================= */

function flyToSite(site, index) {

  activeSiteIndex = index;

  const pos =
    geoToSVG(site.lat, site.lng);

  markers.forEach(m =>
    m.marker.closePopup()
  );

  map.flyTo(pos, 2, {

    duration: 2.5,

    easeLinearity: 0.2

  });

  map.once('moveend', () => {

    markers[index]
      .marker
      .openPopup();

  });

  updateMarkerState();
}

/* =========================
   marker state
========================= */

function updateMarkerState() {

  markers.forEach(m => {

    const el =
      m.marker.getElement();

    const isActive =
      m.index === activeSiteIndex;

    m.marker.setOpacity(
      isActive ? 1 : 0.5
    );

    m.marker.setZIndexOffset(
      isActive ? 1000 : 0
    );

    if (el) {

      el.classList.toggle(
        'active-marker',
        isActive
      );

    }

  });

}

/* =========================
   ui
========================= */

const ui =
  document.createElement('div');

ui.className = 'archive-ui';

document.body.appendChild(ui);

function createLink(label, site, index) {

  const el =
    document.createElement('div');

  el.className = 'archive-link';

  el.innerHTML = `
    <span class="label">
      ${label}
    </span>
  `;

  el.onclick = () =>
    flyToSite(site, index);

  ui.appendChild(el);
}

createLink(
  "廢墟園林 · 其一 | 沉墟死水心臟",
  sites[1],
  1
);

createLink(
  "廢墟園林 · 其二 | 焦土以太鐵塔",
  sites[0],
  0
);

/* =========================
   HUD
========================= */

map.on('mousemove', e => {

  const geo =
    svgToGeo(
      e.latlng.lat,
      e.latlng.lng
    );

  document.getElementById('coords').innerText =

    `${formatLat(geo.lat)}   ${formatLng(geo.lng)}`;

});
/* =========================
   global drawer close system
========================= */

document.addEventListener('click', (e) => {

  if (isClosingViewer) return;

  const archiveDrawer =
    document.getElementById('archive-drawer');

  const introDrawer =
    document.getElementById('intro-drawer');

  const viewer =
    document.querySelector('.attachment-viewer');

  // ====================================
  // attachment viewer 开着时不处理
  // ====================================

  if (
    viewer &&
    viewer.classList.contains('open')
  ) return;

  // ====================================
  // ARCHIVE DRAWER
  // ====================================

  if (
    archiveDrawer &&
    archiveDrawer.classList.contains('open')
  ) {

    const clickedInsideArchiveDrawer =
      e.target.closest('#archive-drawer');

    const clickedArchiveTrigger =
      e.target.closest(
        '.archive-drawer-link'
      );

    // 点击 drawer 内部
    if (clickedInsideArchiveDrawer) {
      return;
    }

    // 点击打开 drawer 的按钮
    if (clickedArchiveTrigger) {
      return;
    }

    // 其他任何地方 → 关闭
    closeDrawer();
  }

  // ====================================
  // INTRO DRAWER
  // ====================================

  if (
    introDrawer &&
    introDrawer.classList.contains('open')
  ) {

    const clickedInsideIntro =
      e.target.closest('#intro-drawer');

    const clickedTitle =
      e.target.closest('#main-title');

    // 点击 intro drawer 内部
    if (clickedInsideIntro) {
      return;
    }

    // 点击标题自身
    if (clickedTitle) {
      return;
    }

    // 外部关闭
    introDrawer.classList.remove('open');

titleDismissed = true;

mainTitle?.classList.add('hidden');

mainTitle.style.pointerEvents = 'none';
  }

});
let holdInterval = null;

function startHold(action) {
  stopHold(); // 防止重复

  holdInterval = setInterval(() => {
    action();
    applyTransform();
  }, 50); // 数值越小越“顺滑/敏感”
}

function stopHold() {
  if (holdInterval) {
    clearInterval(holdInterval);
    holdInterval = null;
  }
}

function applyTransform() {
  const wrapper = document.getElementById('media-wrapper');
  if (!wrapper) return;

  wrapper.style.transform =
    `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
}
/* =========================
   intro drawer
========================= */

const mainTitle =
  document.getElementById('main-title');
const hoverZone =
  document.getElementById('title-hover-zone');
const introDrawer =
  document.getElementById('intro-drawer');

const introClose =
  document.getElementById('intro-close');
let titleDismissed = false;
if (mainTitle && introDrawer) {

  mainTitle.addEventListener('click', () => {

  introDrawer.classList.add('open');

  // drawer 打开时强制显示
  mainTitle.classList.remove('hidden');

  // 恢复点击
  mainTitle.style.pointerEvents = 'auto';

});
}

if (introClose && introDrawer) {

  introClose.addEventListener('click', () => {

 introDrawer.classList.remove('open');

titleDismissed = true;

// 关闭后隐藏
mainTitle.classList.add('hidden');

mainTitle.style.pointerEvents = 'none';
});

}
/* =========================
   hide title on interaction
========================= */

document.addEventListener('click', (e) => {

  // 点击标题自己不隐藏
  if (
    e.target.closest('#main-title')
  ) return;

  mainTitle?.classList.add('hidden');
mainTitle.style.pointerEvents = 'none';
});
/* =========================
   hover reveal title
========================= */

if (hoverZone && mainTitle) {

  hoverZone.addEventListener('mouseenter', () => {

  if (
    introDrawer.classList.contains('open')
  ) return;

  // 先显示
  mainTitle.classList.remove('hidden');

  // 强制恢复可点击
  mainTitle.style.pointerEvents = 'auto';

});
  hoverZone.addEventListener('mouseleave', () => {

  // drawer 开着时不隐藏
  if (
    introDrawer.classList.contains('open')
  ) return;

  // ⭐ 只有进入 dismiss 模式后
  // hover 离开才隐藏
  if (titleDismissed) {

    mainTitle.classList.add('hidden');

  }

});

}