from pathlib import Path

p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')

s = s.replace('mechanics.css?v=95', 'mechanics.css?v=96')
s = s.replace('mechanics-data.js?v=95', 'mechanics-data.js?v=96')
s = s.replace('mechanics.js?v=95', 'mechanics.js?v=96')

old_schedule = """      function scheduleTray() {\n        cancelAnimationFrame(trayRaf);\n        trayRaf = requestAnimationFrame(syncTray);\n      }"""
new_schedule = """      function scheduleTray() {\n        if (typeof window.__mechanicsRackSyncV96 === 'function') {\n          window.__mechanicsRackSyncV96();\n        }\n      }"""
if old_schedule not in s:
    raise SystemExit('v95 scheduleTray block not found')
s = s.replace(old_schedule, new_schedule, 1)

old_tray = """      <div id=\"file-extraction-tray\" class=\"file-extraction-tray\" aria-label=\"archive file rack\" aria-hidden=\"true\">\n        <div id=\"file-tray-rack\" class=\"file-tray-rack\"></div>\n      </div>"""
new_tray = """      <div id=\"file-extraction-tray\" class=\"file-extraction-tray\" aria-label=\"archive file rack\" aria-hidden=\"true\">\n        <div id=\"file-tray-directory\" class=\"file-tray-directory\" aria-live=\"polite\"></div>\n        <div id=\"file-tray-rack\" class=\"file-tray-rack\"></div>\n      </div>"""
if old_tray not in s:
    raise SystemExit('tray markup not found')
s = s.replace(old_tray, new_tray, 1)

