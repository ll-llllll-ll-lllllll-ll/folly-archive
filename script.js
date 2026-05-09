const siteLayer = document.getElementById("site-layer");
===================== */

function openArchive(site) {

  archiveId.innerText = site.id;

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

traceButton.addEventListener("click", () => {

  const value = traceInput.value.trim();

  if (!value) return;

  const text = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );

  const x = Math.random() * 1200 + 150;
  const y = Math.random() * 600 + 120;

  text.setAttribute("x", x);
  text.setAttribute("y", y);

  text.setAttribute("class", "trace-mark");

  text.textContent = value;

  traceLayer.appendChild(text);

  traceInput.value = "";

});