// script.js

const width = 4000;
const height = 3000;

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
    desc: '焦土鐵塔中的共振結構圖形記譜。'
  },

  'radio-instrument': {
    fragment: 'rt-02-b',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/instrument-2.mp4',
    desc: '廢棄廣播結構聲學實驗。'
  },

  'radio-film': {
    fragment: 'rt-03-c',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/aether-scorched-earth/folly-2.mp4',
    desc: '廢墟園林錄像記錄。'
  },

  'plague-scan': {
    fragment: 'pd-01-a',
    type: 'graphic score',
    mode: 'image',
    src: 'attachments/effluent-sedimentation/score-1.webp',
    desc: '地下沉積圖形記譜殘片。'
  },

  'plague-audio': {
    fragment: 'pd-02-b',
    type: 'instrument demonstration',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/instrument-1.mp4',
    desc: '地下空洞聲學實驗。'
  },

  'plague-film': {
    fragment: 'pd-03-c',
    type: 'ruin garden footage',
    mode: 'video',
    src: 'attachments/effluent-sedimentation/folly-1.mp4',
    desc: '地下廢墟園林錄像。'
  }

};

/* =========================
   attachment viewer
========================= */

const attachmentViewer =
  document.getElementById('attachment-viewer');

function openAttachmentViewer(id) {

  const item = attachmentRegistry[id];
  if (!item) return;

  document.getElementById('attachment-fragment').innerText =
    `fragment : ${item.fragment}`;

  document.getElementById('attachment-type').innerText =
    `type : ${item.type}`;

  document.getElementById('attachment-desc').innerText =
    item.desc;

  const stage = document.getElementById('attachment-stage');

  if (item.mode === 'image') {
    stage.innerHTML =
      `<img class="attachment-image" src="${item.src}"/>`;
  }

  if (item.mode === 'video') {
    stage.innerHTML =
      `<video class="attachment-video" controls autoplay>
        <source src="${item.src}" />
      </video>`;
  }

  attachmentViewer.classList.add('open');
}

function closeAttachmentViewer() {

  const stage = document.getElementById('attachment-stage');
  const videos = stage.querySelectorAll('video');

  videos.forEach(v => {
    v.pause();
    v.src = '';
    v.load();
  });

  stage.innerHTML = '';
  attachmentViewer.classList.remove('open');
}

/* =========================
   drawer system
========================= */

const drawer = document.getElementById('archive-drawer');
const mask = document.getElementById('drawer-mask');

function openDrawer(site) {

  const el = document.getElementById('drawer-content');

  const isRadio = site.name === "電臺路焦土";

  el.innerHTML = `

    <div class="drawer-body">

      <div class="drawer-site-title">${site.name}</div>

      <br/>

      <div class="drawer-desc">${site.desc}</div>

      <br/><br/>

      <div class="drawer-section-title">
        ${isRadio ? '廢墟劇場檔案' : '地下沉積檔案'}
      </div>

      <div class="attachment-list">

        ${
          isRadio
            ? `
              <div class="attachment-item" onclick="openAttachmentViewer('radio-score')">[圖形記譜]</div>
              <div class="attachment-item" onclick="openAttachmentViewer('radio-instrument')">[樂器演示]</div>
              <div class="attachment-item" onclick="openAttachmentViewer('radio-film')">[廢墟園林錄像]</div>
            `
            : `
              <div class="attachment-item" onclick="openAttachmentViewer('plague-scan')">[圖形記譜]</div>
              <div class="attachment-item" onclick="openAttachmentViewer('plague-audio')">[樂器演示]</div>
              <div class="attachment-item" onclick="openAttachmentViewer('plague-film')">[廢墟園林錄像]</div>
            `
        }

      </div>

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
   geo ↔ svg
========================= */

function geoToSVG(lat, lng) {

  let x = ((lng + 180) / 360 - 0.5) * geoScale + 0.5;
  let y = ((90 - lat) / 180 - 0.5) * geoScale + 0.5;

  x = (x - 0.5) * worldScale + 0.5;
  y = (y - 0.5) * worldScale + 0.5;

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

  x = (x - 0.5) / worldScale + 0.5;
  y = (y - 0.5) / worldScale + 0.5;

  x = (x - 0.5) / geoScale + 0.5;
  y = (y - 0.5) / geoScale + 0.5;

  return {
    lat: 90 - y * 180,
    lng: x * 360 - 180
  };
}

/* =========================
   🔥 FIXED DMS SYSTEM
   (n/e/s/w + lowercase english)
========================= */

function toDMS(v) {
  const a = Math.abs(v);
  const d = Math.floor(a);
  const mF = (a - d) * 60;
  const m = Math.floor(mF);
  const s = Math.floor((mF - m) * 60);
  return { d, m, s };
}

function formatDMS(v, type) {

  const d = toDMS(v);

  const dir =
    type === 'lat'
      ? (v >= 0 ? 'n' : 's')
      : (v >= 0 ? 'e' : 'w');

  return `${d.d}°${d.m}′${d.s}″${dir}`;
}

function formatLat(lat) {
  return formatDMS(lat, 'lat');
}

function formatLng(lng) {
  return formatDMS(lng, 'lng');
}

/* =========================
   sites (繁體 + 小寫规则)
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

/* =========================
   marker icon
========================= */

function createIcon() {
  return L.divIcon({
    className: 'ruin-marker',
    html: `<div class="dot"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
}

