from pathlib import Path
import re

HTML = Path('mechanics.html')
CSS = Path('mechanics.css')
JS = Path('mechanics.js')

# -----------------------------------------------------------------------------
# mechanics.html: mobile workspace navigation + cache busting
# -----------------------------------------------------------------------------
h = HTML.read_text(encoding='utf-8')
h = h.replace('mechanics.css?v=114', 'mechanics.css?v=115', 1)
h = h.replace('mechanics.js?v=109', 'mechanics.js?v=115', 1)

nav_marker = 'id="mobile-workspace-nav"'
if nav_marker not in h:
    needle = '''  </header>\n\n  <main class="mechanics-shell">'''
    replacement = '''  </header>\n\n  <nav id="mobile-workspace-nav" class="mobile-workspace-nav" aria-label="mobile mechanics workspace">\n    <div class="mobile-workspace-tabs" role="tablist" aria-label="database sections">\n      <button type="button" class="mobile-workspace-tab" role="tab" aria-controls="project-index" aria-selected="true" data-mobile-view-target="works">\n        <span data-i18n="mobileWorks">作品</span>\n      </button>\n      <button type="button" class="mobile-workspace-tab" role="tab" aria-controls="engineering-index" aria-selected="false" data-mobile-view-target="database">\n        <span data-i18n="mobileDatabase">数据库</span>\n      </button>\n      <button type="button" class="mobile-workspace-tab" role="tab" aria-controls="archive-stage" aria-selected="false" data-mobile-view-target="archive">\n        <span data-i18n="mobileArchive">档案</span>\n        <span id="mobile-archive-count" class="mobile-archive-count" hidden></span>\n      </button>\n    </div>\n    <div id="mobile-workspace-context" class="mobile-workspace-context" aria-live="polite">未选择技术点</div>\n  </nav>\n\n  <main class="mechanics-shell">'''
    if needle not in h:
        raise SystemExit('Could not find header/main insertion point')
    h = h.replace(needle, replacement, 1)

# Keep the first paint consistent with the current shorter intro copy.
h = h.replace(
    '以作品为线索检索技术点，追踪实践中使用、生成或修正的技术、经验、想法、技法与工法，并将记录汇入中央「墟构工程总数据库」。',
    '这里收集以「墟构」为目的的创作手法，包括建造废墟园林所用的工法、相关技术、工作记录与实践经验。'
)
HTML.write_text(h, encoding='utf-8')

