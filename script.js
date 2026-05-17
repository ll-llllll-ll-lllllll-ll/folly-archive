// script.js

const width = 4000;
const height = 3000;
let isClosingViewer = false;
let currentVideo = null;

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
    'blur(0.38px) contrast(1.8) brightness(1.02) sepia(0.25)';
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
    fragment: 'rt-01-a',
    type: 'graphic score',
    mode: 'image',
    src: 'attachments/aether-scorched-earth/score-2.webp',
    desc: '以太共振結構圖形記譜。'
  },

  'radio-instrument': {
    fragment: 'rt-02-b',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/instrument-2.mp4',
    desc: '以太共振結構圖形記譜。'
  },

  'radio-film': {
    fragment: 'rt-03-c',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/folly-2.mp4',
    desc: '電臺路焦土·以太鐵塔。'
  },

  'plague-scan': {
    fragment: 'pd-01-a',
    type: 'graphic score',
    mode: 'image',
    src: 'attachments/effluent-sedimentation/score-1.webp',
    desc: '死水沉積圖形記譜。'
  },

  'plague-audio': {
    fragment: 'pd-02-b',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/instrument-1.mp4',
    desc: '廢墟心臟敲擊聲學實驗。'
  },

  'plague-film': {
    fragment: 'pd-03-c',
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

  const path = item.src;
  const filename = path.split('/').pop();
  setViewerMode(item.mode, filename); // 加这一行

  document.getElementById('attachment-path').innerText = path;
  document.getElementById('attachment-filename').innerText = filename;
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
document.addEventListener('click', (e) => {
  if (e.target.id === 'score-toggle') {
    document.getElementById('score-hud')
      .classList.toggle('open');
  }
});
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
    const p = (video.currentTime / video.duration) * 100;
    bar.style.width = p + '%';
  };

  // progress click jump
  document.querySelector('.video-progress').onclick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  };
const playhead = document.getElementById('score-playhead');
const scoreBody = document.querySelector('.score-body');

video.ontimeupdate = () => {

  // progress bar
  const p = (video.currentTime / video.duration) * 100;
  document.getElementById('video-progress-bar').style.width = p + '%';

  // 🎼 score sync
  if (!playhead || !scoreBody) return;

  const h = scoreBody.offsetHeight;

  const y = (video.currentTime / video.duration) * h;

  playhead.style.transform =
    `translateY(${y}px)`;
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
    v.src = '';
    v.load();
  });

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

function setViewerMode(type, filename) {
  const viewer = document.querySelector('.attachment-viewer');

  const scoreImage = document.getElementById('score-image');
  const scoreHUD = document.getElementById('score-hud');

  viewer.classList.remove(
    'mode-image',
    'mode-video',
    'video-has-chapters',
    'folly-1',
    'folly-2'
  );

  // =========================
  // IMAGE
  // =========================
  if (type === 'image') {
    viewer.classList.add('mode-image');

    // ❗彻底关闭 score
    if (scoreHUD) scoreHUD.style.display = 'none';

    return;
  }

  // =========================
  // VIDEO
  // =========================
  viewer.classList.add('mode-video');

  // 默认：关闭 score（关键！）
  if (scoreHUD) scoreHUD.style.display = 'none';

  // =========================
  // folly-1
  // =========================
  if (filename === 'folly-1.mp4') {
    viewer.classList.add('video-has-chapters', 'folly-1');

    if (scoreHUD) scoreHUD.style.display = 'block';

    if (scoreImage) {
      scoreImage.src =
        'attachments/effluent-sedimentation/score-1.webp';
    }

    renderChapters('folly-1');
  }

  // =========================
  // folly-2
  // =========================
  else if (filename === 'folly-2.mp4') {
    viewer.classList.add('video-has-chapters', 'folly-2');

    if (scoreHUD) scoreHUD.style.display = 'block';

    if (scoreImage) {
      scoreImage.src =
        'attachments/aether-scorched-earth/score-2.webp';
    }

    renderChapters('folly-2');
  }
}
const chapterData = {
  'folly-1': [
    { time: 90, label: '1:30 collapse threshold' },
    { time: 105, label: '1:45 structural fade' }
  ],
  'folly-2': [
    { time: 150, label: '2:30 echo layer' },
    { time: 204, label: '3:24 void stabilization' }
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
      ? '▤'
      : '▥';

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
document.addEventListener('click', (e) => {

  if (isClosingViewer) return;
  const drawer = document.querySelector('.drawer');

  const viewer = document.querySelector('.attachment-viewer');

  // drawer 没开
  if (!drawer.classList.contains('open')) return;

  // viewer 正开着 → 不处理
  if (viewer && viewer.classList.contains('open')) return;

  // 点击 drawer 按钮
  const drawerTrigger = e.target.closest('.archive-drawer-link');

  // 点击 drawer 内部
  const clickedInsideDrawer = e.target.closest('.drawer');

  if (drawerTrigger) return;

  if (clickedInsideDrawer) return;

  // 关闭 drawer
  drawer.classList.remove('open');

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

