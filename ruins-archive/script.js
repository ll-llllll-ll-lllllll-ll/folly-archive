const map = document.getElementById("world-map");

const siteLayer = document.getElementById("site-layer");

const archiveWindow = document.getElementById("archive-window");
const archiveContent = document.getElementById("archive-content");
const archiveId = document.getElementById("archive-id");
const closeButton = document.getElementById("archive-close");

const traceLayer = document.getElementById("trace-layer");
const traceButton = document.getElementById("trace-button");
const traceInput = document.getElementById("trace-input");

/* =====================
   CREATE SITE NODES
===================== */

sites.forEach(site => {

  const group = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );

  const cross1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );

  cross1.setAttribute("x1", site.x - 8);
  cross1.setAttribute("x2", site.x + 8);
  cross1.setAttribute("y1", site.y);
  cross1.setAttribute("y2", site.y);

  cross1.setAttribute("class", "site-cross");

  const cross2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );

  cross2.setAttribute("x1", site.x);
  cross2.setAttribute("x2", site.x);
  cross2.setAttribute("y1", site.y - 8);
  cross2.setAttribute("y2", site.y + 8);

  cross2.setAttribute("class", "site-cross");

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  circle.setAttribute("cx", site.x);
  circle.setAttribute("cy", site.y);
  circle.setAttribute("r", 2.2);

  circle.setAttribute("class", "site-node");

  if (site.unstable) {
    circle.classList.add("unstable-site");
  }

  circle.addEventListener("click", () => {
    openArchive(site);
  });

  group.appendChild(cross1);
  group.appendChild(cross2);
  group.appendChild(circle);

  siteLayer.appendChild(group);

});

/* =====================
   OPEN ARCHIVE
===================== */

function openArchive(site) {

  archiveId.innerText = site.id;

  if (site.corrupted) {

    archiveContent.innerHTML = `

      <div class="archive-description">
        ARCHIVE CORRUPTED
        <br><br>
        SIGNAL LOST
        <br><br>
        DATA UNRECOVERABLE
      </div>

    `;

    archiveWindow.classList.add("active");

    return;
  }

  archiveContent.innerHTML = `

    <div class="archive-line">
      STATUS : ${site.status}
    </div>

    <div class="archive-line">
      REGION : ${site.region}
    </div>

    <div class="archive-line">
      LAST SIGNAL : ${site.year}
    </div>

    <div class="archive-line">
      TYPE : ${site.type}
    </div>

    <img class="archive-image"
         src="${site.image}">

    <div class="archive-description">
      ${site.description}
    </div>

  `;

  archiveWindow.classList.add("active");
}

/* =====================
   CLOSE WINDOW
===================== */

closeButton.addEventListener("click", () => {
  archiveWindow.classList.remove("active");
});

/* =====================
   TRACE SYSTEM
===================== */

const savedTraces = JSON.parse(
  localStorage.getItem("ruins-traces")
) || [];

savedTraces.forEach(createTrace);

traceButton.addEventListener("click", () => {

  const value = traceInput.value.trim();

  if (!value) return;

  const trace = {
    text: value,
    x: Math.random() * 1200 + 150,
    y: Math.random() * 600 + 120
  };

  savedTraces.push(trace);

  localStorage.setItem(
    "ruins-traces",
    JSON.stringify(savedTraces)
  );

  createTrace(trace);

  traceInput.value = "";

});

function createTrace(trace) {

  const text = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );

  text.setAttribute("x", trace.x);
  text.setAttribute("y", trace.y);

  text.setAttribute("class", "trace-mark");

  text.textContent = trace.text;

  traceLayer.appendChild(text);
}

/* =====================
   MAP ZOOM
===================== */

let scale = 1;

map.addEventListener("wheel", (e) => {

  e.preventDefault();

  scale += e.deltaY * -0.001;

  scale = Math.min(Math.max(0.8, scale), 3);

  map.style.transform = `scale(${scale})`;

});

/* =====================
   GLITCH
===================== */

setInterval(() => {

  if (Math.random() > 0.94) {

    document.body.classList.add("glitch");

    setTimeout(() => {
      document.body.classList.remove("glitch");
    }, 120);

  }

}, 3000);

/* =====================
   MAP CORRUPTION
===================== */

setInterval(() => {

  if (Math.random() > 0.95) {

    map.classList.add("corruption");

    setTimeout(() => {
      map.classList.remove("corruption");
    }, 4000);

  }

}, 8000);

/* =====================
   UNSTABLE SITES
===================== */

setInterval(() => {

  const unstableNodes = document.querySelectorAll(".unstable-site");

  unstableNodes.forEach(node => {

    if (Math.random() > 0.96) {

      node.style.opacity = "0";

      setTimeout(() => {
        node.style.opacity = "1";
      }, 2000);

    }

  });

}, 4000);
