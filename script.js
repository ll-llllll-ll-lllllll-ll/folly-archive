
const width = 4000;
const height = 3000;

/* =========================
   🌍 WORLD SHAPE PARAMS
========================= */

const geoScale = 4.2;
const worldScale = 1.0;
const offsetX = -1.23;
const offsetY = 0.74;

/* =========================
   MAP INIT
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

/* archive filter */

overlay.on('load', () => {

  const el = overlay.getElement();

  if (!el) return;

  el.style.filter =
    'blur(0.45px) contrast(1.8) brightness(1.02) sepia(0.25)';

});

map.fitBounds(bounds);
map.setMaxBounds(null);

/* =========================
   STATE
========================= */

let activeSiteIndex = null;

const markers = [];

/* =========================
   🌍 GEO → SVG
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

  return [
    y * height,
    x * width
  ];

}

/* =========================
   🌍 SVG → GEO（修正HUD）
========================= */

function svgToGeo(y, x) {

  /* normalize */

  x = x / width;
  y = y / height;

  /* remove offset */

  x -= offsetX;
  y -= offsetY;

  /* remove worldScale */

  x = (x - 0.5) / worldScale + 0.5;
  y = (y - 0.5) / worldScale + 0.5;

  /* remove geoScale */

  x = (x - 0.5) / geoScale + 0.5;
  y = (y - 0.5) / geoScale + 0.5;

  /* back to geo */

  const lng = x * 360 - 180;
  const lat = 90 - y * 180;

  return {
    lat,
    lng
  };

}

/* =========================
   SITES
========================= */

const sites = [

  {
    name: "电台路焦土",
    desc: "废墟档案记录：城市结构崩塌后的残余地带",
    lat: 31.225833,
    lng: 121.618333
  },

  {
    name: "瘟猪坝沉墟",
    desc: "沉降地貌区，长期无人维护的农业废弃带",
    lat: 30.454417,
    lng: 104.047667
  }

];

/* =========================
   MARKER ICON
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
   MARKERS
========================= */

sites.forEach((site, index) => {

  const pos = geoToSVG(site.lat, site.lng);

  const marker = L.marker(pos, {

    icon: createIcon()

  }).addTo(map);

  marker.bindPopup(`

    <div class="ruin-popup">

      <div class="popup-title">
        ${site.name}
      </div>

      <div class="popup-line"></div>

      <div class="popup-desc">
        ${site.desc}
      </div>

    </div>

  `, {

    closeButton: false,
    autoClose: false,

    className: 'custom-popup'

  });

  marker.on('mouseover', () => {

    marker.openPopup();

  });

  marker.on('mouseout', () => {

    marker.closePopup();

  });

  markers.push({
    site,
    marker,
    index
  });

});

/* =========================
   FLY SYSTEM
========================= */

function flyToSite(site, index) {

  activeSiteIndex = index;

  const pos = geoToSVG(site.lat, site.lng);

  map.flyTo(pos, 2, {

    duration: 2.5,
    easeLinearity: 0.2

  });

  updateUIState();

}

/* =========================
   UI
========================= */

const ui = document.createElement('div');

ui.className = 'archive-ui';

document.body.appendChild(ui);

/* =========================
   LINK STYLE
========================= */

function createLink(label, site, index) {

  const el = document.createElement('div');

  el.className = 'archive-link';

  el.innerText = label;

  el.onclick = () => flyToSite(site, index);

  ui.appendChild(el);

}

/* labels */

createLink("<aether scorched-earth>", sites[0], 0);

createLink("<effluent sedimentation>", sites[1], 1);

/* =========================
   UI STATE
========================= */

function updateUIState() {

  const items = ui.children;

  for (let i = 0; i < items.length; i++) {

    const el = items[i];

    if (i === activeSiteIndex) {

      el.style.opacity = '1';

    } else {

      el.style.opacity = '0.6';

    }

  }

  updateMarkerState();

}

/* =========================
   MARKER STATE
========================= */

function updateMarkerState() {

  markers.forEach(m => {

    if (m.index === activeSiteIndex) {

      m.marker.setOpacity(1);
      m.marker.setZIndexOffset(1000);

    } else {

      m.marker.setOpacity(0.5);
      m.marker.setZIndexOffset(0);

    }

  });

}

/* =========================
   DMS FORMAT
========================= */

function toDMS(v) {

  const a = Math.abs(v);

  const d = Math.floor(a);

  const mF = (a - d) * 60;
  const m = Math.floor(mF);

  const s = Math.floor(
    (mF - m) * 60
  );

  return { d, m, s };

}

function formatLat(lat) {

  const dir = lat >= 0 ? 'N' : 'S';

  const d = toDMS(lat);

  return `${d.d}°${d.m}'${d.s}"${dir}`;

}

function formatLng(lng) {

  const dir = lng >= 0 ? 'E' : 'W';

  const d = toDMS(lng);

  return `${d.d}°${d.m}'${d.s}"${dir}`;

}

/* =========================
   COORD HUD（真实坐标）
========================= */

map.on('mousemove', e => {

  const geo = svgToGeo(

    e.latlng.lat,
    e.latlng.lng

  );

  document.getElementById('coords').innerText =

    `λ ${formatLat(geo.lat)}   φ ${formatLng(geo.lng)}`;

});

/* =========================
   MARKER STATE
========================= */

function updateMarkerState() {

  markers.forEach(m => {

    const el = m.marker.getElement();

    if (m.index === activeSiteIndex) {

      m.marker.setOpacity(1);

      m.marker.setZIndexOffset(1000);

      el?.classList.add('active-marker');

    } else {

      m.marker.setOpacity(0.5);

      m.marker.setZIndexOffset(0);

      el?.classList.remove('active-marker');

    }

  });

}