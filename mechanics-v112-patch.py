from pathlib import Path

p = Path('mechanics.html')
s = p.read_text(encoding='utf-8')

s = s.replace('mechanics.css?v=111', 'mechanics.css?v=112', 1)

style = r'''
  <style id="mechanics-v112-file-name-alignment">
    /* v112 · align rack filenames with the paper's shallow lower perspective edge */
    .file-tray-name{
      left:50% !important;
      right:auto !important;
      top:58% !important;
      bottom:auto !important;
      width:82% !important;
      max-width:82% !important;
      min-height:20px !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      text-align:center !important;
      white-space:normal !important;
      overflow:hidden !important;
      text-overflow:clip !important;
      overflow-wrap:anywhere !important;
      line-height:1.05 !important;
      transform-origin:center center !important;
      transform:translate(-50%,-50%) rotate(-4deg) !important;
      pointer-events:none !important
    }

    .file-tray-item.is-active .file-tray-name{
      left:50% !important;
      right:auto !important;
      top:52% !important;
      bottom:auto !important;
      width:82% !important;
      max-width:82% !important;
      transform:translate(-50%,-50%) rotate(-4deg) !important;
      text-align:center !important
    }

    @media(max-width:800px){
      .file-tray-name{
        top:57% !important;
        width:80% !important;
        max-width:80% !important;
        transform:translate(-50%,-50%) rotate(-4deg) !important
      }
      .file-tray-item.is-active .file-tray-name{
        top:52% !important;
        transform:translate(-50%,-50%) rotate(-4deg) !important
      }
    }
  </style>
'''

if 'mechanics-v112-file-name-alignment' not in s:
    s = s.replace('</head>', style + '\n</head>', 1)

p.write_text(s, encoding='utf-8')