# -----------------------------------------------------------------------------
# mechanics.css: mobile is a three-panel workspace, not a long stacked page
# -----------------------------------------------------------------------------
c = CSS.read_text(encoding='utf-8')
css_marker = '/* v115 · mobile three-panel workspace */'
if css_marker not in c:
    c += r'''


/* v115 · mobile three-panel workspace
   The desktop database remains three simultaneous columns. On phones the same
   information becomes three stable work surfaces (works / database / archive)
   with a persistent locator. This prevents the old left-to-right layout from
   turning into one very long vertical document. */
.mobile-workspace-nav{display:none}

@media(max-width:800px){
  :root{
    --mobile-safe-top:env(safe-area-inset-top,0px);
    --mobile-safe-bottom:env(safe-area-inset-bottom,0px);
    --mobile-topbar-h:50px;
    --mobile-workspace-h:64px;
    --mobile-shell-top:calc(var(--mobile-safe-top) + var(--mobile-topbar-h) + var(--mobile-workspace-h))
  }

  html,body{
    width:100%;
    height:100%;
    min-height:100%;
    overflow:hidden !important;
    overscroll-behavior:none
  }
  body{background:var(--reader-bg)}

  html body .mechanics-topbar{
    position:fixed !important;
    z-index:90 !important;
    top:0 !important;
    left:0 !important;
    right:0 !important;
    width:100% !important;
    height:calc(var(--mobile-safe-top) + var(--mobile-topbar-h)) !important;
    min-height:0 !important;
    padding:var(--mobile-safe-top) 12px 0 !important;
    gap:10px !important;
    justify-content:space-between !important;
    background:var(--reader-paper) !important;
    border-bottom:1px solid var(--reader-line) !important
  }
  html body .mechanics-nav{display:none !important}
  html body .reader-tone-control{height:var(--mobile-topbar-h) !important;gap:5px !important}
  html body .reader-tone-track-wrap,
  html body .reader-tone-slider{width:82px !important;height:26px !important}
  html body .reader-tone-warm-mark{top:11px !important}
  html body .reader-tone-icon{width:11px !important;font-size:10px !important}
  html body .language-switch{gap:4px !important;font-size:9px !important;white-space:nowrap}
  html body .language-switch button{padding:7px 1px !important}

  .mobile-workspace-nav{
    position:fixed;
    z-index:86;
    top:calc(var(--mobile-safe-top) + var(--mobile-topbar-h));
    left:0;
    right:0;
    height:var(--mobile-workspace-h);
    display:grid;
    grid-template-rows:36px 28px;
    background:var(--reader-paper);
    border-bottom:1px solid var(--reader-line-strong);
    color:var(--mechanics-ink,var(--reader-muted));
    user-select:none
  }
  .mobile-workspace-tabs{
    min-width:0;
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    border-bottom:1px solid var(--reader-line)
  }
  .mobile-workspace-tab{
    appearance:none;
    min-width:0;
    border:0;
    border-right:1px solid var(--reader-line);
    background:transparent;
    padding:0 8px;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:5px;
    color:var(--mechanics-ink-soft,var(--reader-muted));
    font-size:11px;
    line-height:1;
    letter-spacing:.025em;
    font-weight:300
  }
  .mobile-workspace-tab:last-child{border-right:0}
  .mobile-workspace-tab[aria-selected="true"]{
    color:var(--mechanics-ink-strong,var(--reader-text));
    font-weight:500;
    box-shadow:inset 0 -2px 0 var(--mechanics-ink-strong,var(--reader-text));
    background:color-mix(in srgb,var(--reader-text) 4%,transparent)
  }
  .mobile-archive-count{
    min-width:15px;
    height:15px;
    padding:0 4px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border:1px solid var(--reader-line-strong);
    border-radius:999px;
    font:400 8px/1 "IBM Plex Mono",monospace
  }
  .mobile-workspace-context{
    min-width:0;
    display:flex;
    align-items:center;
    padding:0 12px;
    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
    color:var(--mechanics-ink-soft,var(--reader-muted));
    font:300 8.5px/1 "IBM Plex Mono","IBM Plex Sans JP",monospace;
    letter-spacing:.018em
  }
  .mobile-workspace-context::before{
    content:"path /";
    flex:0 0 auto;
    margin-right:7px;
    color:var(--mechanics-ink-faint,var(--reader-faint));
    letter-spacing:.065em
  }

  html body .mechanics-shell{
    position:fixed !important;
    z-index:1 !important;
    top:var(--mobile-shell-top) !important;
    left:0 !important;
    right:0 !important;
    bottom:0 !important;
    width:auto !important;
    height:auto !important;
    display:block !important;
    overflow:hidden !important
  }

  html body .mechanics-shell > .project-index,
  html body .mechanics-shell > .engineering-index,
  html body .mechanics-shell > .archive-stage{
    position:absolute !important;
    inset:0 !important;
    width:100% !important;
    height:100% !important;
    min-width:0 !important;
    min-height:0 !important;
    display:none !important;
    border:0 !important;
    margin:0 !important
  }
  html body:not([data-mobile-view]) .mechanics-shell > .project-index,
  html body[data-mobile-view="works"] .mechanics-shell > .project-index,
  html body[data-mobile-view="database"] .mechanics-shell > .engineering-index,
  html body[data-mobile-view="archive"] .mechanics-shell > .archive-stage{
    display:block !important
  }

  /* Work finding aid ------------------------------------------------------ */
  html body .mechanics-shell > .project-index{
    padding:14px 14px calc(24px + var(--mobile-safe-bottom)) !important;
    overflow-x:hidden !important;
    overflow-y:auto !important;
    overscroll-behavior:contain;
    -webkit-overflow-scrolling:touch;
    background:var(--reader-paper) !important
  }
  html body .project-index .project-index-head{
    margin:0 0 14px !important;
    opacity:1 !important
  }
  html body .project-index .project-index-description{
    max-width:none !important;
    margin:0 !important;
    color:var(--mechanics-ink-soft,var(--reader-muted)) !important;
    font-size:10.5px !important;
    line-height:1.48 !important;
    letter-spacing:.012em !important
  }
  html body .project-index .project-index-divider{
    margin:13px 0 14px !important;
    opacity:.58 !important
  }
  html body .project-index .project-index-kicker,
  html body .project-index .project-index-subtitle{
    font-size:13px !important;
    line-height:1.08 !important;
    letter-spacing:.012em !important
  }
  html body .project-index .selection-tree{
    gap:8px !important;
    padding-bottom:10px !important
  }
  html body .project-index .selection-group,
  html body .project-index .selection-group-nodes{
    gap:6px !important
  }
  html body .project-index .selection-group-nodes > .selection-node.is-project-card{
    padding:25px 8px 7px !important;
    min-height:54px;
    background:var(--mechanics-card,var(--reader-paper)) !important
  }
  html body .project-index .selection-group-nodes > .selection-node.is-project-card::before{
    height:19px !important;
    padding:0 7px !important;
    font-size:8px !important
  }
  html body .project-index .selection-node.is-project-card > .selection-row{
    min-height:34px !important;
    font-size:12.5px !important
  }
  html body .project-index .selection-node.is-project-card > .selection-children{
    margin:3px 0 2px 12px !important;
    padding:1px 0 1px 16px !important
  }
  html body .project-index .selection-node.is-project-card > .selection-children > .selection-node > .selection-row{
    min-height:31px !important;
    padding-left:0 !important;
    gap:6px !important;
    font-size:10.5px !important
  }
  html body .project-index .selection-select,
  html body .project-index .selection-project-select{
    min-height:30px;
    display:inline-flex;
    align-items:center
  }

  /* Engineering tree ----------------------------------------------------- */
  html body .mechanics-shell > .engineering-index{
    padding:0 12px calc(28px + var(--mobile-safe-bottom)) 0 !important;
    overflow-x:hidden !important;
    overflow-y:auto !important;
    overscroll-behavior:contain;
    -webkit-overflow-scrolling:touch;
    background:var(--reader-paper) !important;
    background-image:none !important
  }
  html body .engineering-index::before{display:none !important}
  html body .engineering-index .engineering-title{
    position:sticky !important;
    z-index:30 !important;
    top:0 !important;
    min-height:46px !important;
    margin:0 !important;
    padding:11px 12px 10px 18px !important;
    display:flex !important;
    align-items:center !important;
    gap:8px !important;
    background:linear-gradient(to bottom,var(--reader-paper) 86%,color-mix(in srgb,var(--reader-paper) 86%,transparent)) !important;
    border-bottom:1px solid var(--reader-line) !important;
    font-size:18px !important;
    line-height:1.08 !important;
    white-space:normal !important
  }
  html body .engineering-title-square{
    width:10px !important;
    height:10px !important;
    flex-basis:10px !important
  }
  html body .engineering-index .engineering-taxonomy{
    margin:10px 0 24px 20px !important;
    padding:0 0 0 14px !important;
    border-left:1px solid var(--mechanics-tree-line,var(--tree-line)) !important
  }
  html body .engineering-index .engineering-taxonomy > .taxonomy-node > .taxonomy-row::before{
    left:-14px !important;
    width:14px !important
  }
  html body .engineering-index .taxonomy-row{
    min-height:34px !important;
    height:auto !important;
    gap:6px !important;
    padding:3px 0 !important;
    overflow:visible !important;
    scroll-margin-top:56px
  }
  html body .engineering-index .taxonomy-row .tree-dash{
    width:18px !important;
    flex:0 0 18px !important;
    display:inline-flex;
    justify-content:center;
    align-items:center;
    min-height:28px;
    font-size:11px !important;
    opacity:.62 !important
  }
  html body .engineering-index .taxonomy-label{
    font-size:11.5px !important;
    line-height:1.28 !important;
    transform:none !important
  }
  html body .engineering-index .engineering-taxonomy > .taxonomy-node > .taxonomy-row .taxonomy-label{
    font-size:12.5px !important;
    font-weight:400
  }
  html body .engineering-index .taxonomy-children{
    margin-left:13px !important;
    padding-left:13px !important
  }
  html body .engineering-index .taxonomy-node.is-mobile-collapsed > .taxonomy-children{
    display:none !important
  }
  html body .engineering-index .taxonomy-node.is-route > .taxonomy-row,
  html body .engineering-index .taxonomy-node.is-target > .taxonomy-row{
    font-weight:500 !important
  }
  html body .engineering-index .taxonomy-node.is-target > .taxonomy-row .taxonomy-label{
    text-underline-offset:3px !important
  }

  /* Archive viewer ------------------------------------------------------- */
  html body .mechanics-shell > .archive-stage{
    padding:0 !important;
    overflow:hidden !important;
    background-size:32px 32px !important
  }
  html body .archive-stage .sheet-stack{
    position:absolute !important;
    inset:0 !important;
    width:100% !important;
    height:100% !important
  }
  html body .archive-stage .sheet-stack.is-empty .archive-sheet{
    width:calc(100% - 24px) !important;
    height:calc(100% - 150px - var(--mobile-safe-bottom)) !important;
    min-height:0 !important;
    max-height:none !important;
    left:12px !important;
    top:10px !important;
    right:auto !important;
    bottom:auto !important;
    transform:none !important
  }
  html body.has-file-extraction-tray .archive-stage .sheet-stack.is-selected .archive-sheet.is-front{
    max-width:calc(100% - 20px) !important;
    max-height:calc(100% - 136px - var(--mobile-safe-bottom)) !important;
    min-height:0 !important
  }
  html body .archive-stage .sheet-visual{margin:9px 9px 0 !important}
  html body .archive-stage .sheet-footer{
    min-height:54px !important;
    padding:7px 10px 8px !important;
    gap:8px !important
  }
  html body .archive-stage .sheet-title{
    font-size:12.5px !important;
    line-height:1.18 !important
  }
  html body .archive-stage .sheet-footer-side{min-width:78px !important}
  html body .archive-stage .sheet-open-source{font-size:8.5px !important}
  html body .archive-stage .empty-symbol{
    width:min(42vw,146px) !important;
    height:min(42vw,146px) !important
  }

  html body .file-extraction-tray{
    height:calc(126px + var(--mobile-safe-bottom)) !important;
    padding-bottom:var(--mobile-safe-bottom) !important;
    overflow:visible !important
  }
  html body .file-tray-directory{
    height:23px !important;
    padding:0 11px !important;
    font-size:7.5px !important
  }
  html body .file-tray-rack{
    top:23px !important;
    bottom:var(--mobile-safe-bottom) !important;
    padding:12px 52px 5px !important;
    justify-content:flex-start !important;
    overflow-x:auto !important;
    overflow-y:visible !important;
    scroll-snap-type:x proximity;
    -webkit-overflow-scrolling:touch
  }
  html body .file-tray-item{scroll-snap-align:center}
  html body .file-tray-nav{
    top:23px !important;
    bottom:var(--mobile-safe-bottom) !important;
    width:44px !important
  }
  html body .file-tray-prev{left:0 !important}
  html body .file-tray-next{right:0 !important}
  html body .file-tray-nav svg{width:25px !important;height:36px !important}

  html body .mechanics-zoom-viewer{
    padding:calc(8px + var(--mobile-safe-top)) 8px calc(8px + var(--mobile-safe-bottom)) !important
  }
  html body .mechanics-zoom-toolbar{min-height:32px !important}
  html body .mechanics-zoom-content > img{
    max-width:calc(100vw - 18px) !important;
    max-height:calc(100dvh - 64px - var(--mobile-safe-top) - var(--mobile-safe-bottom)) !important
  }

  html body .directory-connector{display:none !important}
}

@supports not (color:color-mix(in srgb,white,black)){
  @media(max-width:800px){
    .mobile-workspace-tab[aria-selected="true"]{background:var(--reader-hover)}
    html body .engineering-index .engineering-title{background:var(--reader-paper) !important}
  }
}
'''
    CSS.write_text(c, encoding='utf-8')

