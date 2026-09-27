from pathlib import Path

# v106: add calm header void, strengthen database title and file labels,
# adapt the front document to asset proportions, and replace source links with zoom viewing.

# --- mechanics.css ---------------------------------------------------------
css = Path('mechanics.css')
s = css.read_text(encoding='utf-8')
marker = '/* v106 · archive viewport / adaptive sheet / zoom viewer */'
if marker not in s:
    s += r'''


/* v106 · archive viewport / adaptive sheet / zoom viewer */
@media(min-width:801px){
  /* Reserve one quiet register-height field above the left finding aid. */
  html body .mechanics-shell > .project-index{
    padding-top:164px !important
  }
}

/* The database name is the page title: full ink, slightly more weight. */
html body .engineering-index .engineering-title,
html body .engineering-index .engineering-title > [data-i18n="engineeringDatabase"]{
  color:var(--reader-text) !important;
  opacity:1 !important;
  font-weight:400 !important
}

/* Keep the physical files translucent without fading their filenames with them. */
body.has-file-extraction-tray .file-tray-rack .file-tray-item{
  opacity:1 !important
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item::before,
body.has-file-extraction-tray .file-tray-rack .file-tray-item::after{
  opacity:.27;
  transition:opacity 220ms ease,background 220ms ease
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-near::before,
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-near::after{
  opacity:.50
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active::before,
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active::after{
  opacity:1
}
body.has-file-extraction-tray .file-tray-rack .file-tray-name{
  color:rgba(23,23,23,.70) !important;
  opacity:1 !important;
  font-weight:400 !important;
  text-shadow:0 0 .01px currentColor
}
body.has-file-extraction-tray .file-tray-rack .file-tray-item.is-active .file-tray-name{
  color:var(--reader-text) !important
}

/* Front sheets read their dimensions from JS after the asset ratio is known. */
body.has-file-extraction-tray .archive-stage .sheet-stack.is-selected .archive-sheet.is-front{
  width:var(--adaptive-sheet-w,min(78%,850px)) !important;
  height:var(--adaptive-sheet-h,min(64%,625px)) !important;
  min-height:0 !important;
  right:var(--adaptive-sheet-right,30px) !important;
  bottom:var(--adaptive-sheet-bottom,174px) !important;
  transition:width 260ms cubic-bezier(.22,.72,.18,1),height 260ms cubic-bezier(.22,.72,.18,1),right 260ms cubic-bezier(.22,.72,.18,1),bottom 260ms cubic-bezier(.22,.72,.18,1)
}
body.has-file-extraction-tray .archive-stage .sheet-stack.is-selected .archive-sheet.is-front .sheet-asset-host > img{
  object-fit:contain !important
}

.sheet-open-source{
  appearance:none;
  border:0;
  border-bottom:1px solid var(--reader-line-strong);
  background:none;
  padding:0 0 2px;
  color:var(--reader-muted);
  font:inherit;
  font-size:9px;
  cursor:zoom-in
}
.sheet-open-source:hover{color:var(--reader-text);border-bottom-color:var(--reader-text)}

.mechanics-zoom-viewer{
  position:fixed;
  z-index:1000;
  inset:0;
  display:grid;
  grid-template-rows:auto minmax(0,1fr);
  padding:18px;
  background:rgba(242,242,237,.965);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:opacity 180ms ease,visibility 180ms step-end
}
.mechanics-zoom-viewer.is-open{
  opacity:1;
  visibility:visible;
  pointer-events:auto;
  transition:opacity 180ms ease
}
.mechanics-zoom-toolbar{
  min-height:34px;
  display:flex;
  justify-content:flex-end;
  align-items:flex-start
}
.mechanics-zoom-close{
  appearance:none;
  border:0;
  border-bottom:1px solid var(--reader-line-strong);
  background:none;
  padding:2px 0 3px;
  color:var(--reader-text);
  font:300 10px/1.2 "IBM Plex Mono",monospace;
  cursor:zoom-out
}
.mechanics-zoom-content{
  position:relative;
  min-width:0;
  min-height:0;
  display:grid;
  place-items:center;
  overflow:auto;
  border:1px solid var(--reader-line)
}
.mechanics-zoom-content > img{
  display:block;
  max-width:calc(100vw - 72px);
  max-height:calc(100vh - 90px);
  width:auto;
  height:auto;
  object-fit:contain;
  filter:grayscale(1) invert(var(--reader-drawing-invert)) brightness(var(--reader-drawing-brightness)) contrast(var(--reader-drawing-contrast))
}
.mechanics-zoom-content > iframe{
  width:100%;
  height:100%;
  border:0;
  background:var(--reader-paper)
}
.mechanics-zoom-content .sheet-text-view{
  width:min(920px,92vw);
  height:auto;
  max-height:calc(100vh - 110px);
  border:1px solid var(--reader-line)
}
body.mechanics-zoom-open{overflow:hidden !important}

@media(max-width:800px){
  .mechanics-zoom-viewer{padding:10px}
  .mechanics-zoom-content > img{max-width:calc(100vw - 28px);max-height:calc(100vh - 72px)}
  body.has-file-extraction-tray .archive-stage .sheet-stack.is-selected .archive-sheet.is-front{
    right:var(--adaptive-sheet-right,18px) !important;
    bottom:var(--adaptive-sheet-bottom,150px) !important
  }
}
'''
    css.write_text(s, encoding='utf-8')

