const width = 4000;
const height = 3000;

/* map */

const map = L.map('map', {

  crs: L.CRS.Simple,

  minZoom: -2,
  maxZoom: 3,

  zoomControl: false,

  inertia: true,

  worldCopyJump: false,

  fadeAnimation: false,

  zoomAnimation: false

});

/* bounds */

const bounds = [
  [0, 0],
  [height, width]
];

/* repeated map positions */

const positions = [

  [-height, -width],
  [-height, 0],
  [-height, width],

  [0, -width],
  [0, 0],
  [0, width],

  [height, -width],
  [height, 0],
  [height, width]

];

/* overlays */

positions.forEach(pos => {

  const overlay = L.imageOverlay(

    'assets/ruin-map.svg',

    [
      [pos[0], pos[1]],
      [pos[0] + height, pos[1] + width]
    ]

  ).addTo(map);

  overlay.on('load', () => {

    const el = overlay.getElement();

    if (!el) return;

    el.style.filter =

      'contrast(1.15) brightness(1.01)';

  });

});

/* initial view */

map.fitBounds(bounds);

/* infinite movement */

map.on('moveend', () => {

  const center = map.getCenter();

  let lat = center.lat;
  let lng = center.lng;

  if (lng < 0) lng += width;
  if (lng > width) lng -= width;

  if (lat < 0) lat += height;
  if (lat > height) lat -= height;

  map.panTo(
    [lat, lng],
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

    const ruinGroup = L.layerGroup();

    positions.forEach(offset => {

      const marker =

        L.circleMarker(

          [
            site.y + offset[0],
            site.x + offset[1]
          ],

          {

            radius: 2.5,

            color: '#111',

            weight: 1,

            fillColor: '#111',

            fillOpacity: 1

          }

        );

      /* popup */

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

      /* hover sync */

      marker.on(
        'mouseover',
        () => {

          ruinGroup.eachLayer(layer => {

            layer.setStyle({
              radius: 4
            });

            layer.openPopup();

          });

        }
      );

      marker.on(
        'mouseout',
        () => {

          ruinGroup.eachLayer(layer => {

            layer.setStyle({
              radius: 2.5
            });

            layer.closePopup();

          });

        }
      );

      ruinGroup.addLayer(marker);

    });

    ruinGroup.addTo(map);

  });

});

/* coordinates */

map.on('mousemove', e => {

  let x =
    Math.floor(e.latlng.lng);

  let y =
    Math.floor(e.latlng.lat);

  x =
    ((x % width) + width) % width;

  y =
    ((y % height) + height) % height;

  document
    .getElementById('coords')
    .innerText =

      `X:${x} Y:${y}`;

});