# -----------------------------------------------------------------------------
# mechanics.js: mobile state, breadcrumb, branch folding, directed transitions
# -----------------------------------------------------------------------------
j = JS.read_text(encoding='utf-8')
js_marker = '// v115 mobile workspace helpers'

if js_marker not in j:
    # UI labels
    pattern = r"(\s+browseByWork:\{[^\n]+\},\n)"
    addition = """    mobileWorks:{zh:'作品',en:'Works',ja:'作品'},\n    mobileDatabase:{zh:'数据库',en:'Database',ja:'データベース'},\n    mobileArchive:{zh:'档案',en:'Archive',ja:'アーカイブ'},\n    mobilePathEmpty:{zh:'未选择技术点',en:'No technical point selected',ja:'技術点未選択'},\n"""
    j, n = re.subn(pattern, lambda m: m.group(1) + addition, j, count=1)
    if n != 1:
        raise SystemExit('Could not insert mobile UI labels')

    # DOM refs
    needle = "  const engineeringIndex = $('engineering-index');\n"
    replacement = needle + "  const mobileNav = $('mobile-workspace-nav');\n  const mobileContext = $('mobile-workspace-context');\n  const mobileArchiveCount = $('mobile-archive-count');\n"
    if needle not in j:
        raise SystemExit('Could not insert mobile DOM refs')
    j = j.replace(needle, replacement, 1)

    # state
    needle = "  let wheelLock = 0;\n"
    replacement = needle + "  let mobileView = 'works';\n  const mobileQuery = matchMedia('(max-width:800px)');\n"
    if needle not in j:
        raise SystemExit('Could not insert mobile state')
    j = j.replace(needle, replacement, 1)

    # helper functions before selectionNode
    needle = "  function selectionNode(node, depth, route, categoryLabel = '') {\n"
    helpers = r'''  // v115 mobile workspace helpers
  function isMobileLayout() {
    return mobileQuery.matches;
  }

  function mobileContextText() {
    if (activeSelection?.isTaxonomyBrowse && activeSelection.taxonomy) {
      const parts = taxonomyPath(activeSelection.taxonomy);
      return parts.slice(-3).join(' / ') || local(activeSelection.label);
    }
    if (activeSelection) {
      return [ownerLabel(activeSelection), local(activeSelection.label)].filter(Boolean).join(' / ');
    }
    if (activeProjectId) {
      const project = selectionById.get(activeProjectId);
      return project ? local(project.label) : UI.mobilePathEmpty[lang];
    }
    return UI.mobilePathEmpty[lang];
  }

  function updateMobileWorkspace() {
    if (!mobileNav) return;
    if (!isMobileLayout()) {
      document.body.removeAttribute('data-mobile-view');
      return;
    }

    const view = document.body.dataset.mobileView || mobileView || 'works';
    mobileNav.querySelectorAll('[data-mobile-view-target]').forEach(button => {
      const selected = button.dataset.mobileViewTarget === view;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });

    if (mobileContext) mobileContext.textContent = mobileContextText();
    if (mobileArchiveCount) {
      const count = activeSelection?.records?.length || 0;
      mobileArchiveCount.hidden = count < 1;
      mobileArchiveCount.textContent = count ? String(count) : '';
    }
  }

  function focusMobileTaxonomyTarget(behavior = 'smooth') {
    if (!isMobileLayout()) return;
    const target = taxonomyRoot.querySelector('.taxonomy-node.is-target > .taxonomy-row');
    if (!target) return;
    target.scrollIntoView({block:'center', inline:'nearest', behavior});
  }

  function setMobileView(view, options = {}) {
    if (!isMobileLayout() || !mobileNav) return;
    const next = ['works','database','archive'].includes(view) ? view : 'works';
    mobileView = next;
    document.body.dataset.mobileView = next;
    updateMobileWorkspace();

    requestAnimationFrame(() => {
      if (next === 'database') {
        focusMobileTaxonomyTarget(options.instant ? 'auto' : 'smooth');
      } else if (next === 'works' && activeProjectId) {
        const card = selectionTree.querySelector(`[data-selection-node="${CSS.escape(activeProjectId)}"]`);
        card?.scrollIntoView({block:'nearest', inline:'nearest', behavior:options.instant ? 'auto' : 'smooth'});
      }
      // The legacy geometry/fitting overlay listens for resize; switching panels
      // changes which surface has measurable dimensions, so refresh it once.
      dispatchEvent(new Event('resize'));
    });
  }

  function bindMobileWorkspace() {
    if (!mobileNav) return;

    mobileNav.addEventListener('click', event => {
      const button = event.target.closest('[data-mobile-view-target]');
      if (!button) return;
      setMobileView(button.dataset.mobileViewTarget);
    });

    const onMediaChange = () => {
      if (isMobileLayout()) {
        const next = activeSelection ? 'database' : 'works';
        setMobileView(next, {instant:true});
      } else {
        document.body.removeAttribute('data-mobile-view');
        mobileView = 'works';
        updateMobileWorkspace();
      }
      renderTaxonomy();
    };

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', onMediaChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(onMediaChange);
    }

    if (isMobileLayout()) setMobileView('works', {instant:true});
  }

'''
    if needle not in j:
        raise SystemExit('Could not insert mobile helper functions')
    j = j.replace(needle, helpers + needle, 1)

    # taxonomy folding state and + / − indicator
    needle = "    if (route.has(node.id)) wrap.classList.add('is-route');\n    if (activeSelection?.taxonomy === node.id) wrap.classList.add('is-target');\n"
    replacement = needle + "\n    const isMobileBranch = isMobileLayout() && Boolean(node.children?.length);\n    const mobileBranchOpen = !isMobileBranch || Boolean(activeSelection?.taxonomy && route.has(node.id));\n    if (isMobileBranch && !mobileBranchOpen) wrap.classList.add('is-mobile-collapsed');\n"
    if needle not in j:
        raise SystemExit('Could not insert taxonomy mobile branch state')
    j = j.replace(needle, replacement, 1)

    needle = "    row.setAttribute('aria-label', local(node.label));\n\n    const dash = document.createElement('span');\n"
    replacement = "    row.setAttribute('aria-label', local(node.label));\n    if (isMobileBranch) row.setAttribute('aria-expanded', mobileBranchOpen ? 'true' : 'false');\n\n    const dash = document.createElement('span');\n"
    if needle not in j:
        raise SystemExit('Could not add taxonomy aria-expanded')
    j = j.replace(needle, replacement, 1)

    needle = "    dash.className = 'tree-dash';\n    dash.textContent = '−';\n\n    const label = document.createElement('span');\n"
    replacement = "    dash.className = 'tree-dash';\n    dash.textContent = isMobileBranch ? (mobileBranchOpen ? '−' : '+') : '−';\n\n    const label = document.createElement('span');\n"
    if needle not in j:
        raise SystemExit('Could not change taxonomy branch marker')
    j = j.replace(needle, replacement, 1)

    # keep mobile navigator in sync after taxonomy render
    needle = "    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));\n  }\n"
    replacement = "    taxonomyRoot.replaceChildren(...(D.taxonomy || []).map(node => taxonomyNode(node, route)));\n    updateMobileWorkspace();\n  }\n"
    if needle not in j:
        raise SystemExit('Could not update renderTaxonomy')
    j = j.replace(needle, replacement, 1)

    # project selection: stay in works
    needle = "    history.replaceState(null, '', location.pathname + location.search);\n    requestAnimationFrame(() => {\n      scheduleConnector();\n      engineeringIndex.scrollTop = 0;\n    });\n  }\n\n  function selectArchive(selection, options = {}) {"
    replacement = "    history.replaceState(null, '', location.pathname + location.search);\n    if (isMobileLayout()) setMobileView('works', {instant:true});\n    requestAnimationFrame(() => {\n      scheduleConnector();\n      engineeringIndex.scrollTop = 0;\n    });\n  }\n\n  function selectArchive(selection, options = {}) {"
    if needle not in j:
        raise SystemExit('Could not patch selectProjectCard')
    j = j.replace(needle, replacement, 1)

    # technical point selection: mobile moves to database to show the route first.
    needle = "    renderSelection();\n    renderTaxonomy();\n    renderStack();\n\n    requestAnimationFrame(() => {\n      engineeringIndex.scrollTop = 0;\n      scheduleConnector();\n      setTimeout(scheduleConnector, 220);\n    });\n\n    if (!options.skipHistory) writeHash();\n  }\n\n  function collectTaxonomyRecords"
    replacement = "    renderSelection();\n    renderTaxonomy();\n    renderStack();\n    if (isMobileLayout()) setMobileView(options.skipHistory ? 'archive' : 'database', {instant:Boolean(options.skipHistory)});\n\n    requestAnimationFrame(() => {\n      engineeringIndex.scrollTop = 0;\n      if (isMobileLayout() && document.body.dataset.mobileView === 'database') focusMobileTaxonomyTarget(options.skipHistory ? 'auto' : 'smooth');\n      scheduleConnector();\n      setTimeout(scheduleConnector, 220);\n    });\n\n    if (!options.skipHistory) writeHash();\n  }\n\n  function collectTaxonomyRecords"
    if needle not in j:
        raise SystemExit('Could not patch selectArchive')
    j = j.replace(needle, replacement, 1)

    # taxonomy browsing stays in database and opens only the selected route.
    needle = "    renderStack();\n    connector.classList.remove('is-visible');\n    connectorPath.setAttribute('d','');\n\n    requestAnimationFrame(() => {\n      engineeringIndex.scrollTop = 0;\n    });\n\n    if (!options.skipHistory) writeHash();\n  }\n\n  function writeHash()"
    replacement = "    renderStack();\n    connector.classList.remove('is-visible');\n    connectorPath.setAttribute('d','');\n    if (isMobileLayout()) setMobileView('database');\n\n    requestAnimationFrame(() => {\n      engineeringIndex.scrollTop = 0;\n      if (isMobileLayout()) focusMobileTaxonomyTarget();\n    });\n\n    if (!options.skipHistory) writeHash();\n  }\n\n  function writeHash()"
    if needle not in j:
        raise SystemExit('Could not patch selectTaxonomy')
    j = j.replace(needle, replacement, 1)

    # mobile navigator is a working surface, not an outside-dismiss target.
    needle = "      if (stage.contains(event.target) || engineeringIndex.contains(event.target)) return;\n"
    replacement = "      if (stage.contains(event.target) || engineeringIndex.contains(event.target)) return;\n      if (event.target.closest('#mobile-workspace-nav')) return;\n"
    if needle not in j:
        raise SystemExit('Could not patch mobile nav dismissal guard')
    j = j.replace(needle, replacement, 1)

    # language refresh also refreshes mobile context.
    needle = "    document.title = UI.title[lang];\n    renderSelection();\n    renderTaxonomy();\n    renderStack();\n    scheduleConnector();\n  }\n"
    replacement = "    document.title = UI.title[lang];\n    renderSelection();\n    renderTaxonomy();\n    renderStack();\n    updateMobileWorkspace();\n    scheduleConnector();\n  }\n"
    if needle not in j:
        raise SystemExit('Could not patch refreshLanguage')
    j = j.replace(needle, replacement, 1)

    # install workspace before hash restoration so direct archive links land in Archive.
    needle = "    buildIndexes();\n    renderSelection();\n    renderTaxonomy();\n    bindNavigation();\n    bindProjectTreeDismiss();\n    restoreHash();\n"
    replacement = "    buildIndexes();\n    bindMobileWorkspace();\n    renderSelection();\n    renderTaxonomy();\n    bindNavigation();\n    bindProjectTreeDismiss();\n    restoreHash();\n    if (isMobileLayout() && !location.hash) setMobileView('works', {instant:true});\n"
    if needle not in j:
        raise SystemExit('Could not patch install')
    j = j.replace(needle, replacement, 1)

    JS.write_text(j, encoding='utf-8')

print('mechanics v115 mobile patch applied')