v96_style = r'''
  <style id="mechanics-v96-file-rack">
    /* v96 · labelled archive files / directory register / physical pull motion */
    .file-extraction-tray{
      height:154px !important;
      display:none;
      align-items:stretch !important;
      justify-content:stretch !important;
      overflow:visible !important;
      background:linear-gradient(to bottom,rgba(242,242,237,.04),rgba(242,242,237,.50) 30%,var(--reader-bg) 100%) !important
    }
    body.has-file-extraction-tray .file-extraction-tray{display:block !important}
    .file-tray-directory{
      position:absolute;
      z-index:6;
      left:0;
      right:0;
      top:0;
      height:27px;
      display:flex;
      align-items:center;
      padding:0 20px;
      border-bottom:1px solid var(--reader-line);
      background:rgba(242,242,237,.68);
      color:var(--reader-muted);
      font:300 8px/1.1 "IBM Plex Mono",monospace;
      letter-spacing:.025em;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
      pointer-events:none
    }
    .file-tray-directory::before{
      content:"directory /";
      margin-right:9px;
      color:var(--reader-faint);
      letter-spacing:.08em
    }
    .file-tray-rack{
      position:absolute !important;
      left:0;
      right:0;
      top:27px;
      bottom:0;
      width:auto !important;
      height:auto !important;
      display:flex !important;
      align-items:flex-end !important;
      justify-content:center !important;
      padding:16px 38px 7px !important;
      overflow:visible !important;
      perspective:1180px !important;
      isolation:isolate
    }
    .file-tray-item{
      --base-y:24px;
      --selected-shift:0px;
      --hover-spread:0px;
      --hover-lift:0px;
      position:relative !important;
      z-index:var(--rack-z,1) !important;
      flex:0 0 var(--tray-card-w,72px) !important;
      width:var(--tray-card-w,72px) !important;
      height:var(--tray-card-h,94px) !important;
      min-width:0 !important;
      margin-left:var(--tray-overlap,-34px) !important;
      opacity:.25 !important;
      transform:translate3d(calc(var(--selected-shift) + var(--hover-spread)),calc(var(--base-y) - var(--hover-lift)),0) rotateY(-29deg) rotateZ(-.7deg) skewY(-4deg) !important;
      transform-origin:50% 100% !important;
      transition:transform 430ms cubic-bezier(.18,.72,.16,1),opacity 240ms ease,filter 260ms ease !important;
      will-change:transform,opacity
    }
    .file-tray-item:first-child{margin-left:0 !important}
    .file-tray-item::before,
    .file-tray-item::after{clip-path:polygon(0 100%,0 34%,27% 0,100% 0,100% 100%) !important}
    .file-tray-item::after{inset:1.15px !important;background:rgba(255,255,251,.26) !important}
    .file-tray-item.is-near{opacity:.48 !important;z-index:5 !important}
    .file-tray-item.is-active{
      --base-y:-61px;
      --rack-z:20;
      opacity:1 !important;
      transform:translate3d(calc(var(--selected-shift) + var(--hover-spread)),calc(var(--base-y) - var(--hover-lift)),16px) rotateY(-13deg) rotateZ(-.35deg) skewY(-2.2deg) !important
    }
    .file-tray-item.is-active::after{background:rgba(255,255,251,.95) !important}
    .file-tray-name{
      position:absolute;
      z-index:4;
      left:7px;
      right:5px;
      bottom:8px;
      display:block;
      overflow:hidden;
      color:var(--reader-muted);
      font:300 7px/1.18 "IBM Plex Mono",monospace;
      letter-spacing:.01em;
      white-space:nowrap;
      text-overflow:ellipsis;
      transform:skewY(4deg) rotateY(11deg);
      transform-origin:left bottom;
      opacity:.82;
      pointer-events:none
    }
    .file-tray-item.is-active .file-tray-name{color:var(--reader-text);opacity:1}
    .file-tray-index{top:7px !important;right:6px !important;bottom:auto !important;font-size:6.5px !important;opacity:.48 !important}
    .file-tray-item.is-active .file-tray-index{opacity:.72 !important}
    body.has-file-extraction-tray .sheet-stack.is-selected .archive-sheet.is-front{bottom:166px !important}
    @media(max-width:1100px){
      .file-extraction-tray{height:146px !important}
      .file-tray-directory{height:25px;padding:0 15px}
      .file-tray-rack{top:25px;padding-left:24px !important;padding-right:24px !important}
      body.has-file-extraction-tray .sheet-stack.is-selected .archive-sheet.is-front{bottom:156px !important}
    }
    @media(max-width:800px){
      .file-extraction-tray{height:136px !important;overflow:hidden !important}
      .file-tray-rack{overflow-x:auto !important;overflow-y:hidden !important;justify-content:flex-start !important}
      .file-tray-item.is-active{--base-y:-42px}
      body.has-file-extraction-tray .sheet-stack.is-selected .archive-sheet.is-front{bottom:146px !important}
    }
  </style>
'''
s = s.replace('  <script src="ruin-language.js?v=74"></script>', v96_style + '\n  <script src="ruin-language.js?v=74"></script>', 1)

