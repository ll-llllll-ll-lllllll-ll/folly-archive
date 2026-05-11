const TILE_SIZE = 2000;

const MAP_WIDTH = 4000;
const MAP_HEIGHT = 3000;

/* map */

const map = L.map('map', {

  crs: L.CRS.Simple,

  minZoom: -2,
  maxZoom: 2,

  zoomControl: false,

  inertia: true,

  worldCopyJump: false,

  fadeAnimation: false,

  zoomAnimation: false

});

/* infinite tile layer */

const RuinTiles = L.GridLayer.extend({

  createTile: function(coords) {

    const tile = document.createElement('img');

    const x =
      ((coords.x % 2) + 2) % 2;

    const y =
      ((coords.y % 2) + 2) % 2;

    tile.src = `tiles/${y}_${x}.svg`;

    tile.style.width = '100%';
    tile.style.height = '100%';

    tile.style.objectFit = 'cover';

    tile.style.filter =

      'contrast(1.15) brightness(1.01)';

    tile.draggable = false;

    return tile;
  }

});

/* add layer */

new RuinTiles({

  tileSize: TILE_SIZE,

  noWrap: false,

  bounds: null,

  updateWhenIdle: false,

  keepBuffer: 8

}).addTo(map);

/* initial */

map.setView(
  [MAP_HEIGHT / 2, MAP_WIDTH / 2],
  -1
);

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

/* coordinates */

map.on('mousemove', e => {

  const x =

    Math.floor(

      ((e.latlng.lng % MAP_WIDTH)

      + MAP_WIDTH)

      % MAP_WIDTH

    );

  const y =

    Math.floor(

      ((e.latlng.lat % MAP_HEIGHT)

      + MAP_HEIGHT)

      % MAP_HEIGHT

    );

  document
    .getElementById('coords')
    .innerText =

      `X:${x} Y:${y}`;

});