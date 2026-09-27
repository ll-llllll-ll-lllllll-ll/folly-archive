from pathlib import Path

# Update display title only; keep internal id/folder stable.
data = Path('mechanics-data.js')
s = data.read_text(encoding='utf-8')
s = s.replace("label: L('爆炸鲸', 'Exploding Whale', '爆発するクジラ')", "label: L('“鲸爆”', 'Exploding Whale', '爆発するクジラ')", 1)
data.write_text(s, encoding='utf-8')

html = Path('mechanics.html')
h = html.read_text(encoding='utf-8')
h = h.replace('mechanics.css?v=108', 'mechanics.css?v=111')
h = h.replace('mechanics-data.js?v=110', 'mechanics-data.js?v=111')

style = r'''
  <style id="mechanics-v111-layout-polish">
    /* v111 · empty-state clearance / compact footer / calmer file silhouette */
    .sheet-stack.is-empty .archive-sheet{
      width:min(72%,820px) !important;
      height:min(61%,620px) !important;
      min-height:440px !important;
      left:48% !important;
      top:45% !important;
      transform:translate(-50%,-50%) !important;
      z-index:18 !important
    }

    .sheet-footer{
      min-height:66px !important;
      grid-template-columns:minmax(0,1fr) auto !important;
      gap:14px !important;
      padding:9px 16px 10px !important
    }
    .sheet-title{
      font-size:15.5px !important;
      line-height:1.2 !important;
      font-weight:400 !important
    }
    .sheet-footer-side{
      min-width:92px !important;
      width:auto !important;
      justify-content:center !important
    }

    /* Keep the file body's upper and lower perspective edges close to parallel.
       The lower edge now has only a shallow rise instead of the exaggerated cut. */
    .file-tray-item::before,
    .file-tray-item::after{
      clip-path:polygon(0 96%,0 33%,25% 0,100% 0,100% 91%) !important
    }

    .file-tray-name{
      bottom:8px !important;
      transform-origin:left center !important;
      transform:rotate(-3deg) !important;
      line-height:1.05 !important
    }
    .file-tray-item.is-active .file-tray-name{
      left:50% !important;
      right:auto !important;
      top:50% !important;
      bottom:auto !important;
      width:82% !important;
      max-width:82% !important;
      transform:translate(-50%,-50%) rotate(-3deg) !important;
      text-align:center !important
    }

    @media(max-width:800px){
      .sheet-stack.is-empty .archive-sheet{
        height:min(58%,560px) !important;
        min-height:360px !important;
        top:43% !important
      }
      .sheet-footer{min-height:60px !important;padding:8px 12px !important}
      .sheet-title{font-size:14px !important}
    }
  </style>
'''

if 'mechanics-v111-layout-polish' not in h:
    h = h.replace('</head>', style + '\n</head>', 1)
html.write_text(h, encoding='utf-8')