# --- mechanics.js ----------------------------------------------------------
js = Path('mechanics.js')
s = js.read_text(encoding='utf-8')

s = s.replace(
"    openSource:{zh:'打开原文件 ↗',en:'Open source ↗',ja:'原ファイルを開く ↗'},",
"    openSource:{zh:'放大浏览',en:'Enlarge view',ja:'拡大表示'},\n    closeZoom:{zh:'关闭 ×',en:'Close ×',ja:'閉じる ×'},"
)

anchor = "  function renderAsset(host, record) {\n"
if anchor not in s:
    raise SystemExit('mechanics.js: renderAsset anchor not found')
helpers = r'''  function resetAdaptiveSheet() {
    ['--adaptive-sheet-w','--adaptive-sheet-h','--adaptive-sheet-right','--adaptive-sheet-bottom'].forEach(name => {
      stack.style.removeProperty(name);
    });
    delete stack.dataset.assetRatio;
  }

  function fitAdaptiveSheet(ratio = 1.35) {
    if (!stack.classList.contains('is-selected')) return;
    const stageRect = stage.getBoundingClientRect();
    if (!stageRect.width || !stageRect.height) return;

    const compact = innerWidth <= 800;
    const tray = document.getElementById('file-extraction-tray');
    const trayHeight = tray?.getBoundingClientRect().height || (compact ? 138 : 154);
    const topGuard = compact ? 18 : Math.max(42, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 60);
    const footerHeight = compact ? 132 : 154;
    const frameInset = compact ? 24 : 32;
    const safeRatio = Math.max(.42, Math.min(2.8, Number(ratio) || 1.35));

    const availableW = Math.max(260, stageRect.width - (compact ? 28 : 72));
    const availableH = Math.max(330, stageRect.height - trayHeight - topGuard - 24);
    const maxVisualW = availableW - frameInset;
    const maxVisualH = Math.max(160, availableH - footerHeight - 18);

    let visualW = Math.min(maxVisualW, maxVisualH * safeRatio);
    let visualH = visualW / safeRatio;
    if (visualH > maxVisualH) {
      visualH = maxVisualH;
      visualW = visualH * safeRatio;
    }

    const minSheetW = compact ? Math.min(availableW, 286) : Math.min(availableW, 410);
    const sheetW = Math.max(minSheetW, Math.min(availableW, visualW + frameInset));
    const sheetH = Math.max(compact ? 310 : 350, Math.min(availableH, visualH + footerHeight + 18));
    const right = Math.max(compact ? 14 : 20, (stageRect.width - sheetW) / 2);
    const freeVertical = Math.max(0, stageRect.height - trayHeight - topGuard - sheetH);
    const bottom = trayHeight + Math.max(compact ? 12 : 18, freeVertical / 2);

    stack.style.setProperty('--adaptive-sheet-w', `${sheetW.toFixed(1)}px`);
    stack.style.setProperty('--adaptive-sheet-h', `${sheetH.toFixed(1)}px`);
    stack.style.setProperty('--adaptive-sheet-right', `${right.toFixed(1)}px`);
    stack.style.setProperty('--adaptive-sheet-bottom', `${bottom.toFixed(1)}px`);
    stack.dataset.assetRatio = String(safeRatio);
  }

  let zoomViewer = null;
  let zoomContent = null;
  function ensureZoomViewer() {
    if (zoomViewer?.isConnected) return zoomViewer;
    zoomViewer = document.createElement('div');
    zoomViewer.className = 'mechanics-zoom-viewer';
    zoomViewer.setAttribute('aria-hidden','true');
    zoomViewer.setAttribute('role','dialog');
    zoomViewer.setAttribute('aria-modal','true');

    const toolbar = document.createElement('div');
    toolbar.className = 'mechanics-zoom-toolbar';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'mechanics-zoom-close';
    close.textContent = UI.closeZoom[lang];
    close.addEventListener('click', closeZoomViewer);
    toolbar.appendChild(close);

    zoomContent = document.createElement('div');
    zoomContent.className = 'mechanics-zoom-content';
    zoomViewer.append(toolbar, zoomContent);
    zoomViewer.addEventListener('pointerdown', event => {
      if (event.target === zoomViewer || event.target === zoomContent) closeZoomViewer();
    });
    document.body.appendChild(zoomViewer);
    return zoomViewer;
  }

  function closeZoomViewer() {
    if (!zoomViewer) return;
    zoomViewer.classList.remove('is-open');
    zoomViewer.setAttribute('aria-hidden','true');
    document.body.classList.remove('mechanics-zoom-open');
  }

  function openZoomViewer(record) {
    const asset = record?.asset;
    if (!asset?.src) return;
    ensureZoomViewer();
    const close = zoomViewer.querySelector('.mechanics-zoom-close');
    if (close) close.textContent = UI.closeZoom[lang];
    zoomContent.replaceChildren();

    if (asset.type === 'pdf') {
      const frame = document.createElement('iframe');
      frame.title = local(record.title);
      frame.src = encodeURI(asset.src);
      zoomContent.appendChild(frame);
    } else if (asset.type === 'text') {
      const view = document.createElement('div');
      view.className = 'sheet-text-view';
      const pre = document.createElement('pre');
      pre.textContent = UI.loading[lang];
      view.appendChild(pre);
      zoomContent.appendChild(view);
      fetch(encodeURI(asset.src))
        .then(response => { if (!response.ok) throw Error(response.status); return response.text(); })
        .then(text => { if (pre.isConnected) pre.textContent = text; })
        .catch(() => { if (pre.isConnected) pre.textContent = UI.missing[lang]; });
    } else if (asset.type === 'heic') {
      const card = document.createElement('div');
      card.className = 'sheet-file-card';
      const strong = document.createElement('strong');
      strong.textContent = UI.heic[lang];
      const note = document.createElement('p');
      note.textContent = UI.heicHint[lang];
      card.append(strong,note);
      zoomContent.appendChild(card);
    } else {
      const img = new Image();
      img.alt = local(record.title);
      img.decoding = 'async';
      img.src = encodeURI(asset.src);
      zoomContent.appendChild(img);
    }

    zoomViewer.classList.add('is-open');
    zoomViewer.setAttribute('aria-hidden','false');
    document.body.classList.add('mechanics-zoom-open');
    close?.focus({preventScroll:true});
  }

'''
s = s.replace(anchor, helpers + anchor, 1)

