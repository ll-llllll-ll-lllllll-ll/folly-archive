(() => {
  'use strict';

  const mq = matchMedia('(max-width:800px)');
  const topbar = document.querySelector('.mechanics-topbar');
  const nav = document.getElementById('mobile-workspace-nav');
  const tabs = nav?.querySelector('.mobile-workspace-tabs');
  const engineeringIndex = document.getElementById('engineering-index');
  const taxonomy = document.getElementById('engineering-taxonomy');
  const titlebar = nav?.querySelector('.mobile-database-titlebar');
  const toggle = titlebar?.querySelector('#mobile-database-toggle');
  const title = toggle?.querySelector('.mobile-database-title');
  if (!topbar || !nav || !tabs || !engineeringIndex || !taxonomy || !titlebar || !toggle || !title) return;
  if (document.getElementById('mechanics-mobile-v118-style')) return;

  const oldIcon = toggle.querySelector('.mobile-database-tree-icon');
  oldIcon?.remove();

  const rootSquare = document.createElement('span');
  rootSquare.className = 'mobile-database-root-square';
  rootSquare.setAttribute('aria-hidden','true');
  toggle.prepend(rootSquare);

  titlebar.classList.add('mobile-database-titlebar-v118');
  topbar.prepend(titlebar);

  const handlebar = document.createElement('div');
  handlebar.className = 'mobile-database-handlebar';
  const handle = document.createElement('button');
  handle.id = 'mobile-database-handle';
  handle.className = 'mobile-database-handle';
  handle.type = 'button';
  handle.setAttribute('aria-controls','engineering-index');
  handle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') || 'false');
  handle.setAttribute('aria-label', toggle.getAttribute('aria-label') || title.textContent || 'database');
  handle.innerHTML = `
    <svg class="mobile-database-handle-icon" viewBox="0 0 46 30" aria-hidden="true">
      <rect class="handle-root" x="2.5" y="3.5" width="9" height="9"></rect>
      <path class="handle-branch" d="M11.5 8 H21 V22 H34 M21 15 H29"></path>
      <path class="handle-arrow" d="M29 17 L35 22 L29 27"></path>
    </svg>`;
  handlebar.appendChild(handle);
  nav.insertBefore(handlebar, tabs);

  handle.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    toggle.click();
  });

  toggle.addEventListener('click', () => {
    requestAnimationFrame(() => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      handle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  });

  const bodyObserver = new MutationObserver(() => {
    const expanded = document.body.dataset.mobileDatabaseOpen === 'true';
    handle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['data-mobile-database-open']});

  const languageObserver = new MutationObserver(() => {
    handle.setAttribute('aria-label', toggle.getAttribute('aria-label') || title.textContent || 'database');
  });
  languageObserver.observe(title,{childList:true,characterData:true,subtree:true});

  const style = document.createElement('style');
  style.id = 'mechanics-mobile-v118-style';
  style.textContent = `
    .mobile-database-handlebar{display:none}

    @media(max-width:800px){
      :root{
        --mobile-topbar-h:78px !important;
        --mobile-workspace-h:122px !important;
        --mobile-db-handle-h:44px;
        --mobile-tab-h:44px;
        --mobile-context-h:34px;
        --mobile-shell-top:calc(var(--mobile-safe-top) + var(--mobile-topbar-h) + var(--mobile-workspace-h)) !important
      }

      html body .mechanics-topbar{
        height:calc(var(--mobile-safe-top) + var(--mobile-topbar-h)) !important;
        padding:var(--mobile-safe-top) 11px 0 !important;
        justify-content:flex-end !important;
        align-items:flex-start !important;
        gap:12px !important;
        border-bottom:0 !important;
        overflow:visible !important
      }
      html body .mechanics-topbar .reader-tone-control{
        height:46px !important;
        margin:0 !important;
        padding-top:11px !important;
        flex:0 0 auto
      }
      html body .mechanics-topbar .reader-tone-track-wrap,
      html body .mechanics-topbar .reader-tone-slider{
        width:clamp(76px,15vw,98px) !important;
        height:27px !important
      }
      html body .mechanics-topbar .reader-tone-warm-mark{top:11px !important}
      html body .mechanics-topbar .language-switch{
        height:46px !important;
        align-items:center !important;
        padding-top:2px !important;
        flex:0 0 auto
      }

      .mobile-database-titlebar.mobile-database-titlebar-v118{
        display:flex !important;
        position:absolute !important;
        z-index:96 !important;
        left:15px !important;
        top:var(--mobile-safe-top) !important;
        width:min(58vw,365px) !important;
        height:62px !important;
        min-width:0 !important;
        border:0 !important;
        background:transparent !important;
        pointer-events:auto
      }
      .mobile-database-titlebar-v118 .mobile-database-toggle{
        appearance:none !important;
        width:auto !important;
        max-width:100% !important;
        height:62px !important;
        padding:0 !important;
        border:0 !important;
        background:transparent !important;
        display:flex !important;
        align-items:center !important;
        justify-content:flex-start !important;
        gap:13px !important;
        color:var(--mechanics-ink-strong,var(--reader-text)) !important;
        font:500 clamp(20px,5vw,30px)/1.04 "IBM Plex Sans JP","Noto Sans SC",sans-serif !important;
        letter-spacing:.015em !important;
        white-space:nowrap !important;
        text-align:left !important
      }
      html[data-lang="en"] .mobile-database-titlebar-v118 .mobile-database-toggle{
        font-size:clamp(13px,3.1vw,19px) !important;
        letter-spacing:.005em !important
      }
      html[data-lang="ja"] .mobile-database-titlebar-v118 .mobile-database-toggle{
        font-size:clamp(17px,4.1vw,24px) !important
      }
      .mobile-database-titlebar-v118 .mobile-database-title{
        display:block !important;
        min-width:0 !important;
        overflow:visible !important;
        text-overflow:clip !important;
        white-space:nowrap !important
      }
      .mobile-database-root-square{
        display:block;
        width:clamp(18px,3.9vw,25px);
        height:clamp(18px,3.9vw,25px);
        flex:0 0 clamp(18px,3.9vw,25px);
        background:var(--mechanics-ink-strong,var(--reader-text))
      }

      .mobile-workspace-nav{
        top:calc(var(--mobile-safe-top) + var(--mobile-topbar-h)) !important;
        height:var(--mobile-workspace-h) !important;
        grid-template-rows:var(--mobile-db-handle-h) var(--mobile-tab-h) var(--mobile-context-h) !important;
        z-index:86 !important;
        overflow:visible !important;
        background:var(--reader-paper) !important
      }
      .mobile-database-handlebar{
        display:flex;
        align-items:center;
        height:var(--mobile-db-handle-h);
        border-bottom:1px solid var(--reader-line);
        background:var(--reader-paper)
      }
      .mobile-database-handle{
        appearance:none;
        width:70px;
        height:100%;
        padding:0 0 0 22px;
        border:0;
        background:transparent;
        display:flex;
        align-items:center;
        justify-content:flex-start;
        color:var(--mechanics-ink-soft,var(--reader-muted))
      }
      .mobile-database-handle-icon{
        width:40px;
        height:28px;
        overflow:visible
      }
      .mobile-database-handle-icon .handle-root{
        fill:var(--mechanics-ink-strong,var(--reader-text));
        stroke:none
      }
      .mobile-database-handle-icon .handle-branch,
      .mobile-database-handle-icon .handle-arrow{
        fill:none;
        stroke:var(--mechanics-ink-soft,var(--reader-muted));
        stroke-width:1.15;
        vector-effect:non-scaling-stroke;
        stroke-linecap:square;
        stroke-linejoin:miter
      }
      .mobile-database-handle[aria-expanded="true"] .handle-branch,
      .mobile-database-handle[aria-expanded="true"] .handle-arrow{
        stroke:var(--mechanics-ink-strong,var(--reader-text))
      }
      .mobile-workspace-tabs{
        grid-template-columns:repeat(2,minmax(0,1fr)) !important;
        min-height:var(--mobile-tab-h) !important
      }
      .mobile-workspace-tab{font-size:11px !important}
      .mobile-workspace-context{
        min-height:var(--mobile-context-h) !important;
        padding:0 13px !important;
        font-size:8px !important
      }

      html body[data-mobile-database-open="true"] .mechanics-shell{
        z-index:94 !important;
        overflow:visible !important
      }
      html body .mechanics-shell > #engineering-index.engineering-index{
        display:block !important;
        top:calc(0px - var(--mobile-workspace-h)) !important;
        left:0 !important;
        right:0 !important;
        bottom:auto !important;
        width:100% !important;
        height:calc(100% + var(--mobile-workspace-h)) !important;
        max-height:none !important;
        margin:0 !important;
        padding:0 10px calc(30px + var(--mobile-safe-bottom)) 0 !important;
        overflow-x:hidden !important;
        overflow-y:auto !important;
        z-index:95 !important;
        opacity:0 !important;
        pointer-events:none !important;
        transform:translate3d(0,calc(-100% - 12px),0) !important;
        transition:transform 360ms cubic-bezier(.22,.72,.18,1),opacity 170ms ease !important;
        border:0 !important;
        box-shadow:none !important;
        background:var(--reader-paper) !important;
        background-image:none !important;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch
      }
      html body[data-mobile-database-open="true"] .mechanics-shell > #engineering-index.engineering-index{
        opacity:1 !important;
        pointer-events:auto !important;
        transform:translate3d(0,0,0) !important
      }
      html body .engineering-index .engineering-title{display:none !important}
      html body .engineering-index::before{display:none !important}
      html body .engineering-index .engineering-taxonomy{
        margin:0 0 28px 20px !important;
        padding:1px 0 36px 30px !important;
        border-left:1px solid var(--mechanics-tree-line,var(--tree-line)) !important
      }
      html body .engineering-index .engineering-taxonomy > .taxonomy-node > .taxonomy-row::before{
        left:-30px !important;
        width:30px !important;
        border-top-color:var(--mechanics-tree-line,var(--tree-line)) !important
      }
      html body .engineering-index .taxonomy-row{
        min-height:48px !important;
        height:auto !important;
        gap:7px !important;
        padding:0 !important;
        overflow:visible !important;
        color:var(--mechanics-ink-soft,var(--reader-muted)) !important;
        scroll-margin-top:12px !important
      }
      html body .engineering-index .taxonomy-row .tree-dash{
        width:18px !important;
        flex:0 0 18px !important;
        min-height:48px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        color:var(--mechanics-ink-faint,var(--reader-faint)) !important;
        font-size:12px !important;
        font-weight:300 !important;
        opacity:1 !important
      }
      html body .engineering-index .taxonomy-label{
        color:inherit !important;
        font-size:15px !important;
        font-weight:300 !important;
        line-height:1.22 !important;
        transform:none !important;
        opacity:.72 !important
      }
      html body .engineering-index .engineering-taxonomy > .taxonomy-node > .taxonomy-row .taxonomy-label{
        font-size:16px !important;
        font-weight:300 !important;
        opacity:.78 !important
      }
      html body .engineering-index .taxonomy-children{
        margin-left:12px !important;
        padding-left:25px !important;
        border-left:1px solid var(--mechanics-tree-line,var(--tree-line)) !important
      }
      html body .engineering-index .taxonomy-node.is-mobile-collapsed > .taxonomy-children{
        display:block !important
      }
      html body .engineering-index .taxonomy-node.is-route > .taxonomy-row,
      html body .engineering-index .taxonomy-node.is-target > .taxonomy-row{
        color:var(--mechanics-ink-strong,var(--reader-text)) !important;
        font-weight:400 !important
      }
      html body .engineering-index .taxonomy-node.is-route > .taxonomy-row .taxonomy-label,
      html body .engineering-index .taxonomy-node.is-target > .taxonomy-row .taxonomy-label{
        opacity:1 !important;
        font-weight:400 !important
      }

      @media(max-width:430px){
        .mobile-database-titlebar.mobile-database-titlebar-v118{width:min(59vw,238px) !important}
        .mobile-database-titlebar-v118 .mobile-database-toggle{gap:9px !important}
        html body .mechanics-topbar .reader-tone-track-wrap,
        html body .mechanics-topbar .reader-tone-slider{width:76px !important}
        html body .mechanics-topbar{gap:8px !important;padding-right:8px !important}
        html body .mechanics-topbar .language-switch{font-size:8px !important}
      }

      @media(prefers-reduced-motion:reduce){
        html body .mechanics-shell > #engineering-index.engineering-index{transition:none !important}
      }
    }
  `;
  document.head.appendChild(style);

  if (mq.matches) {
    taxonomy.querySelectorAll('.taxonomy-node.is-mobile-collapsed').forEach(node => node.classList.remove('is-mobile-collapsed'));
  }
})();