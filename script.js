const map = L.map('map', {

  crs: L.CRS.Simple,

  minZoom: -2,
  maxZoom: 3,

  zoomControl: false
});

const width = 4000;
const height = 3000;

const bounds = [
  [0,0],
  [height,width]
];

/* svg overlay */

const overlay = L.imageOverlay(
  'assets/ruin-map.svg',
  bounds
).addTo(map);

map.fitBounds(bounds);

/* ruins */

fetch('data/ruins.json')

.then(res => res.json())

.then(data => {

  data.forEach(site => {

    const marker =
      L.circleMarker(
        [site.y, site.x],
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

    /* hover */

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

/* coordinate system */

map.on('mousemove', e => {

  const x =
    Math.floor(e.latlng.lng);

  const y =
    Math.floor(e.latlng.lat);

  document
    .getElementById('coords')
    .innerText =
      `X:${x} Y:${y}`;

});

/* drift */

let drift = 0;

setInterval(() => {

  drift += 0.01;

  map.panBy([
    Math.sin(drift) * 0.15,
    Math.cos(drift * 0.8) * 0.15
  ], {
    animate: false
  });

}, 60);

/* mode buttons */

const buttons =
  document.querySelectorAll('button');

buttons.forEach(btn => {

  btn.addEventListener(
    'click',
    () => {

      const mode =
        btn.dataset.mode;

      document.body.dataset.mode =
        mode;

      switch(mode) {

        case 'normal':

          overlay.getElement().style.filter =
            'none';

        break;

        case 'seismic':

          overlay.getElement().style.filter =
            'contrast(1.4) brightness(1.1)';

        break;

        case 'radiation':

          overlay.getElement().style.filter =
            'blur(1px) contrast(1.8)';

        break;

        case 'archive':

          overlay.getElement().style.filter =
            'sepia(0.4) contrast(1.2)';

        break;

      }

    }
  );

});

/* underground reveal */

map.on('zoomend', () => {

  const zoom =
    map.getZoom();

  const svg =
    overlay.getElement();

  if (!svg) return;

  const underground =
    svg.contentDocument?.getElementById(
      'underground-layer'
    );

  if (!underground) return;

  if (zoom > 1) {

    underground.style.opacity = 1;

  } else {

    underground.style.opacity = 0;

  }

});