s = s.replace(
"    if (!asset?.src) return fileCard(host, record, UI.missing[lang]);\n    if (asset.type === 'heic') return fileCard(host, record, UI.heic[lang], UI.heicHint[lang]);",
"    if (!asset?.src) { fitAdaptiveSheet(1.28); return fileCard(host, record, UI.missing[lang]); }\n    if (asset.type === 'heic') { fitAdaptiveSheet(.78); return fileCard(host, record, UI.heic[lang], UI.heicHint[lang]); }"
)
s = s.replace(
"      host.replaceChildren(frame);\n      return;",
"      host.replaceChildren(frame);\n      fitAdaptiveSheet(.72);\n      return;",
1
)
s = s.replace(
"          host.replaceChildren(view);",
"          host.replaceChildren(view);\n          fitAdaptiveSheet(.82);",
1
)
s = s.replace(
"    img.addEventListener('load', () => {\n      if (host.isConnected) host.replaceChildren(img);\n    }, {once:true});",
"    img.addEventListener('load', () => {\n      if (!host.isConnected) return;\n      host.replaceChildren(img);\n      fitAdaptiveSheet(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.35);\n    }, {once:true});"
)

old_link = r'''    const link = document.createElement('a');
    link.className = 'sheet-open-source';
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = UI.openSource[lang];
    if (record.asset?.src) link.href = encodeURI(record.asset.src);
    else link.hidden = true;

    side.append(route, link);'''
new_link = r'''    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'sheet-open-source';
    link.textContent = UI.openSource[lang];
    link.hidden = !record.asset?.src;
    link.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openZoomViewer(record);
    });

    side.append(route, link);'''
if old_link not in s:
    raise SystemExit('mechanics.js: source link block not found')
s = s.replace(old_link, new_link, 1)

s = s.replace(
"  function renderStack() {\n    if (!activeSelection?.records?.length) return renderEmpty();",
"  function renderStack() {\n    if (!activeSelection?.records?.length) { resetAdaptiveSheet(); return renderEmpty(); }\n    resetAdaptiveSheet();"
)

install_anchor = "  function install() {\n"
if install_anchor not in s:
    raise SystemExit('mechanics.js: install anchor not found')
resize_helper = r'''  addEventListener('resize', () => {
    const ratio = Number(stack.dataset.assetRatio);
    if (Number.isFinite(ratio)) fitAdaptiveSheet(ratio);
  }, {passive:true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && zoomViewer?.classList.contains('is-open')) {
      event.stopPropagation();
      closeZoomViewer();
    }
  });

'''
s = s.replace(install_anchor, resize_helper + install_anchor, 1)
js.write_text(s, encoding='utf-8')

# --- mechanics.html cache bust --------------------------------------------
html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
h = h.replace('mechanics.css?v=103', 'mechanics.css?v=106', 1)
h = h.replace('mechanics.js?v=105', 'mechanics.js?v=106', 1)
html.write_text(h, encoding='utf-8')
