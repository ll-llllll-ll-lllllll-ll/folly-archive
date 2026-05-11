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

/* single overlay */

const overlay = L.imageOverlay(
  'assets/ruin-map.svg',
  bounds
).addTo(map);

/* wait for load */

overlay.on('load', () => {

  const el = overlay.getElement();

  if (!el) return;

  el.style.filter =

    'blur(0.65px) contrast(1.8) brightness(1.02) sepia(0.25)';

});

/* initial */

map.fitBounds(bounds);

/* prevent hard bounds */

map.setMaxBounds(null);

/* wraparound */

function wrapLatLng(lat, lng) {

  lng =
    ((lng % width) + width) % width;

  lat =
    ((lat % height) + height) % height;

  return [lat, lng];

}

/* infinite dragging */

map.on('drag', () => {

  const center = map.getCenter();

  const wrapped =
    wrapLatLng(
      center.lat,
      center.lng
    );

  map.panTo(
    wrapped,
    {
      animate: false
    }
  );

});

/* markers */

fetch('data/ruins.json')

.then(res => res.json())

.then(data => {

  data.forEach(site => {

    const marker =

      L.circleMarker(

        [site.y, site.x],

        {

          radius: 2.5,

          color: '#111',

          weight: 1,

          fillColor: '#111',

          fillOpacity: 1

        }

      ).addTo(map);

    /* archival popup */

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

    /* hover */

    marker.on(
      'mouseover',
      () => {

        marker.setStyle({

          radius: 4

        });

        marker.openPopup();

      }
    );

    marker.on(
      'mouseout',
      () => {

        marker.setStyle({

          radius: 2.5

        });

        marker.closePopup();

      }
    );

  });

});

/* geographic conversion */

function toLatitude(y) {

  return 90 - (y / height) * 180;

}

function toLongitude(x) {

  return (x / width) * 360 - 180;

}

/* decimal → DMS */

function toDMS(value) {

  const abs = Math.abs(value);

  const degrees =
    Math.floor(abs);

  const minutesFloat =
    (abs - degrees) * 60;

  const minutes =
    Math.floor(minutesFloat);

  const seconds =
    Math.floor(
      (minutesFloat - minutes) * 60
    );

  return {

    degrees,
    minutes,
    seconds

  };

}

function formatLatitude(lat) {

  const dir =
    lat >= 0 ? 'N' : 'S';

  const dms =
    toDMS(lat);

  return `${dms.degrees}°${dms.minutes}'${dms.seconds}"${dir}`;

}

function formatLongitude(lng) {

  const dir =
    lng >= 0 ? 'E' : 'W';

  const dms =
    toDMS(lng);

  return `${dms.degrees}°${dms.minutes}'${dms.seconds}"${dir}`;

}

/* coordinates HUD */

map.on('mousemove', e => {

  const wrapped =
    wrapLatLng(
      e.latlng.lat,
      e.latlng.lng
    );

  const lat =
    toLatitude(wrapped[0]);

  const lng =
    toLongitude(wrapped[1]);

  document
    .getElementById('coords')
    .innerText =

      `LAT ${formatLatitude(lat)}   LON ${formatLongitude(lng)}`;

});