const width = 4000;
const height = 3000;

/* map */

const map = L.map('map', {

  crs: L.CRS.Simple,

  minZoom: -2,
  maxZoom: 3,

  zoomControl: false,

  inertia: true,
  worldCopyJump: false

});

/* bounds */

const bounds = [
  [0, 0],
  [height, width]
];

/* repeating positions */

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

const overlays = [];

positions.forEach(pos => {

  const overlay = L.imageOverlay(

    'assets/ruin-map.svg',

    [
      [pos[0], pos[1]],
      [pos[0] + height, pos[1] + width]
    ]

  ).addTo(map);

  /* wait until loaded */

  overlay.on('load', () => {

    const el = overlay.getElement();

    if (!el) return;

    el.style.filter =

      'blur(1px) contrast(1.8) brightness(1.02) sepia(0.25)';

  });

  overlays.push(overlay);

});

/* initial view */

map.fitBounds(bounds);

/* infinite wrap */

map.on('moveend', () => {

  const center = map.getCenter();

  let lat = center.lat;
  let lng = center.lng;

  if (lng < 0) {
    lng += width;
  }

  if (lng > width) {
    lng -= width;
  }

  if (lat < 0) {
    lat += height;
  }

  if (lat > height) {
    lat -= height;
  }

  map.panTo(
    [lat, lng],
    {
      animate: false
    }
  );

});

/* synchronized ruin markers */

fetch('data/ruins.json')

.then(res => res.json())

.then(data => {

  data.forEach(site => {

    /* one logical ruin */

    const ruinGroup = L.layerGroup();

    positions.forEach(offset => {

      const marker =

        L.circleMarker(

          [
            site.y + offset[0],
            site.x + offset[1]
          ],

          {

            radius: 6,

            color: '#111',

            weight: 1,

            fillColor: '#111',

            fillOpacity: 1

          }

        );

      /* popup */

      marker.bindPopup(`

        <b>${site.name}</b>

        <br><br>

        ${site.desc}

      `);

      /* synchronized hover */

      marker.on(
        'mouseover',
        () => {

          ruinGroup.eachLayer(layer => {

            layer.setStyle({
              radius: 10
            });

          });

        }
      );

      marker.on(
        'mouseout',
        () => {

          ruinGroup.eachLayer(layer => {

            layer.setStyle({
              radius: 6
            });

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