/* =========================
   markers
========================= */

sites.forEach((site, index) => {

  const pos = geoToSVG(site.lat, site.lng);

  const marker = L.marker(pos, {
    icon: createIcon()
  }).addTo(map);

  marker.bindPopup(`

    <div class="archive-popup">

      <div class="archive-content">

        <div class="archive-name">${site.name}</div>

        <div class="archive-coords">
          λ ${formatLat(site.lat)} &nbsp;&nbsp;
          φ ${formatLng(site.lng)}
        </div>

        <div class="archive-date">${site.archiveDate}</div>

        <div class="archive-drawer-link"
          onclick='openDrawer(${JSON.stringify(site)})'>
          荒構錄
        </div>

      </div>

    </div>

  `, {
    closeButton: false,
    autoClose: false,
    className: 'map-archive-popup',
    offset: [26, -26]
  });

  markers.push({ site, marker, index });
});

/* =========================
   fly system
========================= */

function flyToSite(site, index) {

  activeSiteIndex = index;

  const pos = geoToSVG(site.lat, site.lng);

  markers.forEach(m => m.marker.closePopup());

  map.flyTo(pos, 2, {
    duration: 2.5,
    easeLinearity: 0.2
  });

  map.once('moveend', () => {
    markers[index].marker.openPopup();
  });

  updateMarkerState();
}

/* =========================
   marker state
========================= */

function updateMarkerState() {

  markers.forEach(m => {

    const el = m.marker.getElement();
    const isActive = m.index === activeSiteIndex;

    m.marker.setOpacity(isActive ? 1 : 0.5);
    m.marker.setZIndexOffset(isActive ? 1000 : 0);

    if (el) {
      el.classList.toggle('active-marker', isActive);
    }

  });
}

/* =========================
   UI
========================= */

const ui = document.createElement('div');
ui.className = 'archive-ui';
document.body.appendChild(ui);

function createLink(label, site, index) {
  const el = document.createElement('div');
  el.className = 'archive-link';
  el.innerText = label;
  el.onclick = () => flyToSite(site, index);
  ui.appendChild(el);
}

createLink("廢墟園林 · 其一 | 沉墟死水心臟", sites[1], 1);
createLink("廢墟園林 · 其二 | 焦土以太鐵塔", sites[0], 0);

/* =========================
   HUD
========================= */

map.on('mousemove', e => {

  const geo = svgToGeo(e.latlng.lat, e.latlng.lng);

  document.getElementById('coords').innerText =
    `λ ${formatLat(geo.lat)}   φ ${formatLng(geo.lng)}`;
});