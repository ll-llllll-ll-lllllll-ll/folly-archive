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

/* repeated maps */

const overlays = [];

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

/* create overlays */

positions.forEach(pos => {

  const overlay = L.imageOverlay(

    'assets/ruin-map.svg',

    [
      [pos[0], pos[1]],
      [pos[0] + height, pos[1] + width]
    ]

  ).addTo(map);

  /* IMPORTANT:
     wait until image loads
  */

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

/* infinite wraparound */

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

/* markers */

fetch('data/ruins.json')

.then(res => res.json())

.then(data => {

  positions.forEach(offset => {

    data.forEach(site => {

      const marker =

        L.circleMarker(

          [
            site.y + offset[0],
            site.x + offset[1]
          ],

          {
            radius: 5,
            color: '#111',
            weight: 1,
            fillOpacity: 1
          }

        );

      marker.addTo(map);

      marker.bindPopup(`

        <b>${site.name}</b>

        <br><br>

        ${site.desc}

      `);

      marker.on(
        'mouseover',
        () => {

          marker.setStyle({
            radius: 8
          });

        }
      );

      marker.on(
        'mouseout',
        () => {

          marker.setStyle({
            radius: 5
          });

        }
      );

    });

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