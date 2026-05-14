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
   drawer system
========================= */

const drawer = document.getElementById('archive-drawer');
const mask = document.getElementById('drawer-mask');

function openDrawer(site) {

  const el = document.getElementById('drawer-content');

  el.innerHTML = `

    <div class="drawer-body">

      <div>
        <b>${site.name}</b>
      </div>

      <br/>

      <div>
        ${site.desc}
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

  return [
    y * height,
    x * width
  ];

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

  const lng = x * 360 - 180;
  const lat = 90 - y * 180;

  return {
    lat,
    lng
  };

}

/* =========================
   format
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

  const d = toDMS(lat);

  return `${d.d}°${d.m}'${d.s}"${lat >= 0 ? 'n' : 's'}`;

}

function formatLng(lng) {

  const d = toDMS(lng);

  return `${d.d}°${d.m}'${d.s}"${lng >= 0 ? 'e' : 'w'}`;

}

/* =========================
   sites
========================= */

const sites = [

  {
    name: "电台路焦土",
    desc: "玻璃金属制品厂遗址",
    lat: 31.225833,
    lng: 121.618333,
    archiveDate: "2026.01"
  },

  {
    name: "瘟猪坝沉墟",
    desc: "溶洞与旧地基遗址",
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

  const pos = geoToSVG(
    site.lat,
    site.lng
  );

  const marker = L.marker(pos, {

    icon: createIcon()

  }).addTo(map);

  marker.bindPopup(`

    <div class="archive-popup">

      <div class="archive-line"></div>

      <div class="archive-content">

        <div class="archive-name">
          ${site.name}
        </div>

        <div class="archive-coords">

          λ ${formatLat(site.lat)}

          &nbsp;&nbsp;

          φ ${formatLng(site.lng)}

        </div>

        <div class="archive-date">
          ${site.archiveDate}
        </div>

        <div
          class="archive-drawer-link"
          onclick='openDrawer(${JSON.stringify(site)})'
        >
          荒构录
        </div>

      </div>

    </div>

  `, {

    closeButton: false,
    autoClose: false,
    className: 'map-archive-popup',
    offset: [26, -26]

  });

  marker.on('mouseover', () => {

    marker.openPopup();

  });

  marker.on('mouseout', () => {

    if (activeSiteIndex !== index) {

      marker.closePopup();

    }

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

  const pos = geoToSVG(
    site.lat,
    site.lng
  );

  markers.forEach(m => {

    m.marker.closePopup();

  });

  map.flyTo(pos, 2, {

    duration: 2.5,
    easeLinearity: 0.2

  });

  map.once('moveend', () => {

    markers[index]
      .marker
      .openPopup();

  });

  updateUIState();

}

/* =========================
   ui
========================= */

const ui = document.createElement('div');

ui.className = 'archive-ui';

document.body.appendChild(ui);

/* =========================
   links
========================= */

function createLink(label, site, index) {

  const el = document.createElement('div');

  el.className = 'archive-link';

  el.innerText = label;

  el.onclick = () => {

    flyToSite(site, index);

  };

  ui.appendChild(el);

}

createLink(
  "废墟园林 · 其一 | 沉墟死水心脏",
  sites[1],
  1
);

createLink(
  "废墟园林 · 其二 | 焦土以太铁塔",
  sites[0],
  0
);



/* =========================
   state ui
========================= */

function updateUIState() {

  [...ui.children].forEach((el, i) => {

    el.style.opacity =
      (i === activeSiteIndex)
      ? '1'
      : '0.6';

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

    if (m.index === activeSiteIndex) {

      m.marker.setOpacity(1);

      m.marker.setZIndexOffset(1000);

      el?.classList.add(
        'active-marker'
      );

    } else {

      m.marker.setOpacity(0.5);

      m.marker.setZIndexOffset(0);

      el?.classList.remove(
        'active-marker'
      );

    }

  });

}

/* =========================
   coord hud
========================= */

map.on('mousemove', e => {

  const geo = svgToGeo(
    e.latlng.lat,
    e.latlng.lng
  );

  document.getElementById(
    'coords'
  ).innerText =

    `λ ${formatLat(geo.lat)}   φ ${formatLng(geo.lng)}`;

});