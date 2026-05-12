const width = 4000;
const height = 3000;

/* map */

const map = L.map('map', {

  crs: L.CRS.Simple,

  minZoom: -2,
  maxZoom: 3,

  zoomControl: false,

  inertia: true

});

/* bounds */

const bounds = [
  [0, 0],
  [height, width]
];

/* overlay */

const overlay = L.imageOverlay(
  'assets/ruin-map.svg',
  bounds
).addTo(map);

/* archive filter */

overlay.on('load', () => {

  const el = overlay.getElement();

  if (!el) return;

  el.style.filter =
    'blur(0.65px) contrast(1.8) brightness(1.02) sepia(0.25)';

});

/* init */

map.fitBounds(bounds);
map.setMaxBounds(null);

/* -----------------------------
   GEO → SVG 投影（关键修复）
------------------------------*/

function geoToSVG(lat, lng) {

  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;

  return [y, x];

}

/* -----------------------------
   MARKERS（已修复）
------------------------------*/

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

sites.forEach(site => {

  const pos = geoToSVG(site.lat, site.lng);

  const marker = L.circleMarker(

    pos,

    {

      radius: 3,

      color: '#111',

      weight: 1,

      fillColor: '#111',

      fillOpacity: 1

    }

  ).addTo(map);

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

    marker.setStyle({ radius: 5 });

    marker.openPopup();

  });

  marker.on('mouseout', () => {

    marker.setStyle({ radius: 3 });

    marker.closePopup();

  });

});

/* -----------------------------
   HUD（λ / φ + DMS）
------------------------------*/

function wrapLatLng(lat, lng) {

  lng = ((lng % width) + width) % width;
  lat = Math.max(0, Math.min(height, lat));

  return [lat, lng];

}

function toLatitude(y) {
  return 90 - (y / height) * 180;
}

function toLongitude(x) {
  return (x / width) * 360 - 180;
}

/* DMS */

function toDMS(v) {

  const a = Math.abs(v);

  const d = Math.floor(a);
  const mF = (a - d) * 60;
  const m = Math.floor(mF);
  const s = Math.floor((mF - m) * 60);

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

/* mouse HUD */

map.on('mousemove', e => {

  const w = wrapLatLng(e.latlng.lat, e.latlng.lng);

  const lat = toLatitude(w[0]);
  const lng = toLongitude(w[1]);

  document.getElementById('coords').innerText =
    `λ ${formatLat(lat)}   φ ${formatLng(lng)}`;

});