v96_script = r'''
  <script id="mechanics-v96-rack-script">
    (() => {
      const stack = document.getElementById('sheet-stack');
      const stage = document.getElementById('archive-stage');
      const tray = document.getElementById('file-extraction-tray');
      const rack = document.getElementById('file-tray-rack');
      const directory = document.getElementById('file-tray-directory');
      if (!stack || !stage || !tray || !rack || !directory) return;

      const THRESHOLD = 5;
      let raf = 0;
      let signature = '';

      const basename = path => String(path || '').split('/').filter(Boolean).pop() || 'untitled';
      const dirname = path => {
        const parts = String(path || '').split('/').filter(Boolean);
        parts.pop();
        return parts.join('/') + (parts.length ? '/' : '');
      };

      function sheetData() {
        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];
        const records = sheets.map(sheet => {
          const source = sheet.querySelector('.sheet-source')?.textContent?.trim() || '';
          return {sheet, source, name:basename(source), active:sheet.classList.contains('is-front')};
        }).filter(record => record.source);
        records.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric:true,sensitivity:'base'}));
        return records;
      }

      function setRackGeometry(count) {
        const usable = Math.max(290, stage.clientWidth - 86);
        const width = Math.max(58, Math.min(78, usable / Math.max(4.7, count * .58)));
        const height = Math.max(78, Math.min(102, width * 1.31));
        const overlap = -Math.max(27, Math.min(43, width * .52));
        tray.style.setProperty('--tray-card-w', `${width.toFixed(1)}px`);
        tray.style.setProperty('--tray-card-h', `${height.toFixed(1)}px`);
        tray.style.setProperty('--tray-overlap', `${overlap.toFixed(1)}px`);
      }

      function updateSelectedPush(activePath) {
        const items = [...rack.querySelectorAll('.file-tray-item')];
        const activeIndex = items.findIndex(item => item.dataset.path === activePath);
        items.forEach((item,index) => {
          const active = index === activeIndex;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
          if (activeIndex < 0 || active) {
            item.style.setProperty('--selected-shift','0px');
            return;
          }
          const distance = Math.abs(index - activeIndex);
          const force = Math.max(0, 1 - distance / 4.2);
          const direction = index < activeIndex ? -1 : 1;
          item.style.setProperty('--selected-shift', `${(direction * force * 17).toFixed(1)}px`);
        });
      }

      function activatePath(path) {
        const sheets = [...stack.querySelectorAll(':scope > .archive-sheet')];
        const target = sheets.find(sheet => sheet.querySelector('.sheet-source')?.textContent?.trim() === path);
        if (!target || target.classList.contains('is-front')) return;
        target.click();
      }

      function buildRack(records) {
        const fragment = document.createDocumentFragment();
        records.forEach((record,index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'file-tray-item';
          button.dataset.path = record.source;
          button.title = record.name;
          button.setAttribute('aria-label', record.name);
          button.setAttribute('aria-pressed','false');

          const number = document.createElement('span');
          number.className = 'file-tray-index';
          number.textContent = String(index + 1).padStart(2,'0');

          const name = document.createElement('span');
          name.className = 'file-tray-name';
          name.textContent = record.name;

          button.append(number,name);
          button.addEventListener('click', () => activatePath(record.source));
          fragment.appendChild(button);
        });
        rack.replaceChildren(fragment);
      }

      function clearHover() {
        rack.querySelectorAll('.file-tray-item').forEach(item => {
          item.style.setProperty('--hover-spread','0px');
          item.style.setProperty('--hover-lift','0px');
          item.classList.remove('is-near');
        });
      }

      rack.addEventListener('pointermove', event => {
        const items = [...rack.querySelectorAll('.file-tray-item')];
        const radius = 104;
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const dx = center - event.clientX;
          const proximity = Math.max(0, 1 - Math.abs(dx) / radius);
          const eased = proximity * proximity * (3 - 2 * proximity);
          const direction = dx < 0 ? -1 : 1;
          item.style.setProperty('--hover-spread', `${(direction * eased * 14).toFixed(1)}px`);
          item.style.setProperty('--hover-lift', `${(eased * 9).toFixed(1)}px`);
          item.classList.toggle('is-near', proximity > .16);
        });
      }, {capture:true,passive:true});
      rack.addEventListener('pointerleave', clearHover, {capture:true,passive:true});

      function sync() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const records = sheetData();
          const enabled = stack.classList.contains('is-selected') && records.length > THRESHOLD;
          document.body.classList.toggle('has-file-extraction-tray', enabled);
          tray.setAttribute('aria-hidden', enabled ? 'false' : 'true');
          if (!enabled) {
            signature = '';
            rack.replaceChildren();
            directory.textContent = '';
            return;
          }

          setRackGeometry(records.length);
          const active = records.find(record => record.active) || records[records.length - 1];
          directory.textContent = dirname(active?.source || '');
          const nextSignature = records.map(record => record.source).join('|');
          if (nextSignature !== signature) {
            signature = nextSignature;
            buildRack(records);
            requestAnimationFrame(() => updateSelectedPush(active?.source || ''));
          } else {
            updateSelectedPush(active?.source || '');
          }
        });
      }

      window.__mechanicsRackSyncV96 = sync;
      const observer = new MutationObserver(sync);
      observer.observe(stack,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
      addEventListener('resize',sync,{passive:true});
      addEventListener('ruinlanguagechange',sync);
      sync();
    })();
  </script>
'''
s = s.replace('\n</body>', v96_script + '\n</body>', 1)

p.write_text(s, encoding='utf-8')
