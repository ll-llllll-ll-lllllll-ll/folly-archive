(() => {
  'use strict';

  const RL = window.RuinLanguage;
  if (!RL) return;

  const UI = {
    title:{zh:'墟构师宣言',en:'Manifesto of the Ruinwright',ja:'墟構師宣言'},
    mechanics:{zh:'墟构机械数据库 ↗',en:'Mechanism Archive ↗',ja:'墟構機械データベース ↗'},
    archive:{zh:'遗构馆 ↗',en:'Relic Archive ↗',ja:'遺構館 ↗'},
    contents:{zh:'章节',en:'Contents',ja:'目次'},
    loading:{zh:'正在读取文本…',en:'Loading text…',ja:'テキストを読み込み中…'},
    notes:{zh:'注释',en:'Notes',ja:'注釈'},
    groupManifesto:{zh:'宣言 / MANIFESTO',en:'MANIFESTO',ja:'宣言 / MANIFESTO'},
    groupStatement:{zh:'陈述 / STATEMENT',en:'STATEMENT',ja:'ステートメント / STATEMENT'},
    groupReference:{zh:'资料 / REFERENCE',en:'REFERENCE',ja:'資料 / REFERENCE'},
    close:{zh:'关闭章节',en:'Close contents',ja:'目次を閉じる'},
    open:{zh:'章节',en:'Contents',ja:'目次'},
    measureDown:{zh:'收窄文本',en:'Narrow text',ja:'本文幅を狭める'},
    measureUp:{zh:'放宽文本',en:'Widen text',ja:'本文幅を広げる'},
    fontDown:{zh:'减小字号',en:'Smaller type',ja:'文字を小さく'},
    fontUp:{zh:'增大字号',en:'Larger type',ja:'文字を大きく'},
    leadingDown:{zh:'减小行距',en:'Tighter leading',ja:'行間を狭く'},
    leadingUp:{zh:'增大行距',en:'Looser leading',ja:'行間を広げる'},
    reset:{zh:'重置排版',en:'Reset typography',ja:'組版をリセット'},
    loadError:{
      zh:'未能读取 manifesto.txt。',
      en:'The English manuscript is still being revised.',
      ja:'日本語原稿は現在編集中です。'
    }
  };

  const FILES = {
    zh:'manifesto.txt',
    en:'manifesto.en.txt',
    ja:'manifesto.ja.txt'
  };

  const GROUP_ORDER = ['manifesto','statement','reference'];
  const GROUP_KEY = {
    manifesto:'groupManifesto',
    statement:'groupStatement',
    reference:'groupReference'
  };
  const TENET_RE = /^第([一二三四五六七八九十]+)则[:：]/;
  const TENET_NUMBERS = new Map([
    ['一','01'],['二','02'],['三','03'],['四','04'],['五','05'],
    ['六','06'],['七','07'],['八','08'],['九','09'],['十','10']
  ]);

  const scroller = document.getElementById('manifesto-scroll');
  const documentEl = document.getElementById('manifesto-document');
  const indexEl = document.getElementById('manifesto-index');
  const indexNav = document.getElementById('manifesto-index-nav');
  const indexToggle = document.getElementById('manifesto-index-toggle');
  const indexClose = document.getElementById('manifesto-index-close');
  const popover = document.getElementById('footnote-popover');
  const popoverNumber = document.getElementById('footnote-popover-number');
  const popoverText = document.getElementById('footnote-popover-text');
  const measureValue = document.getElementById('reader-measure-value');
  const fontValue = document.getElementById('reader-font-value');
  const leadingValue = document.getElementById('reader-leading-value');
  const root = document.documentElement;

  if (!scroller || !documentEl || !indexNav || !popover) return;

  let lang = RL.read();
  let activeTargets = [];
  let indexLinks = [];
  let hideTimer = 0;
  let scrollRaf = 0;
  let loadToken = 0;

  const SETTINGS_KEY = 'ruin-manifesto-reader-v7';
  const DEFAULT_SETTINGS = {measure:820,font:16.5,leading:1.96};
  let settings = {...DEFAULT_SETTINGS};

  function clamp(value,min,max) {
    return Math.max(min,Math.min(max,value));
  }

  function readSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        settings.measure = clamp(Number(saved.measure) || DEFAULT_SETTINGS.measure,620,1040);
        settings.font = clamp(Number(saved.font) || DEFAULT_SETTINGS.font,14,20);
        settings.leading = clamp(Number(saved.leading) || DEFAULT_SETTINGS.leading,1.55,2.3);
      }
    } catch (_) {}
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings)); } catch (_) {}
  }

  function applySettings(save=false) {
    root.style.setProperty('--manifesto-measure',`${settings.measure}px`);
    root.style.setProperty('--manifesto-font-size',`${settings.font}px`);
    root.style.setProperty('--manifesto-leading',String(settings.leading));
    if (measureValue) measureValue.textContent = String(Math.round(settings.measure));
    if (fontValue) fontValue.textContent = settings.font.toFixed(settings.font % 1 ? 1 : 0);
    if (leadingValue) leadingValue.textContent = settings.leading.toFixed(2);
    if (save) saveSettings();
  }

  function adjustSetting(action) {
    switch (action) {
      case 'measure-down': settings.measure = clamp(settings.measure - 40,620,1040); break;
      case 'measure-up': settings.measure = clamp(settings.measure + 40,620,1040); break;
      case 'font-down': settings.font = clamp(settings.font - .5,14,20); break;
      case 'font-up': settings.font = clamp(settings.font + .5,14,20); break;
      case 'leading-down': settings.leading = clamp(Number((settings.leading - .05).toFixed(2)),1.55,2.3); break;
      case 'leading-up': settings.leading = clamp(Number((settings.leading + .05).toFixed(2)),1.55,2.3); break;
      case 'reset': settings = {...DEFAULT_SETTINGS}; break;
      default: return;
    }
    applySettings(true);
  }

  function groupLabel(group) {
    const key = GROUP_KEY[group] || GROUP_KEY.manifesto;
    return UI[key][lang] || UI[key].zh;
  }

  function normalize(raw) {
    return String(raw || '').replace(/\r\n?/g,'\n').replace(/\u00a0/g,' ');
  }

  function parseDocument(raw) {
    const text = normalize(raw);
    if (!/^#\s/m.test(text) && !/^@title\s/m.test(text)) return parseLegacy(text);

    const lines = text.split('\n');
    const meta = {title:UI.title[lang],subtitle:'',epigraph:'',epigraphSource:''};
    const definitions = new Map();
    const sections = [];

    let group = 'manifesto';
    let currentSection = null;
    let currentSubsection = null;
    let paragraph = [];
    let footnoteMode = false;
    let lastImage = null;

    const targetBlocks = () => {
      if (currentSubsection) return currentSubsection.blocks;
      if (currentSection) return currentSection.blocks;
      return null;
    };

    const flushParagraph = () => {
      if (!paragraph.length) return;
      const content = paragraph.join(' ').trim();
      paragraph = [];
      if (!content) return;
      const blocks = targetBlocks();
      if (blocks) blocks.push({type:'paragraph',text:content});
    };

    const beginSection = title => {
      flushParagraph();
      currentSubsection = null;
      currentSection = {
        title:title.trim(),
        subtitle:'',
        group,
        blocks:[],
        subsections:[]
      };
      sections.push(currentSection);
      lastImage = null;
    };

    const beginSubsection = title => {
      flushParagraph();
      if (!currentSection) beginSection(lang === 'zh' ? '正文' : 'Text');
      currentSubsection = {title:title.trim(),blocks:[]};
      currentSection.subsections.push(currentSubsection);
      lastImage = null;
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();

      if (footnoteMode) {
        const fm = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
        if (fm) definitions.set(fm[1],fm[2].trim());
        continue;
      }

      if (!line) {
        flushParagraph();
        continue;
      }

      let m;
      if ((m=line.match(/^@title\s+(.+)$/))) { meta.title=m[1].trim(); continue; }
      if ((m=line.match(/^@subtitle\s+(.+)$/))) { meta.subtitle=m[1].trim(); continue; }
      if ((m=line.match(/^@epigraph\s+(.+)$/))) { meta.epigraph=m[1].trim(); continue; }
      if ((m=line.match(/^@epigraph-source\s+(.+)$/))) { meta.epigraphSource=m[1].trim(); continue; }
      if ((m=line.match(/^@group\s+(manifesto|statement|reference)$/))) {
        flushParagraph();
        group=m[1];
        currentSubsection=null;
        continue;
      }
      if ((m=line.match(/^#\s+(.+)$/))) { beginSection(m[1]); continue; }
      if ((m=line.match(/^##\s+(.+)$/))) { beginSubsection(m[1]); continue; }
      if ((m=line.match(/^@section-subtitle\s+(.+)$/))) {
        if (currentSection) currentSection.subtitle=m[1].trim();
        continue;
      }
      if ((m=line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/))) {
        flushParagraph();
        const blocks=targetBlocks();
        if (blocks) {
          lastImage={type:'image',alt:m[1].trim(),src:m[2].trim(),caption:''};
          blocks.push(lastImage);
        }
        continue;
      }
      if ((m=line.match(/^@caption\s+(.+)$/))) {
        flushParagraph();
        if (lastImage) lastImage.caption=m[1].trim();
        else {
          const blocks=targetBlocks();
          if (blocks) blocks.push({type:'caption',text:m[1].trim()});
        }
        continue;
      }
      if ((m=line.match(/^@bib\s+(.+)$/))) {
        flushParagraph();
        const blocks=targetBlocks();
        if (blocks) blocks.push({type:'bibliography',text:m[1].trim()});
        continue;
      }
      if (line === '@footnotes') {
        flushParagraph();
        footnoteMode=true;
        continue;
      }

      paragraph.push(line);
    }
    flushParagraph();

    return {meta,definitions,sections};
  }

  function parseLegacy(raw) {
    const blocks = raw.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
    const meta = {title:blocks.shift() || UI.title[lang],subtitle:'',epigraph:'',epigraphSource:''};
    const definitions = new Map();
    const sections = [];
    const headingRE = lang === 'en'
      ? /^(Prelude|Ruinwright Tenets|After Ruinwrighting)/i
      : /^(序[:：]|墟構師の建造十則|墟構のあとで)/;

    let section=null;
    for (const block of blocks) {
      const fm=block.match(/^\[\^([^\]]+)\]:\s*([\s\S]+)$/);
      if (fm) { definitions.set(fm[1],fm[2].trim()); continue; }
      if (headingRE.test(block)) {
        section={title:block,subtitle:'',group:'manifesto',blocks:[],subsections:[]};
        sections.push(section);
      } else {
        if (!section) {
          section={title:lang==='en'?'Prelude: After Architecture':'序：建築のあとで',subtitle:'',group:'manifesto',blocks:[],subsections:[]};
          sections.push(section);
        }
        section.blocks.push({type:'paragraph',text:block});
      }
    }
    return {meta,definitions,sections};
  }

  function makeFootnoteAnchor(id,noteText) {
    const anchor=document.createElement('span');
    anchor.className='footnote-anchor';
    anchor.tabIndex=0;
    anchor.dataset.noteId=id;
    anchor.dataset.noteNumber=id;
    anchor.dataset.noteText=noteText;
    anchor.setAttribute('role','button');
    anchor.setAttribute('aria-label',`${UI.notes[lang]} ${id}`);
    const sup=document.createElement('sup');
    sup.textContent=id;
    anchor.appendChild(sup);
    return anchor;
  }

  function appendTextAndLinks(frag,text) {
    const urlRE=/https?:\/\/[^\s]+/g;
    let cursor=0;
    for (const match of text.matchAll(urlRE)) {
      if (match.index > cursor) frag.append(document.createTextNode(text.slice(cursor,match.index)));
      let url=match[0];
      let trailing='';
      while (/[.,;:，。；：)）]$/.test(url)) {
        trailing=url.slice(-1)+trailing;
        url=url.slice(0,-1);
      }
      const a=document.createElement('a');
      a.href=url;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.textContent=url;
      frag.appendChild(a);
      if (trailing) frag.append(document.createTextNode(trailing));
      cursor=match.index+match[0].length;
    }
    if (cursor<text.length) frag.append(document.createTextNode(text.slice(cursor)));
  }

  function renderInline(text,definitions,usedNoteIds) {
    const frag=document.createDocumentFragment();
    let cursor=0;
    const matches=[...text.matchAll(/\[\^([^\]]+)\]/g)];
    for (const match of matches) {
      const before=text.slice(cursor,match.index);
      if (before) appendTextAndLinks(frag,before);
      const id=match[1];
      const noteText=definitions.get(id);
      if (noteText) {
        usedNoteIds.add(id);
        frag.appendChild(makeFootnoteAnchor(id,noteText));
      } else {
        frag.append(document.createTextNode(match[0]));
      }
      cursor=match.index+match[0].length;
    }
    if (cursor<text.length) appendTextAndLinks(frag,text.slice(cursor));
    return frag;
  }

  function plainHeading(text) {
    return String(text || '').replace(/\[\^[^\]]+\]/g,'').trim();
  }

  function paragraphClass(text) {
    if (/^(然而，废墟出现了。|墟构，也从建筑之后开始。|只要现代废墟仍在诞生，墟构师便会走向下一处遗构。)$/.test(text)) {
      return 'manifesto-emphasis';
    }
    if (/^没有两处废墟以同一种方式崩解。$/.test(text)) return 'manifesto-lead';
    return '';
  }

  function renderBlocks(parent,blocks,definitions,usedNoteIds) {
    let bibliographyWrap=null;
    for (const block of blocks) {
      if (block.type !== 'bibliography') bibliographyWrap=null;

      if (block.type === 'paragraph') {
        const p=document.createElement('p');
        const cls=paragraphClass(block.text);
        if (cls) p.className=cls;
        p.appendChild(renderInline(block.text,definitions,usedNoteIds));
        parent.appendChild(p);
        continue;
      }

      if (block.type === 'bibliography') {
        if (!bibliographyWrap) {
          bibliographyWrap=document.createElement('div');
          bibliographyWrap.className='bibliography-list';
          parent.appendChild(bibliographyWrap);
        }
        const p=document.createElement('p');
        p.className='bibliography-entry';
        p.appendChild(renderInline(block.text,definitions,usedNoteIds));
        bibliographyWrap.appendChild(p);
        continue;
      }

      if (block.type === 'image') {
        const figure=document.createElement('figure');
        figure.className='manifesto-figure';
        const img=document.createElement('img');
        img.src=block.src;
        img.alt=block.alt || '';
        img.loading='lazy';
        img.decoding='async';
        figure.appendChild(img);
        if (block.caption) {
          const cap=document.createElement('figcaption');
          cap.textContent=block.caption;
          figure.appendChild(cap);
        }
        parent.appendChild(figure);
        continue;
      }

      if (block.type === 'caption') {
        const cap=document.createElement('p');
        cap.className='manifesto-caption';
        cap.textContent=block.text;
        parent.appendChild(cap);
      }
    }
  }

  function groupNumber(group) {
    return group==='statement' ? 2 : group==='reference' ? 3 : 1;
  }

  function sectionCode(group,sectionIndex) {
    return `${groupNumber(group)}.${sectionIndex+1}.0`;
  }

  function subsectionCode(group,sectionIndex,subIndex) {
    return `${groupNumber(group)}.${sectionIndex+1}.${subIndex+1}`;
  }

  function tenetNumber(title) {
    const m=title.match(TENET_RE);
    if (!m) return null;
    return TENET_NUMBERS.get(m[1]) || '';
  }

  function renderDocument(raw) {
    const parsed=parseDocument(raw);
    const usedNoteIds=new Set();
    documentEl.replaceChildren();

    const titleBlock=document.createElement('header');
    titleBlock.className='manifesto-title-block';

    const h1=document.createElement('h1');
    h1.textContent=parsed.meta.title || UI.title[lang];
    titleBlock.appendChild(h1);

    if (parsed.meta.subtitle) {
      const sub=document.createElement('div');
      sub.className='manifesto-title-subtitle';
      sub.textContent=parsed.meta.subtitle;
      titleBlock.appendChild(sub);
    }

    const cover=document.createElement('figure');
    cover.className='manifesto-cover';
    const coverImg=document.createElement('img');
    coverImg.src='manifesto-assets/broken-frame.png';
    coverImg.alt=lang==='en' ? 'Broken Frame' : lang==='ja' ? '壊れたフレーム' : '破碎画框';
    coverImg.decoding='async';
    coverImg.fetchPriority='high';
    cover.appendChild(coverImg);
    titleBlock.appendChild(cover);

    if (parsed.meta.epigraph) {
      const epi=document.createElement('div');
      epi.className='manifesto-epigraph';
      const quote=document.createElement('blockquote');
      quote.textContent=parsed.meta.epigraph;
      epi.appendChild(quote);
      if (parsed.meta.epigraphSource) {
        const cite=document.createElement('cite');
        cite.textContent=parsed.meta.epigraphSource;
        epi.appendChild(cite);
      }
      titleBlock.appendChild(epi);
    }
    documentEl.appendChild(titleBlock);

    const perGroupCount={manifesto:0,statement:0,reference:0};
    let previousGroup=null;

    parsed.sections.forEach((section,sectionIndex)=>{
      const group=GROUP_ORDER.includes(section.group)?section.group:'manifesto';
      const groupIndex=perGroupCount[group]++;
      const sec=document.createElement('section');
      sec.className='manifesto-section';
      sec.dataset.group=group;
      sec.dataset.manifestoSection='';
      sec.id=`section-${String(sectionIndex).padStart(2,'0')}`;
      if (group!==previousGroup) sec.classList.add('group-start');

      if (group!==previousGroup) {
        const kicker=document.createElement('div');
        kicker.className='manifesto-group-kicker';
        kicker.textContent=groupLabel(group);
        sec.appendChild(kicker);
      }

      const header=document.createElement('header');
      header.className='manifesto-section-header';
      const code=document.createElement('div');
      code.className='manifesto-section-number';
      code.textContent=sectionCode(group,groupIndex);
      const titleWrap=document.createElement('div');
      titleWrap.className='manifesto-section-title-wrap';
      const h2=document.createElement('h2');
      h2.appendChild(renderInline(section.title,parsed.definitions,usedNoteIds));
      sec.dataset.indexLabel=plainHeading(section.title);
      titleWrap.appendChild(h2);
      if (section.subtitle) {
        const st=document.createElement('div');
        st.className='manifesto-section-subtitle';
        st.textContent=section.subtitle;
        titleWrap.appendChild(st);
      }
      header.append(code,titleWrap);
      sec.appendChild(header);

      renderBlocks(sec,section.blocks,parsed.definitions,usedNoteIds);

      section.subsections.forEach((sub,subIndex)=>{
        const subEl=document.createElement('section');
        const tnum=tenetNumber(sub.title);
        subEl.className='manifesto-subsection'+(tnum?' tenet':'');
        subEl.dataset.manifestoSubsection='';
        subEl.id=`${sec.id}-sub-${String(subIndex).padStart(2,'0')}`;

        const subHeader=document.createElement('header');
        subHeader.className='manifesto-subsection-header';
        const subCode=document.createElement('div');
        subCode.className='manifesto-subsection-number';
        subCode.textContent=subsectionCode(group,groupIndex,subIndex);
        const h3=document.createElement('h3');
        h3.appendChild(renderInline(sub.title,parsed.definitions,usedNoteIds));
        subEl.dataset.indexLabel=plainHeading(sub.title);
        subHeader.append(subCode,h3);
        subEl.appendChild(subHeader);
        renderBlocks(subEl,sub.blocks,parsed.definitions,usedNoteIds);
        sec.appendChild(subEl);
      });

      documentEl.appendChild(sec);
      previousGroup=group;
    });

    if (usedNoteIds.size) {
      const notes=document.createElement('section');
      notes.className='manifesto-footnotes';
      notes.id='manifesto-notes';
      const h2=document.createElement('h2');
      h2.textContent=UI.notes[lang];
      const ol=document.createElement('ol');
      [...usedNoteIds]
        .sort((a,b)=>(Number(a)||0)-(Number(b)||0))
        .forEach(id=>{
          const li=document.createElement('li');
          li.id=`fn-${id}`;
          li.appendChild(renderInline(parsed.definitions.get(id) || '',new Map(),new Set()));
          ol.appendChild(li);
        });
      notes.append(h2,ol);
      documentEl.appendChild(notes);
    }

    buildIndex();
    bindFootnotes();
    collectTargets();
    updateActiveIndex();

    /* Deep links from the portfolio are resolved only after the manifesto text
       has been fetched and rendered, so a URL such as #section-02 lands on the
       authored “broken frame” section instead of the top of the page. */
    const hashId=decodeURIComponent(String(location.hash || '').replace(/^#/,''));
    if (hashId) {
      requestAnimationFrame(()=>{
        const target=document.getElementById(hashId);
        if (!target) return;
        scroller.scrollTop=Math.max(0,target.offsetTop-24);
        updateActiveIndex();
      });
    }
  }

  function buildIndex() {
    indexNav.replaceChildren();
    const sections=[...documentEl.querySelectorAll('[data-manifesto-section]')];
    const buckets=new Map();

    for (const group of GROUP_ORDER) {
      const groupSections=sections.filter(sec=>sec.dataset.group===group);
      if (!groupSections.length) continue;

      const wrap=document.createElement('div');
      wrap.className='manifesto-index-group';
      wrap.dataset.group=group;

      const label=document.createElement('div');
      label.className='manifesto-index-group-label';
      label.textContent=groupLabel(group);
      wrap.appendChild(label);

      groupSections.forEach((sec,groupIndex)=>{
        const link=createIndexLink(sec.id,sec.dataset.indexLabel || sec.querySelector(':scope > .manifesto-section-header h2')?.textContent || '',sectionCode(group,groupIndex),false,false);
        wrap.appendChild(link);

        [...sec.querySelectorAll(':scope > .manifesto-subsection')].forEach((sub,subIndex)=>{
          const title=sub.dataset.indexLabel || sub.querySelector(':scope > .manifesto-subsection-header h3')?.textContent || '';
          const tnum=tenetNumber(title);
          const subLink=createIndexLink(sub.id,title,subsectionCode(group,groupIndex,subIndex),true,Boolean(tnum));
          wrap.appendChild(subLink);
        });
      });

      buckets.set(group,wrap);
      indexNav.appendChild(wrap);
    }
  }

  function createIndexLink(targetId,label,code,isSub,isTenet) {
    const a=document.createElement('a');
    a.href=`#${targetId}`;
    a.className='manifesto-index-link'+(isSub?' is-sub':'')+(isTenet?' is-tenet':'');
    a.dataset.sectionLink=targetId;

    const codeEl=document.createElement('span');
    codeEl.className='index-code';
    codeEl.textContent=code;
    const labelEl=document.createElement('span');
    labelEl.textContent=label;
    a.append(codeEl,labelEl);

    a.addEventListener('click',event=>{
      event.preventDefault();
      const target=document.getElementById(targetId);
      if (!target) return;
      scroller.scrollTo({top:Math.max(0,target.offsetTop-24),behavior:'smooth'});
      history.replaceState(null,'',`#${targetId}`);
    });
    return a;
  }

  function collectTargets() {
    activeTargets=[...documentEl.querySelectorAll('[data-manifesto-section],[data-manifesto-subsection]')];
    indexLinks=[...indexNav.querySelectorAll('[data-section-link]')];
  }

  function updateActiveIndex() {
    scrollRaf=0;
    if (!activeTargets.length) return;
    const probe=scroller.scrollTop+Math.min(scroller.clientHeight*.28,220);
    let active=activeTargets[0].id;
    for (const target of activeTargets) {
      if (target.offsetTop<=probe) active=target.id;
      else break;
    }
    indexLinks.forEach(link=>link.classList.toggle('active',link.dataset.sectionLink===active));
    const activeLink=indexLinks.find(link=>link.dataset.sectionLink===active);
    activeLink?.scrollIntoView({block:'nearest'});
  }

  function scheduleActiveIndex() {
    if (!scrollRaf) scrollRaf=requestAnimationFrame(updateActiveIndex);
  }

  function showPopover(anchor) {
    clearTimeout(hideTimer);
    popoverNumber.textContent=String(anchor.dataset.noteNumber || '').padStart(2,'0');
    popoverText.textContent=anchor.dataset.noteText || '';
    popover.hidden=false;
    popover.dataset.anchor=anchor.dataset.noteId || '';

    const rect=anchor.getBoundingClientRect();
    const width=Math.min(420,innerWidth-28);
    const left=Math.min(Math.max(14,rect.left+rect.width/2-width/2),innerWidth-width-14);
    popover.style.left=`${left}px`;
    popover.style.top='14px';
    const h=popover.getBoundingClientRect().height;
    let top=rect.bottom+10;
    if (top+h>innerHeight-14) top=rect.top-h-10;
    popover.style.top=`${Math.max(14,top)}px`;
  }

  function hidePopoverSoon() {
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{popover.hidden=true;},100);
  }

  function bindFootnotes() {
    documentEl.querySelectorAll('.footnote-anchor').forEach(anchor=>{
      anchor.addEventListener('mouseenter',()=>showPopover(anchor));
      anchor.addEventListener('mouseleave',hidePopoverSoon);
      anchor.addEventListener('focus',()=>showPopover(anchor));
      anchor.addEventListener('blur',hidePopoverSoon);
      anchor.addEventListener('click',event=>{
        event.preventDefault();
        const same=!popover.hidden && popover.dataset.anchor===anchor.dataset.noteId;
        if (same) popover.hidden=true;
        else showPopover(anchor);
      });
    });
  }

  async function loadText(nextLang) {
    const token=++loadToken;
    documentEl.innerHTML=`<div class="manifesto-loading">${UI.loading[nextLang]}</div>`;
    try {
      const response=await fetch(FILES[nextLang],{cache:'no-store'});
      if (!response.ok) throw new Error(String(response.status));
      const raw=await response.text();
      if (token===loadToken) renderDocument(raw);
    } catch (_) {
      if (token!==loadToken) return;
      renderDocument(`${UI.title[nextLang]}\n\n${UI.loadError[nextLang]}`);
    }
  }

  function openIndex() {
    document.body.classList.add('manifesto-index-open');
    indexToggle?.setAttribute('aria-expanded','true');
  }

  function closeIndex() {
    document.body.classList.remove('manifesto-index-open');
    indexToggle?.setAttribute('aria-expanded','false');
  }

  function syncUI() {
    RL.applyMap(UI,lang,document,false);
    document.title=UI.title[lang];
    if (indexToggle) {
      indexToggle.textContent=UI.open[lang];
      indexToggle.setAttribute('aria-label',UI.open[lang]);
    }
    if (indexClose) indexClose.setAttribute('aria-label',UI.close[lang]);

    const ariaMap={
      'measure-down':'measureDown','measure-up':'measureUp',
      'font-down':'fontDown','font-up':'fontUp',
      'leading-down':'leadingDown','leading-up':'leadingUp',
      'reset':'reset'
    };
    document.querySelectorAll('[data-reader-action]').forEach(button=>{
      const key=ariaMap[button.dataset.readerAction];
      if (key) button.setAttribute('aria-label',UI[key][lang]);
    });
  }

  document.querySelectorAll('[data-reader-action]').forEach(button=>{
    button.addEventListener('click',()=>adjustSetting(button.dataset.readerAction));
  });

  indexToggle?.addEventListener('click',()=>{
    if (document.body.classList.contains('manifesto-index-open')) closeIndex();
    else openIndex();
  });
  indexClose?.addEventListener('click',closeIndex);

  document.addEventListener('click',event=>{
    if (!document.body.classList.contains('manifesto-index-open')) return;
    if (indexEl?.contains(event.target) || indexToggle?.contains(event.target)) return;
    closeIndex();
  });

  document.addEventListener('keydown',event=>{
    if (event.key==='Escape') {
      closeIndex();
      popover.hidden=true;
    }
  });

  popover.addEventListener('mouseenter',()=>clearTimeout(hideTimer));
  popover.addEventListener('mouseleave',hidePopoverSoon);
  scroller.addEventListener('scroll',scheduleActiveIndex,{passive:true});
  window.addEventListener('resize',()=>{
    popover.hidden=true;
    scheduleActiveIndex();
    if (innerWidth>900) closeIndex();
  },{passive:true});

  window.addEventListener('ruinlanguagechange',event=>{
    lang=event.detail.lang;
    syncUI();
    popover.hidden=true;
    scroller.scrollTop=0;
    loadText(lang);
  });

  readSettings();
  applySettings(false);
  syncUI();
  loadText(lang);
})();
